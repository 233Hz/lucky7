import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SicBoRollResult } from '@/games/sicbo/types'
import type { MarkSixDrawResult } from '@/games/marksix/types'
import { getBallWave, ZODIACS } from '@/games/marksix/engine'

// 确定性伪随机数生成器（基于期号 Hash，确保全服同一期结果 100% 同步一致）
function stringHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export const useLotteryStore = defineStore('lottery', () => {
  // 开奖周期配置（秒），默认 Sic Bo 30秒，Mark Six 60秒，持久化于 localStorage
  const sicboCycleSeconds = ref<number>(
    Number(localStorage.getItem('lucky7_sicbo_cycle')) || 30
  )
  const marksixCycleSeconds = ref<number>(
    Number(localStorage.getItem('lucky7_marksix_cycle')) || 60
  )

  // 当前时钟秒数
  const currentTimestamp = ref<number>(Math.floor(Date.now() / 1000))

  // 封盘开奖动效时长（秒）
  const DRAWING_WINDOW_SECONDS = 4

  // 定时心跳
  setInterval(() => {
    currentTimestamp.value = Math.floor(Date.now() / 1000)
  }, 500)

  // --- 猜大小 (Sic Bo) 全服定时数据 ---
  const sicboRemainingSeconds = computed(() => {
    const cycle = Math.max(10, sicboCycleSeconds.value)
    const elapsed = currentTimestamp.value % cycle
    return cycle - elapsed
  })

  const sicboPeriod = computed(() => {
    const cycle = Math.max(10, sicboCycleSeconds.value)
    const periodIndex = Math.floor(currentTimestamp.value / cycle)
    const d = new Date()
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
    return `${dateStr}-${String(periodIndex % 10000).padStart(4, '0')}`
  })

  const isSicboDrawing = computed(() => {
    return sicboRemainingSeconds.value <= DRAWING_WINDOW_SECONDS
  })

  // 生成指定期号的 Sic Bo 确定性开奖结果
  function getSicboResultForPeriod(period: string): SicBoRollResult {
    const seed = stringHash(`sicbo_${period}`)
    const d1 = Math.floor(seededRandom(seed + 11) * 6) + 1
    const d2 = Math.floor(seededRandom(seed + 23) * 6) + 1
    const d3 = Math.floor(seededRandom(seed + 37) * 6) + 1
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

  // --- 猜六合彩 (Mark Six) 全服定时数据 ---
  const marksixRemainingSeconds = computed(() => {
    const cycle = Math.max(15, marksixCycleSeconds.value)
    const elapsed = currentTimestamp.value % cycle
    return cycle - elapsed
  })

  const marksixPeriod = computed(() => {
    const cycle = Math.max(15, marksixCycleSeconds.value)
    const periodIndex = Math.floor(currentTimestamp.value / cycle)
    const d = new Date()
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
    return `${dateStr}-${String(periodIndex % 10000).padStart(4, '0')}`
  })

  const isMarksixDrawing = computed(() => {
    return marksixRemainingSeconds.value <= DRAWING_WINDOW_SECONDS
  })

  // 生成指定期号的 Mark Six 确定性开奖结果
  function getMarksixResultForPeriod(period: string): MarkSixDrawResult {
    const seed = stringHash(`marksix_${period}`)
    const number = Math.floor(seededRandom(seed + 17) * 49) + 1
    const waveColor = getBallWave(number)
    const zodiac = ZODIACS[Math.floor(seededRandom(seed + 43) * ZODIACS.length)]
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
      drawnAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
  }

  // 管理后台更新周期配置
  function updateCycles(sicboSeconds: number, marksixSeconds: number) {
    if (sicboSeconds >= 10) {
      sicboCycleSeconds.value = Math.floor(sicboSeconds)
      localStorage.setItem('lucky7_sicbo_cycle', String(sicboCycleSeconds.value))
    }
    if (marksixSeconds >= 15) {
      marksixCycleSeconds.value = Math.floor(marksixSeconds)
      localStorage.setItem('lucky7_marksix_cycle', String(marksixCycleSeconds.value))
    }
  }

  return {
    sicboCycleSeconds,
    marksixCycleSeconds,
    sicboRemainingSeconds,
    sicboPeriod,
    isSicboDrawing,
    getSicboResultForPeriod,
    marksixRemainingSeconds,
    marksixPeriod,
    isMarksixDrawing,
    getMarksixResultForPeriod,
    updateCycles,
    DRAWING_WINDOW_SECONDS
  }
})
