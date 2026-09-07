import type { Card } from '@/types/game'

export type TexasHandRank =
  | 'royal_flush'     // 皇家同花顺
  | 'straight_flush'  // 同花顺
  | 'four_of_a_kind'  // 四条 (炸弹)
  | 'full_house'      // 葫芦 (三带二)
  | 'flush'           // 同花
  | 'straight'        // 顺子
  | 'three_of_a_kind' // 三条
  | 'two_pair'        // 两对
  | 'one_pair'        // 一对
  | 'high_card'       // 高牌

export interface TexasEvaluation {
  rank: TexasHandRank
  rankName: string
  score: number
  bestFiveCards: Card[]
}

export type TexasBetRound = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'

export interface TexasPlayer {
  id: string
  nickname: string
  avatarUrl: string
  chips: number
  holeCards: Card[]
  currentBet: number
  folded: boolean
  isAllIn: boolean
  isAI: boolean
}
