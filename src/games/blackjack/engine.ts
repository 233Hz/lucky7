import type { Card, Rank, Suit } from '@/types/game'
import type { BlackjackHandScore, BlackjackOutcome } from './types'

const SUITS: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds']
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

export function createBlackjackDeck(decksCount = 4): Card[] {
  const deck: Card[] = []
  for (let d = 0; d < decksCount; d++) {
    for (const s of SUITS) {
      for (const r of RANKS) {
        let val = parseInt(r, 10)
        if (['J', 'Q', 'K'].includes(r)) val = 10
        if (r === 'A') val = 11
        deck.push({ suit: s, rank: r, value: val })
      }
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

// 计算手牌点数（软硬 A 智能转换）
export function calculateHandScore(cards: Card[]): BlackjackHandScore {
  if (!cards || cards.length === 0) {
    return { total: 0, isSoft: false, isBlackjack: false, isBust: false }
  }

  let total = 0
  let aceCount = 0

  for (const c of cards) {
    if (c.rank === 'A') {
      aceCount++
      total += 11
    } else {
      total += c.value
    }
  }

  // 若爆牌则将 A 的点数从 11 转为 1
  let isSoft = aceCount > 0
  while (total > 21 && aceCount > 0) {
    total -= 10
    aceCount--
    if (aceCount === 0) isSoft = false
  }

  const isBlackjack = cards.length === 2 && total === 21
  const isBust = total > 21

  return { total, isSoft, isBlackjack, isBust }
}

// 胜负与赔率判定
export function determineBlackjackOutcome(
  player: BlackjackHandScore,
  dealer: BlackjackHandScore
): { outcome: BlackjackOutcome; multiplier: number; description: string } {
  // 1. 玩家爆牌，直接判负
  if (player.isBust) {
    return { outcome: 'player_bust', multiplier: 0, description: '玩家爆牌，闲家负' }
  }

  // 2. 双方同为天王 Blackjack -> 平局
  if (player.isBlackjack && dealer.isBlackjack) {
    return { outcome: 'push', multiplier: 1, description: '双方皆为 Blackjack，平局退注' }
  }

  // 3. 玩家天王 Blackjack (3:2 派彩，即获得 2.5 倍返还，净利润 1.5 倍)
  if (player.isBlackjack) {
    return { outcome: 'player_blackjack', multiplier: 2.5, description: 'Blackjack 天王！3:2 豪华派彩' }
  }

  // 4. 庄家天王 Blackjack
  if (dealer.isBlackjack) {
    return { outcome: 'dealer_win', multiplier: 0, description: '庄家 Blackjack 天王，闲家负' }
  }

  // 5. 庄家爆牌
  if (dealer.isBust) {
    return { outcome: 'dealer_bust', multiplier: 2.0, description: '庄家爆牌，闲家获胜！' }
  }

  // 6. 比点数
  if (player.total > dealer.total) {
    return { outcome: 'player_win', multiplier: 2.0, description: '点数高于庄家，闲家获胜！' }
  } else if (player.total < dealer.total) {
    return { outcome: 'dealer_win', multiplier: 0, description: '庄家点数更大，闲家负' }
  } else {
    return { outcome: 'push', multiplier: 1.0, description: '点数相同，平局退还下注' }
  }
}
