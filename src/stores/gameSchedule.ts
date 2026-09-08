import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export type GameModeId = 'zhajinhua' | 'blackjack' | 'texas' | 'sicbo' | 'marksix'
export type GameActivityStatus = 'open' | 'closed' | 'closing'

export interface PendingScheduleConfig {
  is_24h: boolean
  start_time: string
  end_time: string
  effective_period?: string
  staged_at: string
}

export interface GameScheduleConfig {
  id: GameModeId
  name: string
  enabled: boolean
  status: GameActivityStatus
  is_24h: boolean
  start_time: string // HH:mm
  end_time: string   // HH:mm
  closing_period?: string
  pending_schedule?: PendingScheduleConfig
}

const DEFAULT_SCHEDULES: Record<GameModeId, GameScheduleConfig> = {
  zhajinhua: {
    id: 'zhajinhua',
    name: '炸金花',
    enabled: true,
    status: 'open',
    is_24h: true,
    start_time: '00:00',
    end_time: '23:59'
  },
  blackjack: {
    id: 'blackjack',
    name: '21点',
    enabled: true,
    status: 'open',
    is_24h: true,
    start_time: '00:00',
    end_time: '23:59'
  },
  texas: {
    id: 'texas',
    name: '德州扑克',
    enabled: true,
    status: 'open',
    is_24h: true,
    start_time: '00:00',
    end_time: '23:59'
  },
  sicbo: {
    id: 'sicbo',
    name: '猜大小 · 骰宝',
    enabled: true,
    status: 'open',
    is_24h: true,
    start_time: '00:00',
    end_time: '23:59'
  },
  marksix: {
    id: 'marksix',
    name: '猜点数六合彩',
    enabled: true,
    status: 'open',
    is_24h: true,
    start_time: '00:00',
    end_time: '23:59'
  }
}

const STORAGE_KEY = 'lucky7_game_schedules'

export const useGameScheduleStore = defineStore('gameSchedule', () => {
  // 从 localStorage 初始化或者使用默认值
  function loadLocalSchedules(): Record<GameModeId, GameScheduleConfig> {
    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        return { ...DEFAULT_SCHEDULES, ...parsed }
      }
    } catch (e) {
      console.warn('Failed to load local game schedules:', e)
    }
    return { ...DEFAULT_SCHEDULES }
  }

  const schedules = ref<Record<GameModeId, GameScheduleConfig>>(loadLocalSchedules())

  // 当前时钟 HH:mm，每秒心跳更新
  const nowTimeString = ref<string>(getCurrentTimeString())
  setInterval(() => {
    nowTimeString.value = getCurrentTimeString()
  }, 1000)

  function getCurrentTimeString(): string {
    const d = new Date()
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${hh}:${mm}`
  }

  // 检查某个游戏当前是否在营业开放状态
  function checkGameOpen(gameId: GameModeId): {
    isOpen: boolean
    status: GameActivityStatus
    reason: string
    timeDesc: string
  } {
    const config = schedules.value[gameId]
    if (!config) {
      return { isOpen: true, status: 'open', reason: '', timeDesc: '全天开放' }
    }

    const timeDesc = config.is_24h ? '全天 24 小时开放' : `每日 ${config.start_time} - ${config.end_time}`

    // 1. 若处于关停中 closing
    if (config.status === 'closing') {
      return {
        isOpen: true,
        status: 'closing',
        reason: '活动关停过渡中：等待当期开奖结束后正式关闭，已停止接收新下注',
        timeDesc
      }
    }

    // 2. 若总开关未启用或状态为 closed
    if (!config.enabled || config.status === 'closed') {
      return {
        isOpen: false,
        status: 'closed',
        reason: '活动已关闭 / 暂停开放',
        timeDesc
      }
    }

    // 3. 全天开放模式
    if (config.is_24h) {
      return { isOpen: true, status: 'open', reason: '', timeDesc }
    }

    // 4. 判定时段
    const cur = nowTimeString.value
    const start = config.start_time || '00:00'
    const end = config.end_time || '23:59'

    let inWindow = false
    if (start <= end) {
      inWindow = cur >= start && cur <= end
    } else {
      // 跨午夜，如 22:00 到 06:00
      inWindow = cur >= start || cur <= end
    }

    if (!inWindow) {
      return {
        isOpen: false,
        status: 'closed',
        reason: `未到开放时间 (开放时段: ${timeDesc})`,
        timeDesc
      }
    }

    return { isOpen: true, status: 'open', reason: '', timeDesc }
  }

  // 跨标签页广播同步
  let broadcast: BroadcastChannel | null = null
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      broadcast = new BroadcastChannel('lucky7_game_schedules_sync')
      broadcast.onmessage = (event) => {
        const { type, payload } = event.data || {}
        if (type === 'SCHEDULES_UPDATED' && payload) {
          schedules.value = { ...schedules.value, ...payload }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules.value))
        }
      }
    } catch (e) {
      console.warn('Game schedules BroadcastChannel init error:', e)
    }
  }

  // 安全广播函数（通过序列化彻底剔除 Vue 响应式 Proxy 与无法 clone 的对象，防止 structuredClone 报错）
  function safeBroadcast(msg: unknown) {
    if (!broadcast) return
    try {
      broadcast.postMessage(JSON.parse(JSON.stringify(msg)))
    } catch (e) {
      console.warn('Game schedules BroadcastChannel postMessage error:', e)
    }
  }

  // Supabase 实时监听
  let scheduleChannel: RealtimeChannel | null = null
  function subscribeToServerConfig() {
    if (!isSupabaseConfigured() || scheduleChannel) return
    try {
      scheduleChannel = supabase
        .channel('game_schedules_realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'system_configs',
            filter: 'key=eq.game_schedules'
          },
          (payload) => {
            const val = (payload.new as { value?: Record<GameModeId, GameScheduleConfig> })?.value
            if (val) {
              schedules.value = { ...schedules.value, ...val }
              localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules.value))
              safeBroadcast({
                type: 'SCHEDULES_UPDATED',
                payload: schedules.value
              })
            }
          }
        )
        .subscribe()
    } catch (err) {
      console.warn('Subscribe to server game schedules error:', err)
    }
  }

  async function fetchServerSchedules() {
    if (!isSupabaseConfigured()) return
    try {
      const { data, error } = await supabase
        .from('system_configs')
        .select('*')
        .eq('key', 'game_schedules')
        .maybeSingle()

      if (!error && data?.value) {
        const val = data.value as Record<GameModeId, GameScheduleConfig>
        schedules.value = { ...schedules.value, ...val }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules.value))
      }
      subscribeToServerConfig()
    } catch (err) {
      console.warn('Fetch server game schedules error:', err)
    }
  }

  fetchServerSchedules()

  // 内部辅助：保存并同步全服配置
  async function commitSchedules() {
    const plainSchedules = JSON.parse(JSON.stringify(schedules.value))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plainSchedules))

    safeBroadcast({
      type: 'SCHEDULES_UPDATED',
      payload: plainSchedules
    })

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('system_configs')
          .upsert({
            key: 'game_schedules',
            value: plainSchedules,
            updated_at: new Date().toISOString()
          })
      } catch (err) {
        console.warn('Failed to commit game schedules to Supabase:', err)
      }
    }
  }

  // 1. 请求关闭活动（对于猜大小和六合彩，进入 closing 状态等待当期结束）
  async function requestCloseActivity(gameId: GameModeId, currentPeriod?: string) {
    const config = schedules.value[gameId]
    if (!config) return

    if (gameId === 'sicbo' || gameId === 'marksix') {
      config.status = 'closing'
      if (currentPeriod) {
        config.closing_period = currentPeriod
      }
    } else {
      // 棋牌模式直接关闭
      config.status = 'closed'
      config.enabled = false
    }

    await commitSchedules()
  }

  // 2. 当期开奖并结算完成，正式关闭活动（针对猜大小和六合彩）
  async function completeCloseActivity(gameId: GameModeId) {
    const config = schedules.value[gameId]
    if (!config) return
    if (config.status === 'closing') {
      config.status = 'closed'
      config.enabled = false
      delete config.closing_period
      await commitSchedules()
    }
  }

  // 3. 重新开启活动
  async function reopenActivity(gameId: GameModeId) {
    const config = schedules.value[gameId]
    if (!config) return
    config.status = 'open'
    config.enabled = true
    delete config.closing_period
    await commitSchedules()
  }

  // 4. 修改开启时间配置（方案 1：下期自动生效机制）
  // 棋牌模式或已关闭模式立即生效；运行中的猜大小/六合彩自动暂存并在下期结算后平滑生效
  async function updateScheduleTime(
    gameId: GameModeId,
    params: {
      is_24h: boolean
      start_time: string
      end_time: string
    },
    effectivePeriod?: string
  ): Promise<{ isPending: boolean; effectivePeriod?: string }> {
    const config = schedules.value[gameId]
    if (!config) return { isPending: false }

    // 棋牌模式（炸金花、21点、德州扑克）或已完全关闭状态：立即生效
    if ((gameId !== 'sicbo' && gameId !== 'marksix') || config.status === 'closed') {
      config.is_24h = params.is_24h
      config.start_time = params.start_time
      config.end_time = params.end_time
      delete config.pending_schedule
      await commitSchedules()
      return { isPending: false }
    }

    // 猜大小和六合彩处于运行中（open）或关停过渡（closing）：下期自动生效
    config.pending_schedule = {
      is_24h: params.is_24h,
      start_time: params.start_time,
      end_time: params.end_time,
      effective_period: effectivePeriod,
      staged_at: new Date().toISOString()
    }

    await commitSchedules()
    return { isPending: true, effectivePeriod }
  }

  // 5. 当期开奖与结算完毕，将暂存的 pending_schedule 正式应用生效
  async function applyPendingSchedule(gameId: GameModeId) {
    const config = schedules.value[gameId]
    if (!config || !config.pending_schedule) return

    const pending = config.pending_schedule
    config.is_24h = pending.is_24h
    config.start_time = pending.start_time
    config.end_time = pending.end_time
    delete config.pending_schedule

    // 根据新配置重新判断当前时刻是否在营业窗口内
    if (config.is_24h) {
      config.status = 'open'
      config.enabled = true
    } else {
      const cur = nowTimeString.value
      const start = config.start_time || '00:00'
      const end = config.end_time || '23:59'
      let inWindow = false
      if (start <= end) {
        inWindow = cur >= start && cur <= end
      } else {
        inWindow = cur >= start || cur <= end
      }

      if (inWindow) {
        config.status = 'open'
        config.enabled = true
      } else {
        config.status = 'closed'
        config.enabled = false
      }
    }

    await commitSchedules()
  }

  // 6. 撤销未生效的暂存配置
  async function cancelPendingSchedule(gameId: GameModeId) {
    const config = schedules.value[gameId]
    if (!config || !config.pending_schedule) return
    delete config.pending_schedule
    await commitSchedules()
  }

  return {
    schedules,
    nowTimeString,
    checkGameOpen,
    requestCloseActivity,
    completeCloseActivity,
    reopenActivity,
    updateScheduleTime,
    applyPendingSchedule,
    cancelPendingSchedule,
    commitSchedules
  }
})
