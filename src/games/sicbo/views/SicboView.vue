<template>
  <div class="max-w-7xl mx-auto px-4 py-6 font-mono">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b-4 border-[#1a1a1a] pb-3">
      <div class="flex items-center space-x-3">
        <router-link to="/" class="comic-btn-white px-3 py-1.5 text-xs">
          <ArrowLeft class="w-4 h-4 mr-1" />
          <span>返回大厅</span>
        </router-link>
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-[#1a1a1a] uppercase flex items-center gap-2">
            <Dices class="w-6 h-6 text-[#1a1a1a]" />
            <span>猜大小 · 骰宝 (Sic Bo)</span>
            <span class="text-xs px-2.5 py-0.5 rounded-md bg-[#1a1a1a] text-[#ef4444] border-2 border-[#1a1a1a] font-black uppercase shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
              全服定时开奖
            </span>
          </h1>
          <p class="text-xs text-[#1a1a1a] font-bold mt-0.5">大(11-17) · 小(4-10) · 全围(三同号通吃) · 指定点数</p>
        </div>
      </div>

      <!-- Synchronized Period & Countdown Timer -->
      <div class="flex items-center gap-3">
        <div class="text-right">
          <div class="text-[10px] text-[#1a1a1a] font-black uppercase">当前开奖期号</div>
          <div class="text-sm font-black font-mono text-[#1a1a1a] bg-[#facc15] px-2.5 py-0.5 rounded-md border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            {{ lotteryStore.sicboPeriod }}
          </div>
        </div>
        <div class="flex flex-col items-center">
          <div
            class="px-4 py-1.5 rounded-md border-2 border-[#1a1a1a] font-mono font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
            :class="lotteryStore.isSicboDrawing ? 'bg-[#ef4444] text-white animate-pulse' : 'bg-[#22c55e] text-[#1a1a1a]'"
          >
            <Clock class="w-4 h-4" />
            <span>{{ lotteryStore.isSicboDrawing ? '封盘·开奖摇骰中' : `开奖倒计时 ${lotteryStore.sicboRemainingSeconds}s` }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Layout Grid (Left: Game Table, Right: Public Chat Room) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Main Shaker & Dice Table -->
      <div class="lg:col-span-8 rounded-none bg-[#fffef0] border-4 border-[#1a1a1a] p-6 shadow-brutal-xl space-y-6 text-[#1a1a1a]">
      <!-- Top Shaker Stage & History -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b-4 border-[#1a1a1a]">
        <!-- History Roadmap -->
        <div class="w-full md:w-auto flex flex-col items-center md:items-start space-y-1.5">
          <span class="text-xs font-black text-[#1a1a1a] uppercase tracking-wider">近期开奖走势</span>
          <div class="flex items-center space-x-1.5 overflow-x-auto max-w-full py-1">
            <div
              v-for="(hist, idx) in historyList"
              :key="idx"
              class="flex flex-col items-center justify-center w-8 h-8 rounded-md font-mono font-black text-xs border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
              :class="[
                hist.isTriple ? 'bg-[#facc15] text-[#1a1a1a]' :
                hist.isBig ? 'bg-[#ef4444] text-white' :
                'bg-[#3b82f6] text-white'
              ]"
            >
              <span>{{ hist.sum }}</span>
            </div>
          </div>
        </div>

        <!-- Shaker Center Dome -->
        <div class="flex flex-col items-center">
          <div class="p-4 rounded-xl bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex flex-col items-center">
            <DiceBox :dice="currentResult.dice" :rolling="isRolling" />
            <div class="mt-2 flex items-center space-x-2 text-xs font-mono font-black">
              <span class="text-[#1a1a1a]">结果点数:</span>
              <span class="text-[#1a1a1a] text-base">{{ currentResult.sum }} 点</span>
              <span
                class="px-2 py-0.5 rounded-md border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
                :class="currentResult.isTriple ? 'bg-[#facc15] text-[#1a1a1a]' : currentResult.isBig ? 'bg-[#ef4444] text-white' : 'bg-[#3b82f6] text-white'"
              >
                {{ currentResult.isTriple ? '全围(豹子)' : currentResult.isBig ? '大' : '小' }}
              </span>
              <span>·</span>
              <span class="text-[#1a1a1a]">{{ currentResult.isOdd ? '单' : '双' }}</span>
            </div>
          </div>
        </div>

        <!-- Current Total Bet & Payout Status -->
        <div class="w-full md:w-auto flex flex-col items-center md:items-end space-y-1">
          <div class="text-xs text-[#1a1a1a] font-black uppercase">本局累计下注</div>
          <div class="text-2xl font-black font-mono text-[#1a1a1a] flex items-center gap-1.5">
            <CoinIcon customClass="w-5 h-5" />
            <span>{{ formattedTotalBet }}</span>
          </div>
          <div v-if="lastProfit !== null" class="text-xs font-mono font-black flex items-center gap-1" :class="lastProfit >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'">
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
            class="p-4 rounded-xl border-4 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-between select-none relative"
            :class="getBetAmount('small') > 0 ? 'bg-[#3b82f6] text-white shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'bg-[#fffef0] text-[#1a1a1a] hover:bg-[#e0f2fe] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'"
          >
            <span class="text-xl font-black">小 (4-10)</span>
            <span class="text-xs font-bold mt-1">1 赔 1 (全围通吃)</span>
            <div v-if="getBetAmount('small') > 0" class="mt-2 px-2.5 py-0.5 rounded-md bg-[#1a1a1a] text-[#fffef0] text-xs font-mono font-black flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
              <CoinIcon customClass="w-3 h-3" />
              <span>{{ getBetAmount('small') }}</span>
            </div>
          </div>

          <!-- 全围 (Any Triple) -->
          <div
            @click="placeBet('any_triple', undefined, '全围 (任意豹子)', 30)"
            class="p-4 rounded-xl border-4 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-between select-none relative col-span-2 sm:col-span-1"
            :class="getBetAmount('any_triple') > 0 ? 'bg-[#facc15] text-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'bg-[#fffef0] text-[#1a1a1a] hover:bg-[#fef9c3] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'"
          >
            <span class="text-xl font-black flex items-center gap-1">
              <Crown class="w-4 h-4 text-[#1a1a1a]" />
              <span>全 围</span>
            </span>
            <span class="text-xs font-bold mt-1">1 赔 30 (高额彩金)</span>
            <div v-if="getBetAmount('any_triple') > 0" class="mt-2 px-2.5 py-0.5 rounded-md bg-[#1a1a1a] text-[#facc15] text-xs font-mono font-black flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
              <CoinIcon customClass="w-3 h-3" />
              <span>{{ getBetAmount('any_triple') }}</span>
            </div>
          </div>

          <!-- 大 (Big) -->
          <div
            @click="placeBet('big', undefined, '大 (11-17)', 1)"
            class="p-4 rounded-xl border-4 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-between select-none relative"
            :class="getBetAmount('big') > 0 ? 'bg-[#ef4444] text-white shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'bg-[#fffef0] text-[#1a1a1a] hover:bg-[#fee2e2] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'"
          >
            <span class="text-xl font-black">大 (11-17)</span>
            <span class="text-xs font-bold mt-1">1 赔 1 (全围通吃)</span>
            <div v-if="getBetAmount('big') > 0" class="mt-2 px-2.5 py-0.5 rounded-md bg-[#1a1a1a] text-white text-xs font-mono font-black flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
              <CoinIcon customClass="w-3 h-3" />
              <span>{{ getBetAmount('big') }}</span>
            </div>
          </div>

          <!-- 单 (Odd) -->
          <div
            @click="placeBet('odd', undefined, '单 (Odd)', 1)"
            class="p-4 rounded-xl border-4 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-between select-none relative"
            :class="getBetAmount('odd') > 0 ? 'bg-[#22c55e] text-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'bg-[#fffef0] text-[#1a1a1a] hover:bg-[#dcfce7] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'"
          >
            <span class="text-xl font-black">单 (Odd)</span>
            <span class="text-xs font-bold mt-1">1 赔 1</span>
            <div v-if="getBetAmount('odd') > 0" class="mt-2 px-2.5 py-0.5 rounded-md bg-[#1a1a1a] text-[#22c55e] text-xs font-mono font-black flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
              <CoinIcon customClass="w-3 h-3" />
              <span>{{ getBetAmount('odd') }}</span>
            </div>
          </div>

          <!-- 双 (Even) -->
          <div
            @click="placeBet('even', undefined, '双 (Even)', 1)"
            class="p-4 rounded-xl border-4 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-between select-none relative"
            :class="getBetAmount('even') > 0 ? 'bg-[#facc15] text-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'bg-[#fffef0] text-[#1a1a1a] hover:bg-[#fef08a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'"
          >
            <span class="text-xl font-black">双 (Even)</span>
            <span class="text-xs font-bold mt-1">1 赔 1</span>
            <div v-if="getBetAmount('even') > 0" class="mt-2 px-2.5 py-0.5 rounded-md bg-[#1a1a1a] text-[#facc15] text-xs font-mono font-black flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
              <CoinIcon customClass="w-3 h-3" />
              <span>{{ getBetAmount('even') }}</span>
            </div>
          </div>
        </div>

        <!-- 2. Points Bets (4-17) -->
        <div class="p-4 rounded-xl bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] space-y-2">
          <div class="text-xs font-black text-[#1a1a1a] uppercase tracking-wider">指定总点数 (POINTS 4 - 17)</div>
          <div class="grid grid-cols-7 gap-2">
            <div
              v-for="pt in 14"
              :key="pt + 3"
              @click="placeBet('point', pt + 3, `${pt + 3}点`, pointOdds[pt + 3])"
              class="p-2 rounded-lg border-2 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-center select-none"
              :class="getBetAmount('point', pt + 3) > 0 ? 'bg-[#facc15] text-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] -translate-y-0.5' : 'bg-white hover:bg-[#fffef0]'"
            >
              <span class="text-sm font-black">{{ pt + 3 }}</span>
              <span class="text-[10px] font-mono text-[#1a1a1a] font-bold">1:{{ pointOdds[pt + 3] }}</span>
              <span v-if="getBetAmount('point', pt + 3) > 0" class="mt-1 text-[9px] font-mono font-black bg-[#1a1a1a] text-[#facc15] px-1 rounded-sm flex items-center gap-0.5">
                <CoinIcon customClass="w-2 h-2" />
                <span>{{ getBetAmount('point', pt + 3) }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- 3. Single Die Bets (1-6) -->
        <div class="p-4 rounded-xl bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] space-y-2">
          <div class="text-xs font-black text-[#1a1a1a] uppercase tracking-wider">单骰出现 (出现1/2/3次赔1/2/3倍)</div>
          <div class="grid grid-cols-6 gap-2">
            <div
              v-for="d in 6"
              :key="d"
              @click="placeBet('single_die', d, `单骰${d}`, 1)"
              class="p-2.5 rounded-lg border-2 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-center select-none"
              :class="getBetAmount('single_die', d) > 0 ? 'bg-[#3b82f6] text-white shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] -translate-y-0.5' : 'bg-white hover:bg-[#fffef0]'"
            >
              <div class="w-7 h-7 rounded-md border-2 border-[#1a1a1a] flex items-center justify-center font-mono font-black text-sm bg-[#fffef0] text-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                {{ d }}
              </div>
              <span v-if="getBetAmount('single_die', d) > 0" class="mt-1 text-[10px] font-mono font-black text-[#1a1a1a] flex items-center gap-0.5">
                <CoinIcon customClass="w-2.5 h-2.5" />
                <span>{{ getBetAmount('single_die', d) }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Controls: Chips + Scheduled Status -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-4 border-[#1a1a1a]">
        <ChipSelector v-model="selectedChip" :disabled="lotteryStore.isSicboDrawing" />

        <div class="flex items-center space-x-3 w-full sm:w-auto">
          <button
            v-prevent-reclick
            @click="clearAllBets"
            :disabled="totalBetAmount === 0 || lotteryStore.isSicboDrawing"
            class="comic-btn-white px-4 py-2.5 text-xs flex-1 sm:flex-none disabled:opacity-40"
          >
            清空下注
          </button>
          <div
            class="px-5 py-2.5 rounded-lg border-3 border-[#1a1a1a] text-xs font-black font-mono flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] flex-1 sm:flex-none"
            :class="lotteryStore.isSicboDrawing ? 'bg-[#ef4444] text-white' : totalBetAmount > 0 ? 'bg-[#facc15] text-[#1a1a1a]' : 'bg-[#fffef0] text-[#1a1a1a]'"
          >
            <template v-if="lotteryStore.isSicboDrawing">
              <Dices class="w-4 h-4 animate-spin" />
              <span>本期摇骰开奖中...</span>
            </template>
            <template v-else-if="totalBetAmount > 0">
              <CheckCircle class="w-4 h-4 text-[#22c55e]" />
              <span>已成功下注 {{ formattedTotalBet }} 币 · 待开奖</span>
            </template>
            <template v-else>
              <span>点击台面区域下注 ({{ lotteryStore.sicboRemainingSeconds }}s)</span>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Full-Server Public Chat Channel -->
      <div class="lg:col-span-4 h-[680px] sticky top-20">
        <ChatPanel
          channel="global_lottery"
          title="全服公共聊天室"
          subtitle="全服定时开奖频道"
          channelType="lottery"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import confetti from 'canvas-confetti'
import { Dices, ArrowLeft, Crown, Clock, CheckCircle } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { useLotteryStore } from '@/stores/lottery'
import { useChatStore } from '@/stores/chat'
import { sound } from '@/lib/sound'
import DiceBox from '@/components/game/DiceBox.vue'
import ChipSelector from '@/components/game/ChipSelector.vue'
import ChatPanel from '@/components/chat/ChatPanel.vue'
import CoinIcon from '@/components/common/CoinIcon.vue'
import { calculateSicBoSettlement, POINT_ODDS } from '../engine'
import type { SicBoBetItem, SicBoBetType, SicBoRollResult } from '../types'

const authStore = useAuthStore()
const walletStore = useWalletStore()
const lotteryStore = useLotteryStore()
const chatStore = useChatStore()

const pointOdds = POINT_ODDS
const selectedChip = ref<number>(100)
const bets = ref<SicBoBetItem[]>([])
const isRolling = ref<boolean>(false)
const lastProfit = ref<number | null>(null)

// 正在进行的骰子动效定时器
let rollAnimInterval: ReturnType<typeof setInterval> | null = null
let periodAtBetting = lotteryStore.sicboPeriod

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
  // 封盘开奖期间禁止下注
  if (lotteryStore.isSicboDrawing || isRolling.value) return

  if (authStore.userChips < totalBetAmount.value + selectedChip.value) {
    alert('筹码不足，请先前往签到获取筹码！')
    return
  }

  sound.playChip()
  periodAtBetting = lotteryStore.sicboPeriod

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
  if (lotteryStore.isSicboDrawing || isRolling.value) return
  bets.value = []
}

// 监听全服开奖阶段变动
watch(
  () => lotteryStore.isSicboDrawing,
  (isDrawing) => {
    if (isDrawing) {
      // 封盘摇盅阶段启动
      isRolling.value = true
      sound.playDiceRoll()
      if (rollAnimInterval) clearInterval(rollAnimInterval)
      rollAnimInterval = setInterval(() => {
        currentResult.value.dice = [
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1
        ]
      }, 90)
    } else {
      // 倒计时进入新一期，开奖结果揭晓与结算
      if (rollAnimInterval) {
        clearInterval(rollAnimInterval)
        rollAnimInterval = null
      }
      isRolling.value = false
      handleScheduledDrawConclusion()
    }
  }
)

// 当期开奖结束，执行结算与记录
async function handleScheduledDrawConclusion() {
  const settledPeriod = periodAtBetting || lotteryStore.sicboPeriod
  const result = lotteryStore.getSicboResultForPeriod(settledPeriod)
  currentResult.value = result
  historyList.value.unshift(result)
  if (historyList.value.length > 15) historyList.value.pop()

  // 广播全服公共频道开奖结果
  chatStore.sendSystemAnnouncement(
    'global_lottery',
    `【猜大小】第 ${settledPeriod} 期开奖：[${result.dice.join(', ')}]，合计 ${result.sum} 点 (${result.isTriple ? '全围豹子' : result.isBig ? '大' : '小'} · ${result.isOdd ? '单' : '双'})！`
  )

  if (bets.value.length > 0) {
    const { totalBet, totalPayout, netProfit } = calculateSicBoSettlement(bets.value, result)
    lastProfit.value = netProfit

    if (netProfit > 0) {
      sound.playWin()
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } })
    } else if (netProfit < 0) {
      sound.playLose()
    }

    // 记录战绩流水
    await walletStore.recordGameSettlement(
      'sicbo',
      totalBet,
      totalPayout,
      {
        dice: result.dice,
        sum: result.sum,
        isTriple: result.isTriple,
        period: settledPeriod
      }
    )

    // 清空注单，准备下一期
    bets.value = []
  }
}

onUnmounted(() => {
  if (rollAnimInterval) clearInterval(rollAnimInterval)
})
</script>
