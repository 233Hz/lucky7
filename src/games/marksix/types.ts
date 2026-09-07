export type MarkSixBetType =
  | 'exact_number' // 特码直选 1-49 (1:47)
  | 'big_small'    // 特码大小 (1:1.95)
  | 'odd_even'     // 特码单双 (1:1.95)
  | 'wave_color'   // 波色 红/蓝/绿 (1:2.8)
  | 'zodiac'       // 十二生肖 (1:11)

export interface MarkSixBetItem {
  type: MarkSixBetType
  value: string | number
  name: string
  odds: number
  amount: number
}

export interface MarkSixDrawResult {
  period: string
  number: number
  waveColor: 'red' | 'blue' | 'green'
  isBig: boolean
  isSmall: boolean
  isOdd: boolean
  isEven: boolean
  zodiac: string
  drawnAt: string
}
