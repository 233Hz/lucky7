<template>
  <div class="max-w-5xl mx-auto px-4 py-6 font-mono">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4 border-b-4 border-black pb-3">
      <div class="flex items-center space-x-3">
        <router-link to="/" class="brutal-btn-white px-3 py-1.5 text-xs">
          <ArrowLeft class="w-4 h-4 mr-1" />
          <span>返回大厅</span>
        </router-link>
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-black uppercase flex items-center gap-2">
            <Dices class="w-6 h-6 text-black" />
            <span>猜大小 · 骰宝 (Sic Bo)</span>
            <span class="text-xs px-2.5 py-0.5 rounded-none bg-black text-[#ff006e] border-2 border-black font-black uppercase shadow-brutal-sm">
              3骰摇宝 · 高达60倍赔率
            </span>
          </h1>
          <p class="text-xs text-black font-bold mt-0.5">大(11-17) · 小(4-10) · 全围(三同号通吃) · 指定点数</p>
        </div>
      </div>
    </div>

    <!-- Main Shaker & Dice Table -->
    <div class="rounded-none bg-white border-4 border-black p-6 shadow-brutal-xl space-y-6 text-black">
      <!-- Top Shaker Stage & History -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b-2 border-black">
        <!-- History Roadmap -->
        <div class="w-full md:w-auto flex flex-col items-center md:items-start space-y-1.5">
          <span class="text-xs font-black text-black uppercase tracking-wider">近期开奖走势</span>
          <div class="flex items-center space-x-1.5 overflow-x-auto max-w-full py-1">
            <div
              v-for="(hist, idx) in historyList"
              :key="idx"
              class="flex flex-col items-center justify-center w-8 h-8 rounded-none font-mono font-black text-xs border-2 border-black shadow-brutal-sm"
              :class="[
                hist.isTriple ? 'bg-[#ffff00] text-black' :
                hist.isBig ? 'bg-[#ff006e] text-white' :
                'bg-[#00d9ff] text-black'
              ]"
            >
              <span>{{ hist.sum }}</span>
            </div>
          </div>
        </div>

        <!-- Shaker Center Dome -->
        <div class="flex flex-col items-center">
          <div class="p-4 rounded-none bg-[#f4f4f0] border-3 border-black shadow-brutal flex flex-col items-center">
            <DiceBox :dice="currentResult.dice" :rolling="isRolling" />
            <div class="mt-2 flex items-center space-x-2 text-xs font-mono font-black">
              <span class="text-black">结果点数:</span>
              <span class="text-black text-base">{{ currentResult.sum }} 点</span>
              <span
                class="px-2 py-0.5 rounded-none border border-black shadow-brutal-sm"
                :class="currentResult.isTriple ? 'bg-[#ffff00] text-black' : currentResult.isBig ? 'bg-[#ff006e] text-white' : 'bg-[#00d9ff] text-black'"
              >
                {{ currentResult.isTriple ? '全围(豹子)' : currentResult.isBig ? '大' : '小' }}
              </span>
              <span>·</span>
              <span class="text-black">{{ currentResult.isOdd ? '单' : '双' }}</span>
            </div>
          </div>
        </div>

        <!-- Current Total Bet & Payout Status -->
        <div class="w-full md:w-auto flex flex-col items-center md:items-end space-y-1">
          <div class="text-xs text-black font-black uppercase">本局累计下注</div>
          <div class="text-2xl font-black font-mono text-black flex items-center gap-1.5">
            <CoinIcon customClass="w-5 h-5" />
            <span>{{ formattedTotalBet }}</span>
          </div>
          <div v-if="lastProfit !== null" class="text-xs font-mono font-black flex items-center gap-1" :class="lastProfit >= 0 ? 'text-[#059669]' : 'text-[#ff006e]'">
            <span>上一局: {{ lastProfit >= 0 ? '+' : '' }}{{ lastProfit }}</span>
            <CoinIcon customClass="w-3 h-3" />
          </div>
        </div>
      </div>

      <!-- Betting Table Felt Areas -->
      <div class="space-y-4">
        <!-- 1. Primary Bets (Small, Triple, Big, Odd, Even) -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <!-- 小 (Small) -->
          <div
            @click="placeBet('small', undefined, '小 (4-10)', 1)"
            class="p-4 rounded-none border-3 border-black transition-all cursor-pointer flex flex-col items-center justify-between select-none relative"
            :class="getBetAmount('small') > 0 ? 'bg-[#00d9ff] text-black shadow-brutal -translate-y-1' : 'bg-white hover:bg-[#e0f7ff] shadow-brutal-sm'"
          >
            <span class="text-xl font-black">小 (4-10)</span>
            <span class="text-xs font-bold mt-1">1 赔 1 (全围通吃)</span>
            <div v-if="getBetAmount('small') > 0" class="mt-2 px-2.5 py-0.5 rounded-none bg-black text-[#00d9ff] text-xs font-mono font-black flex items-center gap-1 shadow-brutal-sm">
              <CoinIcon customClass="w-3 h-3" />
              <span>{{ getBetAmount('small') }}</span>
            </div>
          </div>

          <!-- 全围 (Any Triple) -->
          <div
            @click="placeBet('any_triple', undefined, '全围 (任意豹子)', 30)"
            class="p-4 rounded-none border-3 border-black transition-all cursor-pointer flex flex-col items-center justify-between select-none relative col-span-2 sm:col-span-1"
            :class="getBetAmount('any_triple') > 0 ? 'bg-[#ffff00] text-black shadow-brutal -translate-y-1' : 'bg-white hover:bg-[#ffffcc] shadow-brutal-sm'"
          >
            <span class="text-xl font-black flex items-center gap-1.5">
              <Crown class="w-5 h-5 text-black" />
              <span>全 围</span>
            </span>
            <span class="text-xs font-bold mt-1">1 赔 30 (高额彩金)</span>
            <div v-if="getBetAmount('any_triple') > 0" class="mt-2 px-2.5 py-0.5 rounded-none bg-black text-[#ffff00] text-xs font-mono font-black flex items-center gap-1 shadow-brutal-sm">
              <CoinIcon customClass="w-3 h-3" />
              <span>{{ getBetAmount('any_triple') }}</span>
            </div>
          </div>

          <!-- 大 (Big) -->
          <div
            @click="placeBet('big', undefined, '大 (11-17)', 1)"
            class="p-4 rounded-none border-3 border-black transition-all cursor-pointer flex flex-col items-center justify-between select-none relative"
            :class="getBetAmount('big') > 0 ? 'bg-[#ff006e] text-white shadow-brutal -translate-y-1' : 'bg-white hover:bg-[#ffe6f0] shadow-brutal-sm'"
          >
            <span class="text-xl font-black">大 (11-17)</span>
            <span class="text-xs font-bold mt-1" :class="getBetAmount('big') > 0 ? 'text-white' : 'text-black'">1 赔 1 (全围通吃)</span>
            <div v-if="getBetAmount('big') > 0" class="mt-2 px-2.5 py-0.5 rounded-none bg-black text-[#ff006e] text-xs font-mono font-black flex items-center gap-1 shadow-brutal-sm">
              <CoinIcon customClass="w-3 h-3" />
              <span>{{ getBetAmount('big') }}</span>
            </div>
          </div>

          <!-- 单 (Odd) -->
          <div
            @click="placeBet('odd', undefined, '单', 1)"
            class="p-4 rounded-none border-3 border-black transition-all cursor-pointer flex flex-col items-center justify-between select-none relative"
            :class="getBetAmount('odd') > 0 ? 'bg-[#ccff00] text-black shadow-brutal -translate-y-1' : 'bg-white hover:bg-[#f2ffcc] shadow-brutal-sm'"
          >
            <span class="text-xl font-black">单 (Odd)</span>
            <span class="text-xs font-bold mt-1">1 赔 1</span>
            <div v-if="getBetAmount('odd') > 0" class="mt-2 px-2.5 py-0.5 rounded-none bg-black text-[#ccff00] text-xs font-mono font-black flex items-center gap-1 shadow-brutal-sm">
              <CoinIcon customClass="w-3 h-3" />
              <span>{{ getBetAmount('odd') }}</span>
            </div>
          </div>

          <!-- 双 (Even) -->
          <div
            @click="placeBet('even', undefined, '双', 1)"
            class="p-4 rounded-none border-3 border-black transition-all cursor-pointer flex flex-col items-center justify-between select-none relative"
            :class="getBetAmount('even') > 0 ? 'bg-[#ff9500] text-black shadow-brutal -translate-y-1' : 'bg-white hover:bg-[#ffeedd] shadow-brutal-sm'"
          >
            <span class="text-xl font-black">双 (Even)</span>
            <span class="text-xs font-bold mt-1">1 赔 1</span>
            <div v-if="getBetAmount('even') > 0" class="mt-2 px-2.5 py-0.5 rounded-none bg-black text-[#ff9500] text-xs font-mono font-black flex items-center gap-1 shadow-brutal-sm">
              <CoinIcon customClass="w-3 h-3" />
              <span>{{ getBetAmount('even') }}</span>
            </div>
          </div>
        </div>

        <!-- 2. Specific Points Grid (4 - 17) -->
        <div class="rounded-none bg-[#f4f4f0] border-3 border-black p-4 shadow-brutal-sm">
          <div class="text-xs font-black text-black mb-2 uppercase tracking-wider">指定总点数 (Points 4 - 17)</div>
          <div class="grid grid-cols-4 sm:grid-cols-7 gap-2">
            <div
              v-for="pt in [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]"
              :key="pt"
              @click="placeBet('point', pt, `${pt}点`, pointOdds[pt])"
              class="p-2.5 rounded-none border-2 border-black transition-all cursor-pointer flex flex-col items-center justify-center select-none"
              :class="getBetAmount('point', pt) > 0 ? 'bg-[#ffff00] text-black shadow-brutal-sm -translate-y-0.5' : 'bg-white hover:bg-[#ffffea]'"
            >
              <span class="text-base font-black font-mono text-black">{{ pt }}</span>
              <span class="text-[10px] font-black text-black">1:{{ pointOdds[pt] }}</span>
              <span v-if="getBetAmount('point', pt) > 0" class="mt-1 text-[10px] font-mono font-black text-black flex items-center gap-0.5">
                <CoinIcon customClass="w-2.5 h-2.5" />
                <span>{{ getBetAmount('point', pt) }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- 3. Single Die Pick (1 - 6) -->
        <div class="rounded-none bg-[#f4f4f0] border-3 border-black p-4 shadow-brutal-sm">
          <div class="text-xs font-black text-black mb-2 uppercase tracking-wider">单骰出现 (出现1/2/3次赔1/2/3倍)</div>
          <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <div
              v-for="d in [1, 2, 3, 4, 5, 6]"
              :key="d"
              @click="placeBet('single_die', d, `骰子${d}`, 1)"
              class="p-2.5 rounded-none border-2 border-black transition-all cursor-pointer flex flex-col items-center justify-center select-none"
              :class="getBetAmount('single_die', d) > 0 ? 'bg-[#ccff00] text-black shadow-brutal-sm -translate-y-0.5' : 'bg-white hover:bg-[#ffffea]'"
            >
              <div class="w-8 h-8 rounded-none border-2 border-black bg-white text-black font-black text-sm flex items-center justify-center shadow-brutal-sm">
                {{ d }}
              </div>
              <span v-if="getBetAmount('single_die', d) > 0" class="mt-1 text-[10px] font-mono font-black text-black flex items-center gap-0.5">
                <CoinIcon customClass="w-2.5 h-2.5" />
                <span>{{ getBetAmount('single_die', d) }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Controls: Chips + Roll Button -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-black">
        <ChipSelector v-model="selectedChip" :disabled="isRolling" />

        <div class="flex items-center space-x-3 w-full sm:w-auto">
          <button
            @click="clearAllBets"
            :disabled="totalBetAmount === 0 || isRolling"
            class="brutal-btn-white px-4 py-2.5 text-xs flex-1 sm:flex-none"
          >
            清空下注
          </button>
          <button
            @click="handleRoll"
            :disabled="totalBetAmount === 0 || isRolling || authStore.userChips < totalBetAmount"
            class="brutal-btn-lime px-8 py-2.5 text-sm flex-1 sm:flex-none flex items-center justify-center gap-2"
          >
            <Dices class="w-4 h-4 mr-1" />
            <span>{{ isRolling ? '摇盅中...' : '开始摇骰' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import confetti from 'canvas-confetti'
import { Dices, ArrowLeft, Crown } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { sound } from '@/lib/sound'
import DiceBox from '@/components/game/DiceBox.vue'
import ChipSelector from '@/components/game/ChipSelector.vue'
import CoinIcon from '@/components/common/CoinIcon.vue'
import { rollThreeDice, calculateSicBoSettlement, POINT_ODDS } from '../engine'
import type { SicBoBetItem, SicBoBetType, SicBoRollResult } from '../types'

const authStore = useAuthStore()
const walletStore = useWalletStore()

const pointOdds = POINT_ODDS
const selectedChip = ref<number>(100)
const bets = ref<SicBoBetItem[]>([])
const isRolling = ref<boolean>(false)
const lastProfit = ref<number | null>(null)

const currentResult = ref<SicBoRollResult>({
  dice: [3, 4, 5],
  sum: 12,
  isBig: true,
  isSmall: false,
  isOdd: false,
  isEven: true,
  isTriple: false
})

const historyList = ref<SicBoRollResult[]>([
  { dice: [4, 5, 6], sum: 15, isBig: true, isSmall: false, isOdd: true, isEven: false, isTriple: false },
  { dice: [2, 3, 4], sum: 9, isBig: false, isSmall: true, isOdd: true, isEven: false, isTriple: false },
  { dice: [5, 5, 5], sum: 15, isBig: false, isSmall: false, isOdd: true, isEven: false, isTriple: true },
  { dice: [1, 2, 5], sum: 8, isBig: false, isSmall: true, isOdd: false, isEven: true, isTriple: false },
  { dice: [3, 4, 5], sum: 12, isBig: true, isSmall: false, isOdd: false, isEven: true, isTriple: false }
])

const totalBetAmount = computed(() => {
  return bets.value.reduce((acc, b) => acc + b.amount, 0)
})

const formattedTotalBet = computed(() => {
  return new Intl.NumberFormat('en-US').format(totalBetAmount.value)
})

function getBetAmount(type: SicBoBetType, value?: number): number {
  const item = bets.value.find(b => b.type === type && b.value === value)
  return item ? item.amount : 0
}

function placeBet(type: SicBoBetType, value: number | undefined, name: string, odds: number) {
  if (isRolling.value) return
  sound.playChip()

  const existing = bets.value.find(b => b.type === type && b.value === value)
  if (existing) {
    existing.amount += selectedChip.value
  } else {
    bets.value.push({
      type,
      value,
      name,
      odds,
      amount: selectedChip.value
    })
  }
}

function clearAllBets() {
  if (isRolling.value) return
  bets.value = []
}

// 摇骰子
async function handleRoll() {
  if (totalBetAmount.value === 0 || isRolling.value) return
  if (authStore.userChips < totalBetAmount.value) {
    alert('筹码不足！')
    return
  }

  isRolling.value = true
  lastProfit.value = null
  sound.playDiceRoll()

  // 动画模拟持续 1.2 秒
  const interval = setInterval(() => {
    currentResult.value.dice = [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1
    ]
  }, 100)

  setTimeout(async () => {
    clearInterval(interval)
    const result = rollThreeDice()
    currentResult.value = result
    historyList.value.unshift(result)
    if (historyList.value.length > 15) historyList.value.pop()

    isRolling.value = false

    // 结算
    const { totalBet, totalPayout, netProfit } = calculateSicBoSettlement(bets.value, result)
    lastProfit.value = netProfit

    if (netProfit > 0) {
      sound.playWin()
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } })
    } else if (netProfit < 0) {
      sound.playLose()
    }

    // 同步到 Supabase 战绩与余额
    await walletStore.recordGameSettlement(
      'sicbo',
      totalBet,
      totalPayout,
      {
        dice: result.dice,
        sum: result.sum,
        isTriple: result.isTriple
      }
    )

    // 清空下注以备下一轮
    bets.value = []
  }, 1200)
}
</script>
