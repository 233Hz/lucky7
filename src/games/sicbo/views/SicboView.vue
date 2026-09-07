<template>
  <div class="max-w-5xl mx-auto px-4 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-3">
        <router-link to="/" class="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors">
          ← 返回大厅
        </router-link>
        <div>
          <h1 class="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <span>🎲 猜大小 · 骰宝 (Sic Bo)</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300">
              3骰摇宝 · 高达60倍赔率
            </span>
          </h1>
          <p class="text-xs text-slate-400">大(11-17) · 小(4-10) · 全围(三同号通吃) · 指定点数</p>
        </div>
      </div>
    </div>

    <!-- Main Shaker & Dice Table -->
    <div class="rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-slate-800 p-6 shadow-2xl space-y-6">
      <!-- Top Shaker Stage & History -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <!-- History Roadmap -->
        <div class="w-full md:w-auto flex flex-col items-center md:items-start space-y-1.5">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">近期开奖走势</span>
          <div class="flex items-center space-x-1.5 overflow-x-auto max-w-full py-1">
            <div
              v-for="(hist, idx) in historyList"
              :key="idx"
              class="flex flex-col items-center justify-center w-8 h-8 rounded-lg font-mono font-bold text-xs border"
              :class="[
                hist.isTriple ? 'bg-amber-950 border-amber-600 text-amber-300' :
                hist.isBig ? 'bg-rose-950 border-rose-700 text-rose-300' :
                'bg-sky-950 border-sky-700 text-sky-300'
              ]"
            >
              <span>{{ hist.sum }}</span>
            </div>
          </div>
        </div>

        <!-- Shaker Center Dome -->
        <div class="flex flex-col items-center">
          <div class="p-4 rounded-3xl bg-slate-950 border border-slate-800 shadow-inner flex flex-col items-center">
            <DiceBox :dice="currentResult.dice" :rolling="isRolling" />
            <div class="mt-2 flex items-center space-x-2 text-xs font-mono">
              <span class="text-slate-400">结果点数:</span>
              <span class="font-black text-amber-300 text-base">{{ currentResult.sum }} 点</span>
              <span
                class="px-2 py-0.5 rounded-full font-bold"
                :class="currentResult.isTriple ? 'bg-amber-500/20 text-amber-400' : currentResult.isBig ? 'bg-rose-500/20 text-rose-400' : 'bg-sky-500/20 text-sky-400'"
              >
                {{ currentResult.isTriple ? '全围(豹子)' : currentResult.isBig ? '大' : '小' }}
              </span>
              <span class="text-slate-400">·</span>
              <span class="text-slate-300">{{ currentResult.isOdd ? '单' : '双' }}</span>
            </div>
          </div>
        </div>

        <!-- Current Total Bet & Payout Status -->
        <div class="w-full md:w-auto flex flex-col items-center md:items-end space-y-1">
          <div class="text-xs text-slate-400 font-semibold">本局累计下注</div>
          <div class="text-2xl font-black font-mono text-amber-300">🪙 {{ formattedTotalBet }}</div>
          <div v-if="lastProfit !== null" class="text-xs font-mono font-bold" :class="lastProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'">
            上一局: {{ lastProfit >= 0 ? '+' : '' }}{{ lastProfit }} 🪙
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
            class="p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-between select-none relative"
            :class="getBetAmount('small') > 0 ? 'bg-sky-950/60 border-sky-500 shadow-lg shadow-sky-900/40' : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'"
          >
            <span class="text-xl font-black text-sky-400">小 (4-10)</span>
            <span class="text-xs text-slate-400 mt-1">1 赔 1 (全围通吃)</span>
            <div v-if="getBetAmount('small') > 0" class="mt-2 px-2.5 py-0.5 rounded-full bg-sky-900 text-sky-200 text-xs font-mono font-bold">
              🪙 {{ getBetAmount('small') }}
            </div>
          </div>

          <!-- 全围 (Any Triple) -->
          <div
            @click="placeBet('any_triple', undefined, '全围 (任意豹子)', 30)"
            class="p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-between select-none relative col-span-2 sm:col-span-1"
            :class="getBetAmount('any_triple') > 0 ? 'bg-amber-950/60 border-amber-500 shadow-lg shadow-amber-900/40' : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'"
          >
            <span class="text-xl font-black text-amber-400">👑 全 围</span>
            <span class="text-xs text-amber-300/80 mt-1 font-bold">1 赔 30 (高额彩金)</span>
            <div v-if="getBetAmount('any_triple') > 0" class="mt-2 px-2.5 py-0.5 rounded-full bg-amber-900 text-amber-200 text-xs font-mono font-bold">
              🪙 {{ getBetAmount('any_triple') }}
            </div>
          </div>

          <!-- 大 (Big) -->
          <div
            @click="placeBet('big', undefined, '大 (11-17)', 1)"
            class="p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-between select-none relative"
            :class="getBetAmount('big') > 0 ? 'bg-rose-950/60 border-rose-500 shadow-lg shadow-rose-900/40' : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'"
          >
            <span class="text-xl font-black text-rose-400">大 (11-17)</span>
            <span class="text-xs text-slate-400 mt-1">1 赔 1 (全围通吃)</span>
            <div v-if="getBetAmount('big') > 0" class="mt-2 px-2.5 py-0.5 rounded-full bg-rose-900 text-rose-200 text-xs font-mono font-bold">
              🪙 {{ getBetAmount('big') }}
            </div>
          </div>

          <!-- 单 (Odd) -->
          <div
            @click="placeBet('odd', undefined, '单', 1)"
            class="p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-between select-none relative"
            :class="getBetAmount('odd') > 0 ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-900/40' : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'"
          >
            <span class="text-xl font-black text-emerald-400">单 (Odd)</span>
            <span class="text-xs text-slate-400 mt-1">1 赔 1</span>
            <div v-if="getBetAmount('odd') > 0" class="mt-2 px-2.5 py-0.5 rounded-full bg-emerald-900 text-emerald-200 text-xs font-mono font-bold">
              🪙 {{ getBetAmount('odd') }}
            </div>
          </div>

          <!-- 双 (Even) -->
          <div
            @click="placeBet('even', undefined, '双', 1)"
            class="p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-between select-none relative"
            :class="getBetAmount('even') > 0 ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-900/40' : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'"
          >
            <span class="text-xl font-black text-indigo-400">双 (Even)</span>
            <span class="text-xs text-slate-400 mt-1">1 赔 1</span>
            <div v-if="getBetAmount('even') > 0" class="mt-2 px-2.5 py-0.5 rounded-full bg-indigo-900 text-indigo-200 text-xs font-mono font-bold">
              🪙 {{ getBetAmount('even') }}
            </div>
          </div>
        </div>

        <!-- 2. Specific Points Grid (4 - 17) -->
        <div class="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
          <div class="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">指定总点数 (Points 4 - 17)</div>
          <div class="grid grid-cols-4 sm:grid-cols-7 gap-2">
            <div
              v-for="pt in [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]"
              :key="pt"
              @click="placeBet('point', pt, `${pt}点`, pointOdds[pt])"
              class="p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center select-none"
              :class="getBetAmount('point', pt) > 0 ? 'bg-amber-950/50 border-amber-500' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'"
            >
              <span class="text-base font-black font-mono text-slate-200">{{ pt }}</span>
              <span class="text-[10px] text-amber-400/90 font-bold">1:{{ pointOdds[pt] }}</span>
              <span v-if="getBetAmount('point', pt) > 0" class="mt-1 text-[10px] font-mono font-bold text-amber-300">
                🪙{{ getBetAmount('point', pt) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 3. Single Die Pick (1 - 6) -->
        <div class="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
          <div class="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">单骰出现 (出现1/2/3次赔1/2/3倍)</div>
          <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <div
              v-for="d in [1, 2, 3, 4, 5, 6]"
              :key="d"
              @click="placeBet('single_die', d, `骰子${d}`, 1)"
              class="p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center select-none"
              :class="getBetAmount('single_die', d) > 0 ? 'bg-emerald-950/50 border-emerald-500' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'"
            >
              <div class="w-8 h-8 rounded-lg bg-white text-slate-900 font-black text-sm flex items-center justify-center shadow">
                {{ d }}
              </div>
              <span v-if="getBetAmount('single_die', d) > 0" class="mt-1 text-[10px] font-mono font-bold text-emerald-300">
                🪙{{ getBetAmount('single_die', d) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Controls: Chips + Roll Button -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <ChipSelector v-model="selectedChip" :disabled="isRolling" />

        <div class="flex items-center space-x-3 w-full sm:w-auto">
          <button
            @click="clearAllBets"
            :disabled="totalBetAmount === 0 || isRolling"
            class="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 border border-slate-700 transition-all disabled:opacity-40"
          >
            清空下注
          </button>
          <button
            @click="handleRoll"
            :disabled="totalBetAmount === 0 || isRolling || authStore.userChips < totalBetAmount"
            class="flex-1 sm:flex-none px-8 py-2.5 rounded-xl text-sm font-black text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-40"
          >
            {{ isRolling ? '摇盅中...' : '开始摇骰 🎲' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import confetti from 'canvas-confetti'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { sound } from '@/lib/sound'
import DiceBox from '@/components/game/DiceBox.vue'
import ChipSelector from '@/components/game/ChipSelector.vue'
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
