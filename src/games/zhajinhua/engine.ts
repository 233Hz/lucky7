import type { Card, Suit, Rank } from '@/types/game'
import type { ZhajinhuaEvaluation, ZhajinhuaHandType } from './types'

const SUITS: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds']
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14
}

// 创建标准52张牌一副
export function createDeck(): Card[] {
  const deck: Card[] = []
  for (const s of SUITS) {
    for (const r of RANKS) {
      deck.push({
        suit: s,
        rank: r,
        value: RANK_VALUES[r]
      })
    }
  }
  return deck
}

// 洗牌 (Fisher-Yates)
export function shuffleDeck(deck: Card[]): Card[] {
  const arr = [...deck]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// 评估 3 张手牌牌型
export function evaluateZhajinhua(cards: Card[]): ZhajinhuaEvaluation {
  if (cards.length !== 3) {
    return { type: 'danzhang', typeName: '散牌', score: 0, cards }
  }

  // 按牌点降序排列 (A=14, K=13, ..., 2=2)
  const sorted = [...cards].sort((a, b) => b.value - a.value)
  const [c1, c2, c3] = sorted

  const isSameSuit = c1.suit === c2.suit && c2.suit === c3.suit
  const isBaozi = c1.value === c2.value && c2.value === c3.value

  // 顺子判定：常规连续 (例如 K-Q-J, 5-4-3) 或 特殊 A-2-3 (A=14, 3, 2)
  let isStraight = false
  let straightHigh = c1.value

  if (c1.value - 1 === c2.value && c2.value - 1 === c3.value) {
    isStraight = true
    straightHigh = c1.value
  } else if (c1.value === 14 && c2.value === 3 && c3.value === 2) {
    // A-2-3 顺子 (点数排在 4-3-2 之下或常规顺子末端)
    isStraight = true
    straightHigh = 3.5 // 特殊权重标记
  }

  // 特殊 2-3-5 (不同花色)
  const is235 = !isSameSuit && c1.value === 5 && c2.value === 3 && c3.value === 2

  let type: ZhajinhuaHandType = 'danzhang'
  let typeName = '散牌'
  let score = 0

  if (isBaozi) {
    type = 'baozi'
    typeName = '豹子'
    score = 6000000 + c1.value * 10000
  } else if (isSameSuit && isStraight) {
    type = 'shunjin'
    typeName = '顺金 (同花顺)'
    score = 5000000 + straightHigh * 10000
  } else if (isSameSuit) {
    type = 'jinhua'
    typeName = '金花 (同花)'
    score = 4000000 + c1.value * 10000 + c2.value * 100 + c3.value
  } else if (isStraight) {
    type = 'shunzi'
    typeName = '顺子'
    score = 3000000 + straightHigh * 10000
  } else if (c1.value === c2.value || c2.value === c3.value || c1.value === c3.value) {
    type = 'duizi'
    typeName = '对子'
    const pairVal = c1.value === c2.value ? c1.value : c3.value === c2.value ? c2.value : c1.value
    const kicker = c1.value === c2.value ? c3.value : c3.value === c2.value ? c1.value : c2.value
    score = 2000000 + pairVal * 10000 + kicker * 100
  } else if (is235) {
    type = 'special_235'
    typeName = '特殊 235'
    score = 1000000 + c1.value * 10000 + c2.value * 100 + c3.value // 对阵豹子外作为散牌
  } else {
    type = 'danzhang'
    typeName = '单张散牌'
    score = 1000000 + c1.value * 10000 + c2.value * 100 + c3.value
  }

  return { type, typeName, score, cards: sorted }
}

// 两手牌比牌判定：1 代表 p1 胜，-1 代表 p2 胜，0 代表完全平手
export function compareZhajinhuaHands(h1: Card[], h2: Card[]): number {
  const ev1 = evaluateZhajinhua(h1)
  const ev2 = evaluateZhajinhua(h2)

  // 特殊规则：235 克制 豹子
  if (ev1.type === 'special_235' && ev2.type === 'baozi') return 1
  if (ev2.type === 'special_235' && ev1.type === 'baozi') return -1

  if (ev1.score > ev2.score) return 1
  if (ev1.score < ev2.score) return -1
  return 0
}

// AI 思考下注决策
export function getAIZhajinhuaAction(
  playerHand: Card[],
  seen: boolean,
  currentRound: number,
  currentBetUnit: number,
  playerChips: number
): 'blind' | 'check' | 'call' | 'raise' | 'compare' | 'fold' {
  // 未看牌且在前2轮，有较高概率继续闷牌
  if (!seen && currentRound <= 2 && Math.random() < 0.65) {
    return 'call'
  }

  // 决定是否看牌
  if (!seen) {
    return 'check'
  }

  const ev = evaluateZhajinhua(playerHand)

  // 极佳牌型：豹子、顺金、金花
  if (ev.type === 'baozi' || ev.type === 'shunjin' || ev.type === 'jinhua') {
    if (Math.random() < 0.45 && playerChips >= currentBetUnit * 4) {
      return 'raise'
    }
    return 'call'
  }

  // 较好牌型：顺子、大对子(10及以上)
  if (ev.type === 'shunzi' || (ev.type === 'duizi' && ev.score > 2100000)) {
    if (currentRound > 3 && Math.random() < 0.4) {
      return 'compare'
    }
    return 'call'
  }

  // 普通对子
  if (ev.type === 'duizi') {
    if (currentRound >= 4) {
      return Math.random() < 0.6 ? 'compare' : 'fold'
    }
    return 'call'
  }

  // 散牌：看牌后散牌容易弃牌，偶尔诈唬 (bluffing)
  if (ev.type === 'danzhang' || ev.type === 'special_235') {
    if (currentRound <= 2 && Math.random() < 0.15) {
      return 'call' // 偶尔偷鸡诈唬
    }
    return 'fold'
  }

  return 'call'
}
