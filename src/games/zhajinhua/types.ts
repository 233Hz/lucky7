import type { Card } from '@/types/game'

export type ZhajinhuaHandType =
  | 'baozi'       // 豹子 (Three of a Kind)
  | 'shunjin'     // 顺金 (Straight Flush)
  | 'jinhua'      // 金花 (Flush)
  | 'shunzi'      // 顺子 (Straight)
  | 'duizi'       // 对子 (Pair)
  | 'danzhang'    // 单张 (High Card)
  | 'special_235' // 特殊 235 (不同花色的 2-3-5，克制豹子)

export interface ZhajinhuaEvaluation {
  type: ZhajinhuaHandType
  typeName: string
  score: number // 用于直接比较牌型权重
  cards: Card[]
}

export interface ZhajinhuaPlayer {
  id: string
  nickname: string
  avatarUrl: string
  chips: number
  cards: Card[]
  seen: boolean      // 是否已看牌（看牌后下注需翻倍）
  folded: boolean    // 是否已弃牌
  currentBet: number // 本局累计下注额
  isAI: boolean
}
