import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { SicBoRollResult } from '@/games/sicbo/types'
import type { MarkSixDrawResult } from '@/games/marksix/types'
import { getBallWave, ZODIACS } from '@/games/marksix/engine'
import { useGameScheduleStore } from '@/stores/gameSchedule'

import type { RealtimeChannel } from '@supabase/supabase-js'

// 1. 32 位无符号整数 Hash 函数
function stringHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return hash >>> 0
}

// 2. 100% 确定性 32 位 Mulberry32 PRNG
// 杜绝 Math.sin() 在不同 JS 引擎（V8、Safari JSC、Firefox）中的微小浮点精度偏差，确保全平台全设备结果绝对一致
function mulberry32(seed: number) {
  let a = seed >>> 0
  return function() {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// 3. 基于 UTC 时间戳生成全服统一的期号格式，杜绝玩家本地时区偏差
function getUtcPeriodString(periodIndex: number, cycle: number): string {
  const d = new Date(periodIndex * cycle * 1000)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}${m}${day}-${String(periodIndex % 10000).padStart(4, '0')}`
}

export const useLotteryStore = defineStore('lottery', () => {
  // 开奖周期配置（秒），默认 Sic Bo 30秒，Mark Six 60秒
  const sicboCycleSeconds = ref<number>(
    Number(localStorage.getItem('lucky7_sicbo_cycle')) || 30
  )
  const marksixCycleSeconds = ref<number>(
    Number(localStorage.getItem('lucky7_marksix_cycle')) || 60
  )
  // 往期历史开奖展示期数配置（期），默认 10 期
  const historyLimit = ref<number>(
    Number(localStorage.getItem('lucky7_history_limit')) || 10
  )

  // 封盘开奖动效时长（秒）
  const DRAWING_WINDOW_SECONDS = 4

  // 当前时钟秒数（全局心跳）
  const currentTimestamp = ref<number>(Math.floor(Date.now() / 1000))
  setInterval(() => {
    currentTimestamp.value = Math.floor(Date.now() / 1000)
  }, 500)

  // --- 跨标签页即时同步 (BroadcastChannel) ---
  let lotteryBroadcast: BroadcastChannel | null = null
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      lotteryBroadcast = new BroadcastChannel('lucky7_lottery_sync')
      lotteryBroadcast.onmessage = (event) => {
        const { type, payload } = event.data || {}
        if (type === 'CYCLES_UPDATED') {
          if (payload.sicbo_seconds && Number(payload.sicbo_seconds) !== sicboCycleSeconds.value) {
            sicboCycleSeconds.value = Number(payload.sicbo_seconds)
            localStorage.setItem('lucky7_sicbo_cycle', String(sicboCycleSeconds.value))
          }
          if (payload.marksix_seconds && Number(payload.marksix_seconds) !== marksixCycleSeconds.value) {
            marksixCycleSeconds.value = Number(payload.marksix_seconds)
            localStorage.setItem('lucky7_marksix_cycle', String(marksixCycleSeconds.value))
          }
          if (payload.history_limit && Number(payload.history_limit) !== historyLimit.value) {
            historyLimit.value = Number(payload.history_limit)
            localStorage.setItem('lucky7_history_limit', String(historyLimit.value))
          }
        }
      }
    } catch (e) {
      console.warn('Lottery BroadcastChannel init error:', e)
    }
  }

  // 跨窗口 storage 事件监听
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === 'lucky7_sicbo_cycle' && e.newValue) {
        sicboCycleSeconds.value = Number(e.newValue)
      }
      if (e.key === 'lucky7_marksix_cycle' && e.newValue) {
        marksixCycleSeconds.value = Number(e.newValue)
      }
      if (e.key === 'lucky7_history_limit' && e.newValue) {
        historyLimit.value = Number(e.newValue)
      }
    })
  }

  // --- Supabase 实时监听与初始化拉取 ---
  let configRealtimeChannel: RealtimeChannel | null = null
  function subscribeToServerConfig() {
    if (!isSupabaseConfigured() || configRealtimeChannel) return
    try {
      configRealtimeChannel = supabase
        .channel('system_configs_realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'system_configs',
            filter: 'key=eq.lottery_cycles'
          },
          (payload) => {
            const val = (payload.new as { value?: { sicbo_seconds?: number; marksix_seconds?: number; history_limit?: number } })?.value
            if (val) {
              if (val.sicbo_seconds && Number(val.sicbo_seconds) !== sicboCycleSeconds.value) {
                sicboCycleSeconds.value = Number(val.sicbo_seconds)
                localStorage.setItem('lucky7_sicbo_cycle', String(sicboCycleSeconds.value))
              }
              if (val.marksix_seconds && Number(val.marksix_seconds) !== marksixCycleSeconds.value) {
                marksixCycleSeconds.value = Number(val.marksix_seconds)
                localStorage.setItem('lucky7_marksix_cycle', String(marksixCycleSeconds.value))
              }
              if (val.history_limit && Number(val.history_limit) !== historyLimit.value) {
                historyLimit.value = Number(val.history_limit)
                localStorage.setItem('lucky7_history_limit', String(historyLimit.value))
              }
              try {
                lotteryBroadcast?.postMessage({
                  type: 'CYCLES_UPDATED',
                  payload: {
                    sicbo_seconds: sicboCycleSeconds.value,
                    marksix_seconds: marksixCycleSeconds.value,
                    history_limit: historyLimit.value
                  }
                })
              } catch (err) {
                console.warn('BroadcastChannel error:', err)
              }
            }
          }
        )
        .subscribe()
    } catch (err) {
      console.warn('Subscribe to server lottery cycles error:', err)
    }
  }

  async function fetchServerCycles() {
    if (!isSupabaseConfigured()) return
    try {
      const { data, error } = await supabase
        .from('system_configs')
        .select('*')
        .eq('key', 'lottery_cycles')
        .maybeSingle()

      if (!error && data?.value) {
        const val = data.value as { sicbo_seconds?: number; marksix_seconds?: number; history_limit?: number }
        if (val.sicbo_seconds) {
          sicboCycleSeconds.value = Number(val.sicbo_seconds)
          localStorage.setItem('lucky7_sicbo_cycle', String(sicboCycleSeconds.value))
        }
        if (val.marksix_seconds) {
          marksixCycleSeconds.value = Number(val.marksix_seconds)
          localStorage.setItem('lucky7_marksix_cycle', String(marksixCycleSeconds.value))
        }
        if (val.history_limit) {
          historyLimit.value = Number(val.history_limit)
          localStorage.setItem('lucky7_history_limit', String(historyLimit.value))
        }
      }
      subscribeToServerConfig()
    } catch (err) {
      console.warn('Fetch server lottery cycles error:', err)
    }
  }

  fetchServerCycles()

  // ==========================================
  // --- 猜大小 (Sic Bo) 全服定时与开奖系统 ---
  // ==========================================

  const sicboCurrentIndex = computed(() => {
    const cycle = Math.max(10, sicboCycleSeconds.value)
    return Math.floor(currentTimestamp.value / cycle)
  })

  // 当期期号（全服统一）
  const sicboPeriod = computed(() => {
    const cycle = Math.max(10, sicboCycleSeconds.value)
    return getUtcPeriodString(sicboCurrentIndex.value, cycle)
  })

  // 当期剩余秒数
  const sicboRemainingSeconds = computed(() => {
    const cycle = Math.max(10, sicboCycleSeconds.value)
    const elapsed = currentTimestamp.value % cycle
    return cycle - elapsed
  })

  // 封盘摇盅阶段
  const isSicboDrawing = computed(() => {
    return sicboRemainingSeconds.value <= DRAWING_WINDOW_SECONDS
  })

  // 生成指定期号的 Sic Bo 确定性开奖结果（100% 全服一致）
  function getSicboResultForPeriod(period: string): SicBoRollResult {
    const seed = stringHash(`sicbo_${period}`)
    const rand = mulberry32(seed)
    const d1 = Math.floor(rand() * 6) + 1
    const d2 = Math.floor(rand() * 6) + 1
    const d3 = Math.floor(rand() * 6) + 1
    const dice: [number, number, number] = [d1, d2, d3]
    const sum = d1 + d2 + d3
    const isTriple = d1 === d2 && d2 === d3
    return {
      dice,
      sum,
      isBig: !isTriple && sum >= 11 && sum <= 17,
      isSmall: !isTriple && sum >= 4 && sum <= 10,
      isOdd: !isTriple && sum % 2 === 1,
      isEven: !isTriple && sum % 2 === 0,
      isTriple
    }
  }

  // 上一期已完全开出的期号
  const sicboLastDrawnPeriod = computed(() => {
    const cycle = Math.max(10, sicboCycleSeconds.value)
    return getUtcPeriodString(sicboCurrentIndex.value - 1, cycle)
  })

  // 上一期开奖结果（全服同步揭晓）
  const sicboLastResult = computed<SicBoRollResult>(() => {
    return getSicboResultForPeriod(sicboLastDrawnPeriod.value)
  })

  // 全服统一的历史开奖记录列表（根据配置的 historyLimit 期数生成，开箱即同）
  const sicboHistory = computed<SicBoRollResult[]>(() => {
    const cycle = Math.max(10, sicboCycleSeconds.value)
    const currentIdx = sicboCurrentIndex.value
    const limit = Math.min(50, Math.max(5, historyLimit.value || 10))
    const list: SicBoRollResult[] = []
    for (let i = 1; i <= limit; i++) {
      const p = getUtcPeriodString(currentIdx - i, cycle)
      const res = getSicboResultForPeriod(p)
      list.push({ ...res, period: p })
    }
    return list
  })

  // ============================================
  // --- 猜六合彩 (Mark Six) 全服定时与开奖系统 ---
  // ============================================

  const marksixCurrentIndex = computed(() => {
    const cycle = Math.max(15, marksixCycleSeconds.value)
    return Math.floor(currentTimestamp.value / cycle)
  })

  const marksixPeriod = computed(() => {
    const cycle = Math.max(15, marksixCycleSeconds.value)
    return getUtcPeriodString(marksixCurrentIndex.value, cycle)
  })

  const marksixRemainingSeconds = computed(() => {
    const cycle = Math.max(15, marksixCycleSeconds.value)
    const elapsed = currentTimestamp.value % cycle
    return cycle - elapsed
  })

  const isMarksixDrawing = computed(() => {
    return marksixRemainingSeconds.value <= DRAWING_WINDOW_SECONDS
  })

  // 生成指定期号的 Mark Six 确定性开奖结果（100% 全服一致）
  function getMarksixResultForPeriod(period: string): MarkSixDrawResult {
    const seed = stringHash(`marksix_${period}`)
    const rand = mulberry32(seed)
    const number = Math.floor(rand() * 49) + 1
    const waveColor = getBallWave(number)
    const zodiac = ZODIACS[Math.floor(rand() * ZODIACS.length)]
    const isBig = number >= 25 && number <= 48
    const isSmall = number >= 1 && number <= 24
    const isOdd = number !== 49 && number % 2 === 1
    const isEven = number !== 49 && number % 2 === 0

    return {
      period,
      number,
      waveColor,
      isBig,
      isSmall,
      isOdd,
      isEven,
      zodiac,
      drawnAt: ''
    }
  }

  const marksixLastDrawnPeriod = computed(() => {
    const cycle = Math.max(15, marksixCycleSeconds.value)
    return getUtcPeriodString(marksixCurrentIndex.value - 1, cycle)
  })

  const marksixLastResult = computed<MarkSixDrawResult>(() => {
    return getMarksixResultForPeriod(marksixLastDrawnPeriod.value)
  })

  const marksixHistory = computed<MarkSixDrawResult[]>(() => {
    const cycle = Math.max(15, marksixCycleSeconds.value)
    const currentIdx = marksixCurrentIndex.value
    const limit = Math.min(50, Math.max(5, historyLimit.value || 10))
    const list: MarkSixDrawResult[] = []
    for (let i = 1; i <= limit; i++) {
      const p = getUtcPeriodString(currentIdx - i, cycle)
      list.push(getMarksixResultForPeriod(p))
    }
    return list
  })

  // ==========================================
  // --- 管理后台更新周期配置（多端秒级同步） ---
  // ==========================================
  async function updateCycles(sicboSeconds: number, marksixSeconds: number, historyCount?: number) {
    if (sicboSeconds >= 10) {
      sicboCycleSeconds.value = Math.floor(sicboSeconds)
      localStorage.setItem('lucky7_sicbo_cycle', String(sicboCycleSeconds.value))
    }
    if (marksixSeconds >= 15) {
      marksixCycleSeconds.value = Math.floor(marksixSeconds)
      localStorage.setItem('lucky7_marksix_cycle', String(marksixCycleSeconds.value))
    }
    if (historyCount && historyCount >= 5 && historyCount <= 50) {
      historyLimit.value = Math.floor(historyCount)
      localStorage.setItem('lucky7_history_limit', String(historyLimit.value))
    }

    // 1. 跨标签页即时同步
    try {
      lotteryBroadcast?.postMessage({
        type: 'CYCLES_UPDATED',
        payload: {
          sicbo_seconds: sicboCycleSeconds.value,
          marksix_seconds: marksixCycleSeconds.value,
          history_limit: historyLimit.value
        }
      })
    } catch (e) {
      console.warn('BroadcastChannel postMessage error:', e)
    }

    // 2. Supabase 云端广播与持久化
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('system_configs')
          .upsert({
            key: 'lottery_cycles',
            value: {
              sicbo_seconds: sicboCycleSeconds.value,
              marksix_seconds: marksixCycleSeconds.value,
              history_limit: historyLimit.value
            },
            updated_at: new Date().toISOString()
          })
      } catch (err) {
        console.warn('Update server lottery cycles error:', err)
      }
    }
  }

  // 下一期期号（供排期与预定换届生效使用）
  const nextSicboPeriod = computed(() => {
    const cycle = Math.max(10, sicboCycleSeconds.value)
    return getUtcPeriodString(sicboCurrentIndex.value + 1, cycle)
  })

  const nextMarksixPeriod = computed(() => {
    const cycle = Math.max(15, marksixCycleSeconds.value)
    return getUtcPeriodString(marksixCurrentIndex.value + 1, cycle)
  })

  // 监听当期摇奖结束切换：
  // 1. 若处于 closing 状态，留出足够结算与派彩展示时间（6秒）后正式关闭活动
  // 2. 若存在 pending_schedule（待生效的新开启时段），自动平滑应用生效
  watch(isSicboDrawing, (isDrawing, prev) => {
    if (prev && !isDrawing) {
      setTimeout(() => {
        const scheduleStore = useGameScheduleStore()
        if (scheduleStore.schedules.sicbo?.status === 'closing') {
          scheduleStore.completeCloseActivity('sicbo')
        }
        if (scheduleStore.schedules.sicbo?.pending_schedule) {
          scheduleStore.applyPendingSchedule('sicbo')
        }
      }, 6000)
    }
  })

  watch(isMarksixDrawing, (isDrawing, prev) => {
    if (prev && !isDrawing) {
      setTimeout(() => {
        const scheduleStore = useGameScheduleStore()
        if (scheduleStore.schedules.marksix?.status === 'closing') {
          scheduleStore.completeCloseActivity('marksix')
        }
        if (scheduleStore.schedules.marksix?.pending_schedule) {
          scheduleStore.applyPendingSchedule('marksix')
        }
      }, 6000)
    }
  })

  return {
    sicboCycleSeconds,
    marksixCycleSeconds,
    historyLimit,
    sicboRemainingSeconds,
    sicboPeriod,
    nextSicboPeriod,
    isSicboDrawing,
    sicboLastDrawnPeriod,
    sicboLastResult,
    sicboHistory,
    getSicboResultForPeriod,
    marksixRemainingSeconds,
    marksixPeriod,
    nextMarksixPeriod,
    isMarksixDrawing,
    marksixLastDrawnPeriod,
    marksixLastResult,
    marksixHistory,
    getMarksixResultForPeriod,
    updateCycles,
    DRAWING_WINDOW_SECONDS
  }
})
