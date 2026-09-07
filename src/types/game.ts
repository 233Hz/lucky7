export type Suit = 'spades' | 'hearts' | 'clubs' | 'diamonds'
// Rank: 2-10, J, Q, K, A
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'

export interface Card {
  suit: Suit
  rank: Rank
  value: number // numerical value for sorting/comparisons (2=2, ..., 10=10, J=11, Q=12, K=13, A=14)
}

export type ChipValue = 10 | 50 | 100 | 500 | 1000 | 5000

export interface PlayerSeatInfo {
  id: string
  nickname: string
  avatarUrl: string
  chips: number
  currentBet: number
  status: 'active' | 'folded' | 'allin' | 'bust' | 'waiting'
  cards: Card[]
  isHost?: boolean
  isCurrentTurn?: boolean
  handName?: string
  isAI?: boolean
}
