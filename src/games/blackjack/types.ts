export interface BlackjackHandScore {
  total: number
  isSoft: boolean
  isBlackjack: boolean
  isBust: boolean
}

export type BlackjackOutcome =
  | 'player_blackjack' // 玩家天王 3:2 派彩
  | 'player_win'       // 玩家胜利 1:1
  | 'dealer_bust'      // 庄家爆牌玩家胜 1:1
  | 'push'             // 平局 (退还下注)
  | 'player_bust'      // 玩家爆牌输
  | 'dealer_win'       // 庄家点数更大输
