export type SicBoBetType =
  | 'small'       // 小 (4-10)
  | 'big'         // 大 (11-17)
  | 'odd'         // 单
  | 'even'        // 双
  | 'any_triple'  // 全围 (任意三同号)
  | 'point'       // 指定总点数 (4 - 17)
  | 'single_die'  // 单骰出现 (1 - 6)

export interface SicBoBetItem {
  type: SicBoBetType
  value?: number // 例如点数 4..17 或 骰子面 1..6
  name: string
  odds: number
  amount: number
}

export interface SicBoRollResult {
  period?: string
  dice: [number, number, number]
  sum: number
  isBig: boolean
  isSmall: boolean
  isOdd: boolean
  isEven: boolean
  isTriple: boolean
}
