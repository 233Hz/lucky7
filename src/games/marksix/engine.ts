import type { MarkSixDrawResult, MarkSixBetItem } from './types'

export const RED_BALLS = [1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46]
export const BLUE_BALLS = [3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48]
export const GREEN_BALLS = [5, 6, 11, 16, 17, 21, 22, 27, 28, 32, 33, 38, 39, 43, 44, 49]

export const ZODIACS = ['马', '蛇', '龙', '兔', '虎', '牛', '鼠', '猪', '狗', '鸡', '猴', '羊']

export function getBallWave(num: number): 'red' | 'blue' | 'green' {
  if (RED_BALLS.includes(num)) return 'red'
  if (BLUE_BALLS.includes(num)) return 'blue'
  return 'green'
}

export function getBallZodiac(num: number): string {
  // 根据六合彩标准，1号为当年当值生肖（2026农历马年以此循环）
  const idx = (num - 1) % 12
  return ZODIACS[idx]
}

// 抽取一期特码
export function drawMarkSixResult(period?: string): MarkSixDrawResult {
  const number = Math.floor(Math.random() * 49) + 1
  const waveColor = getBallWave(number)
  const zodiac = getBallZodiac(number)

  const isBig = number >= 25 && number <= 48
  const isSmall = number >= 1 && number <= 24
  const isOdd = number !== 49 && number % 2 === 1
  const isEven = number !== 49 && number % 2 === 0

  const now = new Date()
  const periodStr = period || `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`

  return {
    period: periodStr,
    number,
    waveColor,
    isBig,
    isSmall,
    isOdd,
    isEven,
    zodiac,
    drawnAt: now.toLocaleTimeString()
  }
}

// 结算六合彩下注
export function settleMarkSixBets(
  bets: MarkSixBetItem[],
  result: MarkSixDrawResult
): {
  totalBet: number
  totalPayout: number
  netProfit: number
  winningBets: MarkSixBetItem[]
} {
  let totalBet = 0
  let totalPayout = 0
  const winningBets: MarkSixBetItem[] = []

  for (const b of bets) {
    if (b.amount <= 0) continue
    totalBet += b.amount
    let isWin = false
    let payoutMultiple = 0

    if (b.type === 'exact_number' && Number(b.value) === result.number) {
      isWin = true
      payoutMultiple = 48.0 // 1:47
    } else if (b.type === 'big_small') {
      if (b.value === 'big' && result.isBig) {
        isWin = true
        payoutMultiple = 1.95
      } else if (b.value === 'small' && result.isSmall) {
        isWin = true
        payoutMultiple = 1.95
      }
    } else if (b.type === 'odd_even') {
      if (b.value === 'odd' && result.isOdd) {
        isWin = true
        payoutMultiple = 1.95
      } else if (b.value === 'even' && result.isEven) {
        isWin = true
        payoutMultiple = 1.95
      }
    } else if (b.type === 'wave_color' && b.value === result.waveColor) {
      isWin = true
      payoutMultiple = result.waveColor === 'red' ? 2.8 : 2.9
    } else if (b.type === 'zodiac' && b.value === result.zodiac) {
      isWin = true
      payoutMultiple = 11.5
    }

    if (isWin) {
      const payout = Math.floor(b.amount * payoutMultiple)
      totalPayout += payout
      winningBets.push(b)
    }
  }

  const netProfit = totalPayout - totalBet
  return { totalBet, totalPayout, netProfit, winningBets }
}
