import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuthStore } from './auth'
import type { GameRoom, RoomPlayer } from '@/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

export const useRoomStore = defineStore('room', () => {
  const authStore = useAuthStore()
  const activeRooms = ref<GameRoom[]>([])
  const currentRoom = ref<GameRoom | null>(null)
  const roomPlayers = ref<RoomPlayer[]>([])
  const loading = ref<boolean>(false)
  let roomChannel: RealtimeChannel | null = null

  // 获取指定游戏的联机房间列表
  async function fetchRooms(gameType?: string) {
    if (!isSupabaseConfigured()) {
      // 本地模拟公共大厅房间
      activeRooms.value = [
        {
          id: 'mock_room_1',
          game_type: (gameType || 'zhajinhua') as GameRoom['game_type'],
          name: '新手欢乐桌',
          min_bet: 50,
          max_players: 6,
          status: 'waiting',
          host_id: 'host_01',
          round_state: {},
          created_at: new Date().toISOString()
        },
        {
          id: 'mock_room_2',
          game_type: (gameType || 'zhajinhua') as GameRoom['game_type'],
          name: '高手对决局',
          min_bet: 500,
          max_players: 6,
          status: 'waiting',
          host_id: 'host_02',
          round_state: {},
          created_at: new Date().toISOString()
        }
      ]
      return
    }

    try {
      loading.value = true
      let query = supabase
        .from('game_rooms')
        .select('*')
        .order('created_at', { ascending: false })

      if (gameType) {
        query = query.eq('game_type', gameType)
      }

      const { data, error } = await query
      if (!error && data) {
        activeRooms.value = data as GameRoom[]
      }
    } catch (err) {
      console.error('Fetch rooms error:', err)
    } finally {
      loading.value = false
    }
  }

  // 创建新房间
  async function createRoom(
    gameType: GameRoom['game_type'],
    name: string,
    minBet: number = 50,
    maxPlayers: number = 6
  ): Promise<GameRoom | null> {
    if (!authStore.profile) return null

    if (!isSupabaseConfigured()) {
      const newRoom: GameRoom = {
        id: 'local_room_' + Date.now(),
        game_type: gameType,
        name: name || `${authStore.profile.nickname}的房间`,
        min_bet: minBet,
        max_players: maxPlayers,
        status: 'waiting',
        host_id: authStore.profile.id,
        round_state: { phase: 'waiting', currentTurn: null },
        created_at: new Date().toISOString()
      }
      activeRooms.value.unshift(newRoom)
      currentRoom.value = newRoom
      roomPlayers.value = [
        {
          id: 'rp_' + Date.now(),
          room_id: newRoom.id,
          user_id: authStore.profile.id,
          seat: 0,
          chips: authStore.profile.chips,
          status: 'ready',
          hand: [],
          current_bet: 0,
          profile: authStore.profile
        }
      ]
      return newRoom
    }

    try {
      loading.value = true
      const { data: roomData, error: roomError } = await supabase
        .from('game_rooms')
        .insert({
          game_type: gameType,
          name: name || `${authStore.profile.nickname}的房间`,
          min_bet: minBet,
          max_players: maxPlayers,
          status: 'waiting',
          host_id: authStore.profile.id,
          round_state: { phase: 'waiting' }
        })
        .select()
        .single()

      if (roomError) throw roomError
      const created = roomData as GameRoom

      // 房主坐上 0 号座位
      await supabase.from('room_players').insert({
        room_id: created.id,
        user_id: authStore.profile.id,
        seat: 0,
        chips: authStore.profile.chips,
        status: 'ready'
      })

      currentRoom.value = created
      await subscribeToRoom(created.id)
      return created
    } catch (err) {
      console.error('Create room error:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // 监听并同步房间与在桌玩家状态 (Supabase Postgres Changes)
  async function subscribeToRoom(roomId: string) {
    if (roomChannel) {
      roomChannel.unsubscribe()
      roomChannel = null
    }

    if (!isSupabaseConfigured()) return

    // 初始拉取玩家
    await fetchRoomPlayers(roomId)

    // 监听 Supabase 实时行变更
    roomChannel = supabase
      .channel(`room_${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            currentRoom.value = payload.new as GameRoom
          } else if (payload.eventType === 'DELETE') {
            currentRoom.value = null
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` },
        () => {
          fetchRoomPlayers(roomId)
        }
      )
      .subscribe()
  }

  // 获取房间玩家列表
  async function fetchRoomPlayers(roomId: string) {
    if (!isSupabaseConfigured()) return
    try {
      const { data, error } = await supabase
        .from('room_players')
        .select('*, profile:profiles(*)')
        .eq('room_id', roomId)
        .order('seat', { ascending: true })

      if (!error && data) {
        roomPlayers.value = data as RoomPlayer[]
      }
    } catch (err) {
      console.error('Fetch room players error:', err)
    }
  }

  // 退出当前房间
  async function leaveRoom() {
    if (roomChannel) {
      roomChannel.unsubscribe()
      roomChannel = null
    }

    if (currentRoom.value && authStore.profile && isSupabaseConfigured()) {
      await supabase
        .from('room_players')
        .delete()
        .eq('room_id', currentRoom.value.id)
        .eq('user_id', authStore.profile.id)
    }

    currentRoom.value = null
    roomPlayers.value = []
  }

  return {
    activeRooms,
    currentRoom,
    roomPlayers,
    loading,
    fetchRooms,
    createRoom,
    subscribeToRoom,
    leaveRoom
  }
})
