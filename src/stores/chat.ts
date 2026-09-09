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
  expiresAt?: string
}

export const useChatStore = defineStore('chat', () => {
  const authStore = useAuthStore()

  // 全局消息有效时间（分钟），默认 120 分钟（2 小时）
  const messageTtlMinutes = ref<number>(
    Number(localStorage.getItem('lucky7_chat_message_ttl')) ||
    Number(localStorage.getItem('lucky7_chat_system_ttl')) ||
    120
  )
  const systemTtlMinutes = messageTtlMinutes // 兼容旧别名

  // 存储各频道的聊天记录列表：key 为 channel 名称
  const channelMessages = ref<Record<string, ChatMessage[]>>({})
  
  // 各频道的未读消息数
  const unreadCounts = ref<Record<string, number>>({})

  // Supabase 实时广播频道句柄池
  const realtimeChannels = new Map<string, RealtimeChannel>()

  // 从服务端同步消息 TTL 配置
  async function fetchTtlConfig() {
    if (!isSupabaseConfigured()) return
    try {
      const { data, error } = await supabase
        .from('system_configs')
        .select('*')
        .eq('key', 'chat_message_ttl')
        .maybeSingle()
      if (!error && data?.value) {
        const ttl = Number(data.value.message_ttl_minutes || data.value.system_ttl_minutes)
        if (ttl) {
          messageTtlMinutes.value = ttl
          localStorage.setItem('lucky7_chat_message_ttl', String(ttl))
        }
      }
    } catch (err) {
      console.warn('Fetch chat message ttl config error:', err)
    }
  }

  fetchTtlConfig()

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
      // 1. 从 chat_messages 表拉取最新历史记录（过滤未过期的消息）
      const nowIso = new Date().toISOString()
      supabase
        .from('chat_messages')
        .select('*')
        .eq('channel', channel)
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .order('created_at', { ascending: false })
        .limit(40)
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            const now = Date.now()
            const dbMsgs: ChatMessage[] = data
              .reverse()
              .map((r: any) => ({
                id: r.id,
                channel: r.channel,
                senderId: r.sender_id,
                senderName: r.sender_name,
                senderAvatar: r.sender_avatar || '',
                isSystem: Boolean(r.is_system),
                isHost: Boolean(r.is_host),
                content: r.content,
                createdAt: r.created_at,
                expiresAt: r.expires_at || undefined
              }))
              .filter(m => {
                if (m.expiresAt) {
                  return new Date(m.expiresAt).getTime() > now
                }
                return true
              })
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

    const now = Date.now()
    // 过滤已过期的消息（全量消息过期判定）
    if (msg.expiresAt && new Date(msg.expiresAt).getTime() <= now) {
      return
    }

    // 去重
    const exists = channelMessages.value[channel].some(m => m.id === msg.id)
    if (exists) return

    channelMessages.value[channel].push(msg)

    // 清理该频道中所有已过期的消息
    channelMessages.value[channel] = channelMessages.value[channel].filter(m => {
      if (m.expiresAt) {
        return new Date(m.expiresAt).getTime() > now
      }
      return true
    })

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
            content: msg.content,
            expires_at: msg.expiresAt || null
          })
          .then()
      }
    }
  }

  // 发送玩家聊天消息（同样赋予有效时间）
  function sendMessage(
    channel: string,
    content: string,
    options?: { isHost?: boolean }
  ): ChatMessage | null {
    const text = content.trim()
    if (!text) return null

    const profile = authStore.profile
    const now = new Date()
    const ttl = messageTtlMinutes.value || 120
    const expiresAt = new Date(now.getTime() + ttl * 60 * 1000).toISOString()

    const msg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      channel,
      senderId: profile?.id || 'anonymous',
      senderName: profile?.nickname || '热心玩家',
      senderAvatar: profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.id || 'lucky'}`,
      isHost: options?.isHost || false,
      isSystem: false,
      content: text,
      createdAt: now.toISOString(),
      expiresAt
    }

    appendMessageLocally(channel, msg, true)
    return msg
  }

  // 发送系统通报/开奖通知/房间事件（支持有效时长 TTL）
  function sendSystemAnnouncement(
    channel: string,
    content: string,
    customId?: string,
    customTtlMinutes?: number
  ) {
    const text = content.trim()
    if (!text) return

    const ttl = customTtlMinutes || messageTtlMinutes.value || 120
    const now = new Date()
    const expiresAt = new Date(now.getTime() + ttl * 60 * 1000).toISOString()

    const msg: ChatMessage = {
      id: customId || `sys_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      channel,
      senderId: 'system',
      senderName: '系统通报',
      senderAvatar: '',
      isSystem: true,
      content: text,
      createdAt: now.toISOString(),
      expiresAt
    }

    appendMessageLocally(channel, msg, true)
  }

  // 更新全局消息有效时长配置（分）
  async function updateMessageTtl(ttlMinutes: number) {
    if (ttlMinutes < 5) ttlMinutes = 5
    messageTtlMinutes.value = ttlMinutes
    localStorage.setItem('lucky7_chat_message_ttl', String(ttlMinutes))
    localStorage.setItem('lucky7_chat_system_ttl', String(ttlMinutes))

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('system_configs')
          .upsert({
            key: 'chat_message_ttl',
            value: {
              message_ttl_minutes: ttlMinutes,
              system_ttl_minutes: ttlMinutes,
              auto_clean: true
            },
            updated_at: new Date().toISOString()
          })
      } catch (err) {
        console.warn('Update chat_message_ttl error:', err)
      }
    }
  }

  const updateSystemTtl = updateMessageTtl

  // 手动/主动清理数据库与本地已过期的全量消息
  async function cleanExpiredMessages(ttlMinutes?: number) {
    const minutes = ttlMinutes ?? messageTtlMinutes.value
    let deletedCount = 0

    // 1. 本地各频道清理所有过期消息
    const now = Date.now()
    for (const ch of Object.keys(channelMessages.value)) {
      channelMessages.value[ch] = channelMessages.value[ch].filter(m => {
        if (m.expiresAt) {
          return new Date(m.expiresAt).getTime() > now
        }
        return true
      })
      try {
        localStorage.setItem(`lucky7_chat_${ch}`, JSON.stringify(channelMessages.value[ch]))
      } catch {
        // ignore
      }
    }

    // 2. 调用 Supabase RPC 清理数据库中所有超期消息
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('clean_expired_chat_messages', {
          p_retention_minutes: minutes
        })
        if (error) throw error
        deletedCount = (data as { deleted_count?: number })?.deleted_count || 0
      } catch (err) {
        console.error('cleanExpiredMessages RPC failed:', err)
        throw err
      }
    }

    return { success: true, deletedCount }
  }

  // 获取当前消息统计数据（供管理后台显示）
  async function fetchMessageStats() {
    if (!isSupabaseConfigured()) return { total: 0, system: 0, user: 0 }
    try {
      const { count: total } = await supabase.from('chat_messages').select('*', { count: 'exact', head: true })
      const { count: system } = await supabase.from('chat_messages').select('*', { count: 'exact', head: true }).eq('is_system', true)
      const t = total || 0
      const s = system || 0
      return { total: t, system: s, user: Math.max(0, t - s) }
    } catch (err) {
      console.error('fetchMessageStats error:', err)
      return { total: 0, system: 0, user: 0 }
    }
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
    messageTtlMinutes,
    systemTtlMinutes,
    getMessages,
    initChannel,
    sendMessage,
    sendSystemAnnouncement,
    updateMessageTtl,
    updateSystemTtl,
    cleanExpiredMessages,
    fetchMessageStats,
    clearChannel,
    destroyChannel
  }
})
