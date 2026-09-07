import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuthStore } from './auth'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface ChatMessage {
  id: string
  channel: string // 'global_lottery' | `room_${roomId}`
  senderId: string // 'system' | user uuid
  senderName: string
  senderAvatar: string
  isHost?: boolean
  isSystem?: boolean
  content: string
  createdAt: string
}

export const useChatStore = defineStore('chat', () => {
  const authStore = useAuthStore()

  // 存储各频道的聊天记录列表：key 为 channel 名称
  const channelMessages = ref<Record<string, ChatMessage[]>>({})
  
  // 各频道的未读消息数
  const unreadCounts = ref<Record<string, number>>({})

  // Supabase 实时广播频道句柄池
  const realtimeChannels = new Map<string, RealtimeChannel>()

  // 跨标签页同步广播总线
  let broadcastBus: BroadcastChannel | null = null
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      broadcastBus = new BroadcastChannel('lucky7_chat_bus')
      broadcastBus.onmessage = (event) => {
        const { type, payload } = event.data || {}
        if (type === 'NEW_CHAT_MESSAGE' && payload) {
          appendMessageLocally(payload.channel, payload, false)
        }
      }
    } catch (e) {
      console.warn('Chat BroadcastChannel init error:', e)
    }
  }

  // 获取指定频道的聊天消息
  function getMessages(channel: string): ChatMessage[] {
    if (!channelMessages.value[channel]) {
      initChannel(channel)
    }
    return channelMessages.value[channel] || []
  }

  // 初始化频道（读取本地缓存、加入实时广播监听）
  function initChannel(channel: string) {
    if (!channelMessages.value[channel]) {
      // 尝试从 localStorage 恢复最近 50 条消息
      const localKey = `lucky7_chat_${channel}`
      try {
        const saved = localStorage.getItem(localKey)
        if (saved) {
          channelMessages.value[channel] = JSON.parse(saved)
        } else {
          channelMessages.value[channel] = getDefaultWelcomeMessages(channel)
        }
      } catch {
        channelMessages.value[channel] = getDefaultWelcomeMessages(channel)
      }
    }

    // 初始化 Supabase 数据库拉取与 Realtime Broadcast 订阅
    if (isSupabaseConfigured()) {
      // 1. 从 chat_messages 表拉取最新历史记录
      supabase
        .from('chat_messages')
        .select('*')
        .eq('channel', channel)
        .order('created_at', { ascending: false })
        .limit(40)
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            const dbMsgs: ChatMessage[] = data.reverse().map((r: any) => ({
              id: r.id,
              channel: r.channel,
              senderId: r.sender_id,
              senderName: r.sender_name,
              senderAvatar: r.sender_avatar || '',
              isSystem: Boolean(r.is_system),
              isHost: Boolean(r.is_host),
              content: r.content,
              createdAt: r.created_at
            }))
            channelMessages.value[channel] = dbMsgs
          }
        })

      // 2. 监听实时广播
      if (!realtimeChannels.has(channel)) {
        try {
          const sub = supabase
            .channel(`chat_${channel}`)
            .on('broadcast', { event: 'new_message' }, ({ payload }) => {
              if (payload) {
                appendMessageLocally(channel, payload as ChatMessage, false)
              }
            })
            .subscribe()

          realtimeChannels.set(channel, sub)
        } catch (err) {
          console.warn(`Supabase chat channel subscribe error for ${channel}:`, err)
        }
      }
    }
  }

  // 默认欢迎公告消息
  function getDefaultWelcomeMessages(channel: string): ChatMessage[] {
    const isLottery = channel === 'global_lottery'
    return [
      {
        id: `sys_welcome_${Date.now()}`,
        channel,
        senderId: 'system',
        senderName: '系统公告',
        senderAvatar: '',
        isSystem: true,
        content: isLottery
          ? '欢迎来到全服定时开奖公共频道！文明交流，理智投注，祝大家好运连连！'
          : '欢迎进入对战房间！请文明竞技，保持准备状态，祝游戏愉快！',
        createdAt: new Date().toISOString()
      }
    ]
  }

  // 本地追加消息并保存
  function appendMessageLocally(channel: string, msg: ChatMessage, broadcast = true) {
    if (!channelMessages.value[channel]) {
      channelMessages.value[channel] = []
    }

    // 去重
    const exists = channelMessages.value[channel].some(m => m.id === msg.id)
    if (exists) return

    channelMessages.value[channel].push(msg)

    // 最多保留 80 条消息
    if (channelMessages.value[channel].length > 80) {
      channelMessages.value[channel] = channelMessages.value[channel].slice(-80)
    }

    // 持久化到 localStorage
    try {
      localStorage.setItem(`lucky7_chat_${channel}`, JSON.stringify(channelMessages.value[channel]))
    } catch {
      // 忽略配额超限错误
    }

    if (broadcast) {
      // 1. 跨标签页广播
      broadcastBus?.postMessage({
        type: 'NEW_CHAT_MESSAGE',
        payload: msg
      })

      // 2. Supabase 实时广播与持久化
      if (isSupabaseConfigured()) {
        const sub = realtimeChannels.get(channel)
        if (sub) {
          sub.send({
            type: 'broadcast',
            event: 'new_message',
            payload: msg
          })
        }

        // 异步写入 chat_messages 表
        supabase
          .from('chat_messages')
          .insert({
            channel,
            sender_id: msg.senderId,
            sender_name: msg.senderName,
            sender_avatar: msg.senderAvatar,
            is_system: msg.isSystem || false,
            is_host: msg.isHost || false,
            content: msg.content
          })
          .then()
      }
    }
  }

  // 发送玩家聊天消息
  function sendMessage(
    channel: string,
    content: string,
    options?: { isHost?: boolean }
  ): ChatMessage | null {
    const text = content.trim()
    if (!text) return null

    const profile = authStore.profile
    const msg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      channel,
      senderId: profile?.id || 'anonymous',
      senderName: profile?.nickname || '热心玩家',
      senderAvatar: profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.id || 'lucky'}`,
      isHost: options?.isHost || false,
      isSystem: false,
      content: text,
      createdAt: new Date().toISOString()
    }

    appendMessageLocally(channel, msg, true)
    return msg
  }

  // 发送系统通报/开奖通知/房间事件
  function sendSystemAnnouncement(channel: string, content: string) {
    const text = content.trim()
    if (!text) return

    const msg: ChatMessage = {
      id: `sys_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      channel,
      senderId: 'system',
      senderName: '系统通报',
      senderAvatar: '',
      isSystem: true,
      content: text,
      createdAt: new Date().toISOString()
    }

    appendMessageLocally(channel, msg, true)
  }

  // 清空指定频道的聊天记录
  function clearChannel(channel: string) {
    channelMessages.value[channel] = getDefaultWelcomeMessages(channel)
    try {
      localStorage.removeItem(`lucky7_chat_${channel}`)
    } catch {
      // ignore
    }
  }

  // 释放资源
  function destroyChannel(channel: string) {
    if (realtimeChannels.has(channel)) {
      const sub = realtimeChannels.get(channel)
      sub?.unsubscribe()
      realtimeChannels.delete(channel)
    }
  }

  return {
    channelMessages,
    unreadCounts,
    getMessages,
    initChannel,
    sendMessage,
    sendSystemAnnouncement,
    clearChannel,
    destroyChannel
  }
})
