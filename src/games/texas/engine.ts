import type { Card, Suit, Rank } from '@/types/game'
import type { TexasEvaluation, TexasHandRank } from './types'

const SUITS: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds']
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14
}

export function createTexasDeck(): Card[] {
  const deck: Card[] = []
  for (const s of SUITS) {
    for (const r of RANKS) {
      deck.push({ suit: s, rank: r, value: RANK_VALUES[r] })
    }
  }
  return shuffleDeck(deck)
}

function shuffleDeck(deck: Card[]): Card[] {
  const arr = [...deck]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// 评估 5 张牌
function evaluateFiveCards(cards: Card[]): TexasEvaluation {
  const sorted = [...cards].sort((a, b) => b.value - a.value)
  const isFlush = sorted.every(c => c.suit === sorted[0].suit)

  // 顺子检测 (常规 or A-2-3-4-5)
  let isStraight = false
  let highStraightValue = sorted[0].value

  if (
    sorted[0].value - 1 === sorted[1].value &&
    sorted[1].value - 1 === sorted[2].value &&
    sorted[2].value - 1 === sorted[3].value &&
    sorted[3].value - 1 === sorted[4].value
  ) {
    isStraight = true
  } else if (
    sorted[0].value === 14 &&
    sorted[1].value === 5 &&
    sorted[2].value === 4 &&
    sorted[3].value === 3 &&
    sorted[4].value === 2
  ) {
    // Wheel (A-2-3-4-5), A 计为 1 点
    isStraight = true
    highStraightValue = 5
  }

  // 统计同点数牌频次
  const counts: Record<number, number> = {}
  for (const c of sorted) {
    counts[c.value] = (counts[c.value] || 0) + 1
  }

  const entries = Object.entries(counts).map(([v, count]) => ({
    val: parseInt(v, 10),
    count
  }))
  // 先按频次降序，再按牌面值降序
  entries.sort((a, b) => b.count - a.count || b.val - a.val)

  let rank: TexasHandRank = 'high_card'
  let rankName = '高牌'
  let baseScore = 0

  if (isFlush && isStraight) {
    if (highStraightValue === 14) {
      rank = 'royal_flush'
      rankName = '皇家同花顺'
      baseScore = 90000000
    } else {
      rank = 'straight_flush'
      rankName = '同花顺'
      baseScore = 80000000 + highStraightValue * 10000
    }
  } else if (entries[0].count === 4) {
    rank = 'four_of_a_kind'
    rankName = '四条 (炸弹)'
    baseScore = 70000000 + entries[0].val * 10000 + entries[1].val
  } else if (entries[0].count === 3 && entries[1].count === 2) {
    rank = 'full_house'
    rankName = '葫芦 (Full House)'
    baseScore = 60000000 + entries[0].val * 10000 + entries[1].val
  } else if (isFlush) {
    rank = 'flush'
    rankName = '同花 (Flush)'
    baseScore = 50000000 + sorted[0].value * 10000 + sorted[1].value * 100 + sorted[2].value
  } else if (isStraight) {
    rank = 'straight'
    rankName = '顺子 (Straight)'
    baseScore = 40000000 + highStraightValue * 10000
  } else if (entries[0].count === 3) {
    rank = 'three_of_a_kind'
    rankName = '三条'
    baseScore = 30000000 + entries[0].val * 10000 + entries[1].val * 100 + entries[2].val
  } else if (entries[0].count === 2 && entries[1].count === 2) {
    rank = 'two_pair'
    rankName = '两对 (Two Pair)'
    baseScore = 20000000 + entries[0].val * 10000 + entries[1].val * 100 + entries[2].val
  } else if (entries[0].count === 2) {
    rank = 'one_pair'
    rankName = '一对 (One Pair)'
    baseScore = 10000000 + entries[0].val * 10000 + entries[1].val * 100 + entries[2].val * 10 + entries[3].val
  } else {
    rank = 'high_card'
    rankName = '高牌'
    baseScore = sorted[0].value * 10000 + sorted[1].value * 100 + sorted[2].value
  }

  return { rank, rankName, score: baseScore, bestFiveCards: sorted }
}

// 组合生成器 C(n, 5)
function getCombinations<T>(array: T[], size: number): T[][] {
  const result: T[][] = []
  function backtrack(start: number, combo: T[]) {
    if (combo.length === size) {
      result.push([...combo])
      return
    }
    for (let i = start; i < array.length; i++) {
      combo.push(array[i])
      backtrack(i + 1, combo)
      combo.pop()
    }
  }
  backtrack(0, [])
  return result
}

// 从 7 张牌（2 张底牌 + 5 张公共牌）中找出最优 5 张并计算牌型
export function evaluateTexas7Cards(cards: Card[]): TexasEvaluation {
  if (cards.length < 5) {
    return {
      rank: 'high_card',
      rankName: '未成牌',
      score: 0,
      bestFiveCards: cards
    }
  }

  if (cards.length === 5) {
    return evaluateFiveCards(cards)
  }

  const combos = getCombinations(cards, 5)
  let bestEval: TexasEvaluation = evaluateFiveCards(combos[0])

  for (let i = 1; i < combos.length; i++) {
    const current = evaluateFiveCards(combos[i])
    if (current.score > bestEval.score) {
      bestEval = current
    }
  }

  return bestEval
}

// AI 德州扑克行为判定
export function getAITexasAction(
  holeCards: Card[],
  communityCards: Card[],
  currentCallAmount: number,
  playerChips: number
): 'fold' | 'check' | 'call' | 'raise' | 'allin' {
  const allCards = [...holeCards, ...communityCards]
  const ev = evaluateTexas7Cards(allCards)

  // 翻牌前决策
  if (communityCards.length === 0) {
    const isPair = holeCards[0].rank === holeCards[1].rank
    const highVal = Math.max(holeCards[0].value, holeCards[1].value)
    const isSuited = holeCards[0].suit === holeCards[1].suit

    // 强牌：高对子 (AA, KK, QQ, JJ) 或 AK 同花
    if (isPair && highVal >= 10) {
      return Math.random() < 0.5 ? 'raise' : 'call'
    }
    if (highVal >= 11 || (isSuited && highVal >= 9)) {
      return currentCallAmount === 0 ? 'check' : 'call'
    }
    // 垃圾牌
    if (currentCallAmount > 0 && Math.random() < 0.6) {
      return 'fold'
    }
    return currentCallAmount === 0 ? 'check' : 'call'
  }

  // 翻牌后决策
  // 葫芦、四条、同花顺、顺子、同花
  if (ev.score >= 40000000) {
    if (Math.random() < 0.5 && playerChips >= currentCallAmount * 3) {
      return 'raise'
    }
    return currentCallAmount === 0 ? 'check' : 'call'
  }

  // 两对或三条
  if (ev.score >= 20000000) {
    if (Math.random() < 0.3 && playerChips >= currentCallAmount * 2) {
      return 'raise'
    }
    return currentCallAmount === 0 ? 'check' : 'call'
  }

  // 一对
  if (ev.score >= 10000000) {
    if (currentCallAmount > playerChips * 0.3) {
      return Math.random() < 0.5 ? 'fold' : 'call'
    }
    return currentCallAmount === 0 ? 'check' : 'call'
  }

  // 高牌
  if (currentCallAmount > 0) {
    return Math.random() < 0.75 ? 'fold' : 'call'
  }
  return 'check'
}
