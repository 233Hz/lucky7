<template>
  <div class="max-w-5xl mx-auto px-4 py-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-4 border-black">
      <div class="flex items-center space-x-3">
        <router-link to="/" class="brutal-btn brutal-btn-white px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
          <ArrowLeft class="w-4 h-4" />
          <span>返回大厅</span>
        </router-link>
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-black flex items-center gap-2 tracking-tight">
            <Disc class="w-6 h-6 text-black" />
            <span>猜点数六合彩 (Mark Six)</span>
            <span class="brutal-badge bg-[#ccff00] text-black">
              1-49特码 · 红蓝绿波
            </span>
          </h1>
          <p class="text-xs font-mono text-black/70">特码直选高达 47 倍 · 波色 · 生肖 · 两面盘</p>
        </div>
      </div>
    </div>

    <!-- Main Live Draw Shaker & Table -->
    <div class="rounded-none bg-white border-4 border-black p-6 shadow-brutal-xl space-y-6">
      <!-- Top Draw Stage & History -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b-3 border-black">
        <!-- History Roadmap -->
        <div class="w-full md:w-auto flex flex-col items-center md:items-start space-y-2">
          <span class="text-xs font-black font-mono text-black uppercase tracking-wider bg-[#ffff00] px-2 py-0.5 border-2 border-black shadow-brutal-sm">历史开出特码</span>
          <div class="flex items-center space-x-2 overflow-x-auto max-w-full py-1">
            <div
              v-for="(hist, idx) in historyList"
              :key="idx"
              class="flex flex-col items-center"
            >
              <div
                class="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-mono font-black text-xs shadow-[2px_2px_0px_0px_#000]"
                :class="hist.waveColor === 'red' ? 'bg-[#ff006e] text-white' : hist.waveColor === 'blue' ? 'bg-[#00d9ff] text-black' : 'bg-[#ccff00] text-black'"
              >
                {{ hist.number < 10 ? '0' + hist.number : hist.number }}
              </div>
              <span class="text-[10px] font-mono font-black text-black mt-1">{{ hist.zodiac }}</span>
            </div>
          </div>
        </div>

        <!-- Shaker Center Stage -->
        <div class="flex flex-col items-center">
          <div class="p-4 rounded-none bg-[#f4f4f0] border-3 border-black shadow-brutal flex flex-col items-center">
            <BallShaker
              :number="currentResult.number"
              :rolling="isDrawing"
              :zodiac="currentResult.zodiac"
            />
            <div class="mt-2 text-xs font-mono text-black font-bold flex items-center space-x-2">
              <span>期号: {{ currentResult.period }}</span>
              <span>|</span>
              <span class="font-black px-1.5 py-0.2 bg-[#ffff00] border border-black">{{ currentResult.isBig ? '大' : '小' }}</span>
              <span>|</span>
              <span class="font-black px-1.5 py-0.2 bg-[#00d9ff] border border-black">{{ currentResult.isOdd ? '单' : '双' }}</span>
            </div>
          </div>
        </div>

        <!-- Current Total Bet & Profit -->
        <div class="w-full md:w-auto flex flex-col items-center md:items-end space-y-1.5">
          <div class="text-xs font-black font-mono text-black/70 uppercase">本局累计下注</div>
          <div class="text-2xl font-black font-mono text-black flex items-center gap-1.5 bg-[#ffff00] px-3 py-1 border-2 border-black shadow-brutal-sm">
            <CoinIcon customClass="w-5 h-5" />
            <span>{{ formattedTotalBet }}</span>
          </div>
          <div v-if="lastProfit !== null" class="text-xs font-mono font-black flex items-center gap-1 border-2 border-black px-2 py-0.5 shadow-brutal-sm" :class="lastProfit >= 0 ? 'bg-[#ccff00] text-black' : 'bg-[#ff006e] text-white'">
            <span>上期盈亏: {{ lastProfit >= 0 ? '+' : '' }}{{ lastProfit }}</span>
            <CoinIcon customClass="w-3 h-3" />
          </div>
        </div>
      </div>

      <!-- Betting Panels Navigation Tabs -->
      <div class="flex flex-wrap items-center gap-2 border-b-3 border-black pb-3">
        <button
          v-for="tab in ['two_sides', 'waves', 'zodiacs', 'exact']"
          :key="tab"
          @click="activeTab = tab"
          class="px-4 py-2 rounded-none border-2 border-black font-mono font-black text-xs uppercase transition-all"
          :class="activeTab === tab ? 'bg-[#ccff00] text-black shadow-brutal-sm' : 'bg-white text-black hover:bg-black hover:text-white'"
        >
          {{ tabNames[tab] }}
        </button>
      </div>

      <!-- 1. 两面盘 (大/小, 单/双) -->
      <div v-if="activeTab === 'two_sides'" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          v-for="item in [
            { type: 'big_small', value: 'big', name: '特码 大 (25-48)', odds: 1.95, sub: '49和局' },
            { type: 'big_small', value: 'small', name: '特码 小 (01-24)', odds: 1.95, sub: '49和局' },
            { type: 'odd_even', value: 'odd', name: '特码 单', odds: 1.95, sub: '49和局' },
            { type: 'odd_even', value: 'even', name: '特码 双', odds: 1.95, sub: '49和局' }
          ]"
          :key="item.name"
          @click="placeBet(item.type as any, item.value, item.name, item.odds)"
          class="p-4 rounded-none border-3 border-black transition-all cursor-pointer flex flex-col items-center justify-between select-none"
          :class="getBetAmount(item.type as any, item.value) > 0 ? 'bg-[#ccff00] text-black shadow-brutal translate-x-[-2px] translate-y-[-2px]' : 'bg-white text-black hover:bg-neutral-50 shadow-brutal-sm'"
        >
          <span class="text-base font-black">{{ item.name }}</span>
          <span class="text-xs font-mono font-black mt-1 px-1.5 py-0.5 border border-black bg-white text-black">1 赔 {{ item.odds }}</span>
          <div v-if="getBetAmount(item.type as any, item.value) > 0" class="mt-2 px-2.5 py-0.5 rounded-none bg-black text-[#ccff00] border border-black text-xs font-mono font-bold flex items-center gap-1">
            <CoinIcon customClass="w-3 h-3" />
            <span>{{ getBetAmount(item.type as any, item.value) }}</span>
          </div>
        </div>
      </div>

      <!-- 2. 三色波 (红波/蓝波/绿波) -->
      <div v-if="activeTab === 'waves'" class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          @click="placeBet('wave_color', 'red', '红波', 2.8)"
          class="p-5 rounded-none border-3 border-black transition-all cursor-pointer flex flex-col items-center justify-between select-none"
          :class="getBetAmount('wave_color', 'red') > 0 ? 'bg-[#ff006e] text-white shadow-brutal translate-x-[-2px] translate-y-[-2px]' : 'bg-white text-black hover:bg-[#ff006e]/10 shadow-brutal-sm'"
        >
          <div class="flex items-center gap-2">
            <span class="w-4 h-4 rounded-full bg-[#ff006e] border-2 border-black"></span>
            <span class="text-lg font-black" :class="getBetAmount('wave_color', 'red') > 0 ? 'text-white' : 'text-[#ff006e]'">红 波 (Red)</span>
          </div>
          <span class="text-xs font-mono font-bold mt-1" :class="getBetAmount('wave_color', 'red') > 0 ? 'text-white' : 'text-black/70'">涵盖 17 个红球 · 1 赔 2.8</span>
          <div v-if="getBetAmount('wave_color', 'red') > 0" class="mt-2 px-3 py-0.5 rounded-none bg-black text-white border border-black text-xs font-mono font-bold flex items-center gap-1">
            <CoinIcon customClass="w-3 h-3" />
            <span>{{ getBetAmount('wave_color', 'red') }}</span>
          </div>
        </div>

        <div
          @click="placeBet('wave_color', 'blue', '蓝波', 2.9)"
          class="p-5 rounded-none border-3 border-black transition-all cursor-pointer flex flex-col items-center justify-between select-none"
          :class="getBetAmount('wave_color', 'blue') > 0 ? 'bg-[#00d9ff] text-black shadow-brutal translate-x-[-2px] translate-y-[-2px]' : 'bg-white text-black hover:bg-[#00d9ff]/10 shadow-brutal-sm'"
        >
          <div class="flex items-center gap-2">
            <span class="w-4 h-4 rounded-full bg-[#00d9ff] border-2 border-black"></span>
            <span class="text-lg font-black text-black">蓝 波 (Blue)</span>
          </div>
          <span class="text-xs font-mono font-bold mt-1 text-black/70">涵盖 16 个蓝球 · 1 赔 2.9</span>
          <div v-if="getBetAmount('wave_color', 'blue') > 0" class="mt-2 px-3 py-0.5 rounded-none bg-black text-[#00d9ff] border border-black text-xs font-mono font-bold flex items-center gap-1">
            <CoinIcon customClass="w-3 h-3" />
            <span>{{ getBetAmount('wave_color', 'blue') }}</span>
          </div>
        </div>

        <div
          @click="placeBet('wave_color', 'green', '绿波', 2.9)"
          class="p-5 rounded-none border-3 border-black transition-all cursor-pointer flex flex-col items-center justify-between select-none"
          :class="getBetAmount('wave_color', 'green') > 0 ? 'bg-[#ccff00] text-black shadow-brutal translate-x-[-2px] translate-y-[-2px]' : 'bg-white text-black hover:bg-[#ccff00]/10 shadow-brutal-sm'"
        >
          <div class="flex items-center gap-2">
            <span class="w-4 h-4 rounded-full bg-[#ccff00] border-2 border-black"></span>
            <span class="text-lg font-black text-black">绿 波 (Green)</span>
          </div>
          <span class="text-xs font-mono font-bold mt-1 text-black/70">涵盖 16 个绿球 · 1 赔 2.9</span>
          <div v-if="getBetAmount('wave_color', 'green') > 0" class="mt-2 px-3 py-0.5 rounded-none bg-black text-[#ccff00] border border-black text-xs font-mono font-bold flex items-center gap-1">
            <CoinIcon customClass="w-3 h-3" />
            <span>{{ getBetAmount('wave_color', 'green') }}</span>
          </div>
        </div>
      </div>

      <!-- 3. 十二生肖 (1 赔 11.5) -->
      <div v-if="activeTab === 'zodiacs'" class="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
        <div
          v-for="zod in zodiacList"
          :key="zod"
          @click="placeBet('zodiac', zod, `生肖-${zod}`, 11.5)"
          class="p-3 rounded-none border-2 border-black transition-all cursor-pointer flex flex-col items-center justify-center select-none"
          :class="getBetAmount('zodiac', zod) > 0 ? 'bg-[#ffff00] shadow-brutal translate-x-[-2px] translate-y-[-2px]' : 'bg-white hover:bg-neutral-50 shadow-brutal-sm'"
        >
          <span class="text-lg font-black text-black">{{ zod }}</span>
          <span class="text-[10px] font-mono font-bold text-black/70">1:11.5</span>
          <span v-if="getBetAmount('zodiac', zod) > 0" class="mt-1 text-[10px] font-mono font-black bg-black text-[#ffff00] px-1.5 py-0.5 flex items-center gap-0.5">
            <CoinIcon customClass="w-2.5 h-2.5" />
            <span>{{ getBetAmount('zodiac', zod) }}</span>
          </span>
        </div>
      </div>

      <!-- 4. 特码直选 1-49 (1 赔 47) -->
      <div v-if="activeTab === 'exact'" class="rounded-none bg-[#f4f4f0] border-3 border-black p-4 shadow-brutal-sm">
        <div class="text-xs font-black font-mono text-black mb-3 flex items-center justify-between">
          <span class="uppercase tracking-wider">特码 1-49 直选号盘 (1 赔 47)</span>
          <span class="bg-[#ffff00] px-2 py-0.5 border border-black text-[11px] font-bold">点击球号下注</span>
        </div>
        <div class="grid grid-cols-7 sm:grid-cols-10 gap-2 max-h-72 overflow-y-auto pr-1">
          <div
            v-for="n in 49"
            :key="n"
            @click="placeBet('exact_number', n, `特码${n}`, 47)"
            class="p-2 rounded-none border-2 border-black transition-all cursor-pointer flex flex-col items-center justify-center select-none relative"
            :class="getBetAmount('exact_number', n) > 0 ? 'bg-[#ffff00] shadow-brutal-sm' : 'bg-white hover:bg-neutral-100'"
          >
            <div
              class="w-7 h-7 rounded-full border-2 border-black flex items-center justify-center font-mono font-black text-xs shadow-[1px_1px_0px_0px_#000]"
              :class="getBallWave(n) === 'red' ? 'bg-[#ff006e] text-white' : getBallWave(n) === 'blue' ? 'bg-[#00d9ff] text-black' : 'bg-[#ccff00] text-black'"
            >
              {{ n < 10 ? '0' + n : n }}
            </div>
            <span v-if="getBetAmount('exact_number', n) > 0" class="mt-1 text-[9px] font-mono font-black bg-black text-[#ffff00] px-1 flex items-center gap-0.5">
              <CoinIcon customClass="w-2.5 h-2.5" />
              <span>{{ getBetAmount('exact_number', n) }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Bottom Controls: Chips + Draw Button -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-3 border-black">
        <ChipSelector v-model="selectedChip" :disabled="isDrawing" />

        <div class="flex items-center space-x-3 w-full sm:w-auto">
          <button
            @click="clearAllBets"
            :disabled="totalBetAmount === 0 || isDrawing"
            class="brutal-btn brutal-btn-white flex-1 sm:flex-none px-4 py-2.5 text-xs disabled:opacity-40"
          >
            清空下注
          </button>
          <button
            @click="handleInstantDraw"
            :disabled="totalBetAmount === 0 || isDrawing || authStore.userChips < totalBetAmount"
            class="brutal-btn brutal-btn-lime flex-1 sm:flex-none px-8 py-2.5 text-sm font-black disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Play class="w-4 h-4 fill-black" />
            <span>{{ isDrawing ? '开奖中...' : '即开摇奖' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import confetti from 'canvas-confetti'
import { Disc, ArrowLeft, Play } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { sound } from '@/lib/sound'
import BallShaker from '@/components/game/BallShaker.vue'
import ChipSelector from '@/components/game/ChipSelector.vue'
import CoinIcon from '@/components/common/CoinIcon.vue'
import {
  drawMarkSixResult,
  settleMarkSixBets,
  getBallWave,
  ZODIACS
} from '../engine'
import type { MarkSixBetItem, MarkSixBetType, MarkSixDrawResult } from '../types'

const authStore = useAuthStore()
const walletStore = useWalletStore()

const activeTab = ref<string>('two_sides')
const tabNames: Record<string, string> = {
  two_sides: '两面盘 (大小单双)',
  waves: '三色波 (红蓝绿)',
  zodiacs: '十二生肖',
  exact: '特码直选 1-49'
}

const zodiacList = ZODIACS
const selectedChip = ref<number>(100)
const bets = ref<MarkSixBetItem[]>([])
const isDrawing = ref<boolean>(false)
const lastProfit = ref<number | null>(null)

const currentResult = ref<MarkSixDrawResult>({
  period: '20260907-088',
  number: 7,
  waveColor: 'red',
  isBig: false,
  isSmall: true,
  isOdd: true,
  isEven: false,
  zodiac: '马',
  drawnAt: '12:00:00'
})

const historyList = ref<MarkSixDrawResult[]>([
  { period: '20260907-087', number: 18, waveColor: 'red', isBig: false, isSmall: true, isOdd: false, isEven: true, zodiac: '狗', drawnAt: '11:58' },
  { period: '20260907-086', number: 33, waveColor: 'green', isBig: true, isSmall: false, isOdd: true, isEven: false, zodiac: '龙', drawnAt: '11:56' },
  { period: '20260907-085', number: 42, waveColor: 'blue', isBig: true, isSmall: false, isOdd: false, isEven: true, zodiac: '羊', drawnAt: '11:54' },
  { period: '20260907-084', number: 9, waveColor: 'blue', isBig: false, isSmall: true, isOdd: true, isEven: false, zodiac: '鸡', drawnAt: '11:52' }
])

const totalBetAmount = computed(() => {
  return bets.value.reduce((acc, b) => acc + b.amount, 0)
})

const formattedTotalBet = computed(() => {
  return new Intl.NumberFormat('en-US').format(totalBetAmount.value)
})

function getBetAmount(type: MarkSixBetType, value: string | number): number {
  const item = bets.value.find(b => b.type === type && b.value === value)
  return item ? item.amount : 0
}

function placeBet(type: MarkSixBetType, value: string | number, name: string, odds: number) {
  if (isDrawing.value) return
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
  if (isDrawing.value) return
  bets.value = []
}

// 快速即开抽奖
async function handleInstantDraw() {
  if (totalBetAmount.value === 0 || isDrawing.value) return
  if (authStore.userChips < totalBetAmount.value) {
    alert('筹码不足！')
    return
  }

  isDrawing.value = true
  lastProfit.value = null
  sound.playDiceRoll()

  // 滚球动画
  const interval = setInterval(() => {
    currentResult.value.number = Math.floor(Math.random() * 49) + 1
  }, 90)

  setTimeout(async () => {
    clearInterval(interval)
    const result = drawMarkSixResult()
    currentResult.value = result
    historyList.value.unshift(result)
    if (historyList.value.length > 15) historyList.value.pop()

    isDrawing.value = false

    // 结算
    const { totalBet, totalPayout, netProfit } = settleMarkSixBets(bets.value, result)
    lastProfit.value = netProfit

    if (netProfit > 0) {
      sound.playWin()
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
    } else if (netProfit < 0) {
      sound.playLose()
    }

    // 同步到 Supabase 战绩与流水
    await walletStore.recordGameSettlement(
      'marksix',
      totalBet,
      totalPayout,
      {
        number: result.number,
        zodiac: result.zodiac,
        waveColor: result.waveColor,
        period: result.period
      }
    )

    bets.value = []
  }, 1400)
}
</script>
