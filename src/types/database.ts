export interface Profile {
  id: string
  email: string
  nickname: string
  avatar_url: string
  chips: number
  is_admin: boolean
  created_at?: string
  updated_at?: string
}

export interface DailyCheckin {
  id: string
  user_id: string
  checkin_date: string
  reward_chips: number
  streak_days: number
  created_at?: string
}

export interface ChipTransaction {
  id: string
  user_id: string
  amount: number
  type: 'register_bonus' | 'daily_checkin' | 'game_win' | 'game_loss' | 'admin_grant' | 'admin_deduct'
  balance_after: number
  note?: string
  created_at?: string
}

export interface GameRecord {
  id: string
  user_id: string
  game_type: 'zhajinhua' | 'blackjack' | 'texas' | 'sicbo' | 'marksix'
  room_id?: string | null
  bet_amount: number
  payout: number
  net_profit: number
  details: Record<string, unknown>
  created_at?: string
}

export interface GameRoom {
  id: string
  game_type: 'zhajinhua' | 'blackjack' | 'texas' | 'sicbo' | 'marksix'
  name: string
  min_bet: number
  max_players: number
  status: 'waiting' | 'playing' | 'settling'
  host_id: string | null
  round_state: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface RoomPlayer {
  id: string
  room_id: string
  user_id: string
  seat: number
  chips: number
  status: 'ready' | 'playing' | 'folded' | 'waiting'
  hand: unknown[]
  current_bet: number
  joined_at?: string
  profile?: Profile
}
