import type { SicBoRollResult, SicBoBetItem } from './types'

export const POINT_ODDS: Record<number, number> = {
  4: 60, 17: 60,
  5: 30, 16: 30,
  6: 18, 15: 18,
  7: 12, 14: 12,
  8: 8,  13: 8,
  9: 6,  10: 6, 11: 6, 12: 6
}

// 模拟随机掷骰子 3 颗
export function rollThreeDice(): SicBoRollResult {
  const d1 = Math.floor(Math.random() * 6) + 1
  const d2 = Math.floor(Math.random() * 6) + 1
  const d3 = Math.floor(Math.random() * 6) + 1
  const sum = d1 + d2 + d3

  const isTriple = d1 === d2 && d2 === d3
  // 经典规则：遇全围（豹子/三同号），大小、单双通常为庄家通吃
  const isBig = !isTriple && sum >= 11 && sum <= 17
  const isSmall = !isTriple && sum >= 4 && sum <= 10
  const isOdd = !isTriple && sum % 2 === 1
  const isEven = !isTriple && sum % 2 === 0

  return {
    dice: [d1, d2, d3],
    sum,
    isBig,
    isSmall,
    isOdd,
    isEven,
    isTriple
  }
}

// 结算所有下注项
export function calculateSicBoSettlement(
  bets: SicBoBetItem[],
  result: SicBoRollResult
): {
  totalBet: number
  totalPayout: number
  netProfit: number
  winningBets: SicBoBetItem[]
} {
  let totalBet = 0
  let totalPayout = 0
  const winningBets: SicBoBetItem[] = []

  for (const b of bets) {
    if (b.amount <= 0) continue
    totalBet += b.amount
    let isWin = false
    let payoutMultiple = 0

    if (b.type === 'big' && result.isBig) {
      isWin = true
      payoutMultiple = 2.0 // 1:1
    } else if (b.type === 'small' && result.isSmall) {
      isWin = true
      payoutMultiple = 2.0 // 1:1
    } else if (b.type === 'odd' && result.isOdd) {
      isWin = true
      payoutMultiple = 2.0 // 1:1
    } else if (b.type === 'even' && result.isEven) {
      isWin = true
      payoutMultiple = 2.0 // 1:1
    } else if (b.type === 'any_triple' && result.isTriple) {
      isWin = true
      payoutMultiple = 31.0 // 1:30
    } else if (b.type === 'point' && b.value === result.sum) {
      isWin = true
      const odds = POINT_ODDS[result.sum] || 6
      payoutMultiple = odds + 1.0
    } else if (b.type === 'single_die' && b.value !== undefined) {
      // 统计该骰子出现的次数
      const count = result.dice.filter(d => d === b.value).length
      if (count > 0) {
        isWin = true
        payoutMultiple = count + 1.0 // 出现1次1:1, 2次1:2, 3次1:3
      }
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
