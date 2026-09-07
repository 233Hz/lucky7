import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import router from '@/router'
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

  // Cross-tab synchronization via BroadcastChannel
  let broadcastChannel: BroadcastChannel | null = null
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      broadcastChannel = new BroadcastChannel('lucky7_room_sync')
      broadcastChannel.onmessage = (event) => {
        const { type, payload } = event.data || {}
        if (type === 'ROOM_LIST_UPDATE') {
          activeRooms.value = payload
        } else if (type === 'ROOM_STATE_UPDATE') {
          if (currentRoom.value && currentRoom.value.id === payload.room?.id) {
            currentRoom.value = payload.room
            roomPlayers.value = payload.players || []
          }
        } else if (type === 'PLAYER_JOINED') {
          if (currentRoom.value && currentRoom.value.id === payload.roomId) {
            const exists = roomPlayers.value.some(p => p.user_id === payload.player.user_id)
            if (!exists) {
              roomPlayers.value.push(payload.player)
            }
          }
        } else if (type === 'PLAYER_LEFT') {
          if (currentRoom.value && currentRoom.value.id === payload.roomId) {
            roomPlayers.value = roomPlayers.value.filter(p => p.user_id !== payload.userId)
            if (roomPlayers.value.length === 0) {
              destroyRoom(payload.roomId)
            } else if (currentRoom.value.host_id === payload.userId) {
              currentRoom.value.host_id = roomPlayers.value[0].user_id
            }
          }
        } else if (type === 'PLAYER_KICKED') {
          if (currentRoom.value && currentRoom.value.id === payload.roomId) {
            if (authStore.profile && authStore.profile.id === payload.userId) {
              alert('您已被房主移出房间！')
              if (roomChannel) {
                roomChannel.unsubscribe()
                roomChannel = null
              }
              currentRoom.value = null
              roomPlayers.value = []
              router.push('/')
            } else {
              roomPlayers.value = roomPlayers.value.filter(p => p.user_id !== payload.userId)
              if (roomPlayers.value.length === 0) {
                destroyRoom(payload.roomId)
              }
            }
          }
        } else if (type === 'ROOM_DESTROYED') {
          if (currentRoom.value && currentRoom.value.id === payload.roomId) {
            alert('房间内所有玩家均已退出，房间已自动销毁！')
            if (roomChannel) {
              roomChannel.unsubscribe()
              roomChannel = null
            }
            currentRoom.value = null
            roomPlayers.value = []
            router.push('/')
          }
          activeRooms.value = activeRooms.value.filter(r => r.id !== payload.roomId)
        } else if (type === 'GAME_STARTED') {
          if (currentRoom.value && currentRoom.value.id === payload.roomId) {
            currentRoom.value.status = 'playing'
            roomPlayers.value.forEach(p => {
              p.status = 'playing'
            })
          }
        }
      }
    } catch (e) {
      console.warn('BroadcastChannel error:', e)
    }
  }

  // Getters
  const isHost = computed(() => {
    if (!currentRoom.value || !authStore.profile) return false
    return currentRoom.value.host_id === authStore.profile.id
  })

  const currentUserPlayer = computed(() => {
    if (!authStore.profile) return null
    return roomPlayers.value.find(p => p.user_id === authStore.profile?.id) || null
  })

  const isCurrentUserReady = computed(() => {
    return currentUserPlayer.value?.status === 'ready'
  })

  const readyCount = computed(() => {
    return roomPlayers.value.filter(p => p.status === 'ready').length
  })

  const allPlayersReady = computed(() => {
    return (
      roomPlayers.value.length > 0 &&
      roomPlayers.value.every(p => p.status === 'ready')
    )
  })

  const canStartGame = computed(() => {
    return isHost.value && roomPlayers.value.length >= 2 && allPlayersReady.value
  })

  // 获取指定游戏的联机房间列表
  async function fetchRooms(gameType?: string) {
    if (!isSupabaseConfigured()) {
      // 本地大厅房间（初始不生成机器人，仅真实创建的房间）
      if (activeRooms.value.length === 0) {
        activeRooms.value = [
          {
            id: 'mock_room_1',
            game_type: (gameType || 'zhajinhua') as GameRoom['game_type'],
            name: '新手欢乐对战桌',
            min_bet: 50,
            max_players: 6,
            status: 'waiting',
            host_id: 'host_player_1',
            round_state: {},
            created_at: new Date().toISOString()
          }
        ]
      }
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

  // 创建新房间：不生成也不需要任何机器人玩家
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

      // 房主入座：进入房间须先准备，初始为 waiting（未准备）
      const hostPlayer: RoomPlayer = {
        id: 'rp_' + Date.now(),
        room_id: newRoom.id,
        user_id: authStore.profile.id,
        seat: 0,
        chips: authStore.profile.chips,
        status: 'waiting',
        hand: [],
        current_bet: 0,
        profile: authStore.profile
      }

      currentRoom.value = newRoom
      // 严格不生成任何机器人玩家，仅包含房主本人
      roomPlayers.value = [hostPlayer]

      activeRooms.value.unshift(newRoom)
      broadcastChannel?.postMessage({
        type: 'ROOM_LIST_UPDATE',
        payload: activeRooms.value
      })
      broadcastChannel?.postMessage({
        type: 'ROOM_STATE_UPDATE',
        payload: { room: newRoom, players: roomPlayers.value }
      })

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

      // 房主坐上 0 号座位，须先准备，初始为 waiting
      await supabase.from('room_players').insert({
        room_id: created.id,
        user_id: authStore.profile.id,
        seat: 0,
        chips: authStore.profile.chips,
        status: 'waiting'
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

  // 加入房间：进入房间后须先准备（初始状态 waiting）
  async function joinRoom(room: GameRoom): Promise<boolean> {
    if (!authStore.profile) return false
    currentRoom.value = room

    if (!isSupabaseConfigured()) {
      const existing = roomPlayers.value.find(p => p.user_id === authStore.profile?.id)
      if (!existing) {
        const newPlayer: RoomPlayer = {
          id: 'rp_' + Date.now(),
          room_id: room.id,
          user_id: authStore.profile.id,
          seat: roomPlayers.value.length,
          chips: authStore.profile.chips,
          status: 'waiting', // 进入房间后须先准备
          hand: [],
          current_bet: 0,
          profile: authStore.profile
        }
        roomPlayers.value.push(newPlayer)
        broadcastChannel?.postMessage({
          type: 'PLAYER_JOINED',
          payload: { roomId: room.id, player: newPlayer }
        })
      }
      return true
    }

    try {
      loading.value = true
      await subscribeToRoom(room.id)

      // 检查是否已经在房间内
      const existing = roomPlayers.value.find(p => p.user_id === authStore.profile?.id)
      if (!existing && roomPlayers.value.length < room.max_players) {
        await supabase.from('room_players').insert({
          room_id: room.id,
          user_id: authStore.profile.id,
          seat: roomPlayers.value.length,
          chips: authStore.profile.chips,
          status: 'waiting' // 进入房间后须先准备
        })
        await fetchRoomPlayers(room.id)
      }
      return true
    } catch (err) {
      console.error('Join room error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // 玩家切换准备状态 (waiting <-> ready)
  async function toggleReady(userId?: string) {
    const targetId = userId || authStore.profile?.id
    if (!targetId) return

    const player = roomPlayers.value.find(p => p.user_id === targetId)
    if (!player) return

    const nextStatus = player.status === 'ready' ? 'waiting' : 'ready'
    player.status = nextStatus

    if (isSupabaseConfigured() && currentRoom.value) {
      await supabase
        .from('room_players')
        .update({ status: nextStatus })
        .eq('room_id', currentRoom.value.id)
        .eq('user_id', targetId)
    } else {
      broadcastChannel?.postMessage({
        type: 'ROOM_STATE_UPDATE',
        payload: { room: currentRoom.value, players: roomPlayers.value }
      })
    }
  }

  // 房主开始游戏：所有玩家均准备完毕后方可调用
  async function startGame(): Promise<boolean> {
    if (!currentRoom.value || !isHost.value) return false
    if (!canStartGame.value) return false

    currentRoom.value.status = 'playing'
    roomPlayers.value.forEach(p => {
      p.status = 'playing'
    })

    if (isSupabaseConfigured()) {
      await supabase
        .from('game_rooms')
        .update({ status: 'playing' })
        .eq('id', currentRoom.value.id)

      await supabase
        .from('room_players')
        .update({ status: 'playing' })
        .eq('room_id', currentRoom.value.id)
    } else {
      broadcastChannel?.postMessage({
        type: 'GAME_STARTED',
        payload: { roomId: currentRoom.value.id }
      })
      broadcastChannel?.postMessage({
        type: 'ROOM_STATE_UPDATE',
        payload: { room: currentRoom.value, players: roomPlayers.value }
      })
    }
    return true
  }

  // 重置回准备状态（一局结束后准备下一局）
  async function resetRoomToWaiting() {
    if (currentRoom.value) {
      currentRoom.value.status = 'waiting'
    }
    roomPlayers.value.forEach(p => {
      p.status = 'waiting'
      p.current_bet = 0
      p.hand = []
    })

    if (isSupabaseConfigured() && currentRoom.value) {
      try {
        await supabase
          .from('game_rooms')
          .update({ status: 'waiting' })
          .eq('id', currentRoom.value.id)

        await supabase
          .from('room_players')
          .update({ status: 'waiting' })
          .eq('room_id', currentRoom.value.id)
      } catch (err) {
        console.error('Reset room error:', err)
      }
    }

    broadcastChannel?.postMessage({
      type: 'ROOM_STATE_UPDATE',
      payload: { room: currentRoom.value, players: roomPlayers.value }
    })
  }

  // 辅助开发测试：添加本地模拟玩家入座（可选辅助）
  function addTestPlayer() {
    if (!currentRoom.value) return
    if (roomPlayers.value.length >= currentRoom.value.max_players) return

    const seatNum = roomPlayers.value.length
    const testId = `test_player_${Date.now().toString().slice(-4)}`
    const testNames = ['老赵', '大表哥', '阿美', '小明', '四叔']
    const nickname = testNames[seatNum % testNames.length]

    const testPlayer: RoomPlayer = {
      id: 'rp_' + Date.now(),
      room_id: currentRoom.value.id,
      user_id: testId,
      seat: seatNum,
      chips: 10000,
      status: 'waiting', // 初始未准备
      hand: [],
      current_bet: 0,
      profile: {
        id: testId,
        email: `${testId}@lucky7.com`,
        nickname,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${testId}`,
        chips: 10000,
        is_admin: false,
        created_at: new Date().toISOString()
      }
    }
    roomPlayers.value.push(testPlayer)
    broadcastChannel?.postMessage({
      type: 'ROOM_STATE_UPDATE',
      payload: { room: currentRoom.value, players: roomPlayers.value }
    })
  }

  // 销毁房间（当全员退出或无在桌玩家时自动触发）
  async function destroyRoom(roomId: string) {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('room_players').delete().eq('room_id', roomId)
        await supabase.from('game_rooms').delete().eq('id', roomId)
      } catch (e) {
        console.error('Destroy room error:', e)
      }
    }

    activeRooms.value = activeRooms.value.filter(r => r.id !== roomId)

    if (currentRoom.value?.id === roomId) {
      if (roomChannel) {
        roomChannel.unsubscribe()
        roomChannel = null
      }
      currentRoom.value = null
      roomPlayers.value = []
    }

    broadcastChannel?.postMessage({
      type: 'ROOM_DESTROYED',
      payload: { roomId }
    })
    broadcastChannel?.postMessage({
      type: 'ROOM_LIST_UPDATE',
      payload: activeRooms.value
    })
  }

  // 房主踢出指定玩家
  async function kickPlayer(userId: string): Promise<boolean> {
    if (!currentRoom.value || !isHost.value) return false
    if (authStore.profile && authStore.profile.id === userId) return false

    const roomId = currentRoom.value.id
    roomPlayers.value = roomPlayers.value.filter(p => p.user_id !== userId)

    if (isSupabaseConfigured()) {
      try {
        loading.value = true
        await supabase
          .from('room_players')
          .delete()
          .eq('room_id', roomId)
          .eq('user_id', userId)
      } catch (err) {
        console.error('Kick player error:', err)
      } finally {
        loading.value = false
      }
    }

    broadcastChannel?.postMessage({
      type: 'PLAYER_KICKED',
      payload: { roomId, userId }
    })
    broadcastChannel?.postMessage({
      type: 'ROOM_STATE_UPDATE',
      payload: { room: currentRoom.value, players: roomPlayers.value }
    })

    // 若房间已无玩家，则自动销毁
    if (roomPlayers.value.length === 0) {
      await destroyRoom(roomId)
    }

    return true
  }

  // 移出玩家（兼容旧调用）
  function removePlayer(userId: string) {
    if (isHost.value) {
      kickPlayer(userId)
    } else {
      roomPlayers.value = roomPlayers.value.filter(p => p.user_id !== userId)
      broadcastChannel?.postMessage({
        type: 'ROOM_STATE_UPDATE',
        payload: { room: currentRoom.value, players: roomPlayers.value }
      })
      if (currentRoom.value && roomPlayers.value.length === 0) {
        destroyRoom(currentRoom.value.id)
      }
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
            alert('房间内所有玩家均已退出，房间已自动销毁！')
            if (roomChannel) {
              roomChannel.unsubscribe()
              roomChannel = null
            }
            currentRoom.value = null
            roomPlayers.value = []
            router.push('/')
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const deletedUserId = (payload.old as { user_id?: string })?.user_id
            if (deletedUserId && authStore.profile?.id === deletedUserId) {
              alert('您已被房主移出房间！')
              if (roomChannel) {
                roomChannel.unsubscribe()
                roomChannel = null
              }
              currentRoom.value = null
              roomPlayers.value = []
              router.push('/')
              return
            }
          }
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

  // 退出当前房间（若房间内所有玩家均退出则自动销毁房间）
  async function leaveRoom() {
    if (!currentRoom.value) {
      roomPlayers.value = []
      return
    }

    const roomId = currentRoom.value.id
    const currentUserId = authStore.profile?.id

    if (roomChannel) {
      roomChannel.unsubscribe()
      roomChannel = null
    }

    if (isSupabaseConfigured() && currentUserId) {
      try {
        loading.value = true
        await supabase
          .from('room_players')
          .delete()
          .eq('room_id', roomId)
          .eq('user_id', currentUserId)

        // 检查房间内是否还有其他玩家
        const { count, error } = await supabase
          .from('room_players')
          .select('*', { count: 'exact', head: true })
          .eq('room_id', roomId)

        if (!error && (count === null || count === 0)) {
          // 所有玩家均已退出，自动销毁房间
          await destroyRoom(roomId)
        } else {
          // 若退出者为房主，将房主权限移交给下一位在桌玩家
          if (currentRoom.value.host_id === currentUserId) {
            const { data: nextPlayer } = await supabase
              .from('room_players')
              .select('user_id')
              .eq('room_id', roomId)
              .order('seat', { ascending: true })
              .limit(1)
              .maybeSingle()

            if (nextPlayer) {
              await supabase
                .from('game_rooms')
                .update({ host_id: nextPlayer.user_id })
                .eq('id', roomId)
            }
          }
        }
      } catch (err) {
        console.error('Leave room error:', err)
      } finally {
        loading.value = false
      }
    } else if (currentUserId) {
      const remainingPlayers = roomPlayers.value.filter(p => p.user_id !== currentUserId)
      if (remainingPlayers.length === 0) {
        // 所有玩家均已退出，自动销毁房间
        await destroyRoom(roomId)
      } else {
        if (currentRoom.value.host_id === currentUserId) {
          currentRoom.value.host_id = remainingPlayers[0].user_id
        }
        broadcastChannel?.postMessage({
          type: 'PLAYER_LEFT',
          payload: { roomId, userId: currentUserId }
        })
        broadcastChannel?.postMessage({
          type: 'ROOM_STATE_UPDATE',
          payload: { room: currentRoom.value, players: remainingPlayers }
        })
      }
    }

    currentRoom.value = null
    roomPlayers.value = []
  }

  return {
    activeRooms,
    currentRoom,
    roomPlayers,
    loading,
    isHost,
    currentUserPlayer,
    isCurrentUserReady,
    readyCount,
    allPlayersReady,
    canStartGame,
    fetchRooms,
    createRoom,
    joinRoom,
    toggleReady,
    startGame,
    resetRoomToWaiting,
    addTestPlayer,
    removePlayer,
    kickPlayer,
    destroyRoom,
    subscribeToRoom,
    leaveRoom
  }
})
