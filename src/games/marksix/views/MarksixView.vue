<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-4 border-[#1a1a1a]">
      <div class="flex items-center space-x-3">
        <router-link to="/" class="comic-btn-white px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
          <ArrowLeft class="w-4 h-4" />
          <span>返回大厅</span>
        </router-link>
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-[#1a1a1a] flex items-center gap-2 tracking-tight">
            <Disc class="w-6 h-6 text-[#1a1a1a]" />
            <span>猜点数六合彩 (Mark Six)</span>
            <span class="comic-badge bg-[#22c55e] text-[#1a1a1a]">
              全服定时开奖
            </span>
          </h1>
          <p class="text-xs font-mono text-[#1a1a1a]/70">特码直选高达 47 倍 · 波色 · 生肖 · 两面盘</p>
        </div>
      </div>

      <!-- Synchronized Period & Countdown Timer -->
      <div class="flex items-center gap-3">
        <div class="text-right">
          <div class="text-[10px] text-[#1a1a1a] font-black uppercase">当前开奖期号</div>
          <div class="text-sm font-black font-mono text-[#1a1a1a] bg-[#facc15] px-2.5 py-0.5 rounded-md border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            {{ lotteryStore.marksixPeriod }}
          </div>
        </div>
        <div class="flex flex-col items-center">
          <div
            class="px-4 py-1.5 rounded-md border-2 border-[#1a1a1a] font-mono font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
            :class="lotteryStore.isMarksixDrawing ? 'bg-[#ef4444] text-white animate-pulse' : 'bg-[#22c55e] text-[#1a1a1a]'"
          >
            <Clock class="w-4 h-4" />
            <span>{{ lotteryStore.isMarksixDrawing ? '封盘·摇号开奖中' : `开奖倒计时 ${lotteryStore.marksixRemainingSeconds}s` }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Layout Grid (Left: Game Table, Right: Public Chat Room) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Main Live Draw Shaker & Table -->
      <div class="lg:col-span-8 rounded-xl bg-[#fffef0] border-4 border-[#1a1a1a] p-6 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] space-y-6 text-[#1a1a1a]">
      <!-- Top Draw Stage & History -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b-4 border-[#1a1a1a]">
        <!-- History Roadmap -->
        <div class="w-full md:w-auto flex flex-col items-center md:items-start space-y-2">
          <span class="text-xs font-black font-mono text-[#1a1a1a] uppercase tracking-wider bg-[#facc15] px-2 py-0.5 rounded-md border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">历史开出特码</span>
          <div class="flex items-center space-x-2 overflow-x-auto max-w-full py-1">
            <div
              v-for="(hist, idx) in historyList"
              :key="idx"
              class="flex flex-col items-center"
            >
              <div
                class="w-8 h-8 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center font-mono font-black text-xs shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
                :class="hist.waveColor === 'red' ? 'bg-[#ef4444] text-white' : hist.waveColor === 'blue' ? 'bg-[#3b82f6] text-white' : 'bg-[#22c55e] text-[#1a1a1a]'"
              >
                {{ hist.number < 10 ? '0' + hist.number : hist.number }}
              </div>
              <span class="text-[10px] font-mono font-black text-[#1a1a1a] mt-1">{{ hist.zodiac }}</span>
            </div>
          </div>
        </div>

        <!-- Shaker Center Stage -->
        <div class="flex flex-col items-center">
          <div class="p-4 rounded-xl bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex flex-col items-center">
            <BallShaker
              :number="currentResult.number"
              :rolling="isDrawing"
              :zodiac="currentResult.zodiac"
            />
            <div class="mt-2 text-xs font-mono text-[#1a1a1a] font-bold flex items-center space-x-2">
              <span>期号: {{ currentResult.period }}</span>
              <span>|</span>
              <span class="font-black px-2 py-0.5 rounded-md bg-[#facc15] border-2 border-[#1a1a1a]">{{ currentResult.isBig ? '大' : '小' }}</span>
              <span>|</span>
              <span class="font-black px-2 py-0.5 rounded-md bg-[#3b82f6] text-white border-2 border-[#1a1a1a]">{{ currentResult.isOdd ? '单' : '双' }}</span>
            </div>
          </div>
        </div>

        <!-- Current Total Bet & Profit -->
        <div class="w-full md:w-auto flex flex-col items-center md:items-end space-y-1.5">
          <div class="text-xs font-black font-mono text-[#1a1a1a]/70 uppercase">本局累计下注</div>
          <div class="text-2xl font-black font-mono text-[#1a1a1a] flex items-center gap-1.5 bg-[#facc15] px-3 py-1 rounded-md border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            <CoinIcon customClass="w-5 h-5" />
            <span>{{ formattedTotalBet }}</span>
          </div>
          <div v-if="lastProfit !== null" class="text-xs font-mono font-black flex items-center gap-1 border-2 border-[#1a1a1a] rounded-md px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]" :class="lastProfit >= 0 ? 'bg-[#22c55e] text-[#1a1a1a]' : 'bg-[#ef4444] text-white'">
            <span>上期盈亏: {{ lastProfit >= 0 ? '+' : '' }}{{ lastProfit }}</span>
            <CoinIcon customClass="w-3 h-3" />
          </div>
        </div>
      </div>

      <!-- Betting Panels Navigation Tabs -->
      <div class="flex flex-wrap items-center gap-2 border-b-4 border-[#1a1a1a] pb-3">
        <button
          v-for="tab in ['two_sides', 'waves', 'zodiacs', 'exact']"
          :key="tab"
          @click="activeTab = tab"
          class="px-4 py-2 rounded-lg border-2 border-[#1a1a1a] font-mono font-black text-xs uppercase transition-all"
          :class="activeTab === tab ? 'bg-[#facc15] text-[#1a1a1a] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] -translate-y-0.5' : 'bg-[#fffef0] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#fffef0]'"
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
          class="p-4 rounded-xl border-4 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-between select-none"
          :class="getBetAmount(item.type as any, item.value) > 0 ? 'bg-[#22c55e] text-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'bg-[#fffef0] text-[#1a1a1a] hover:bg-[#f0fdf4] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'"
        >
          <span class="text-base font-black">{{ item.name }}</span>
          <span class="text-xs font-mono font-black mt-1 px-2 py-0.5 border-2 border-[#1a1a1a] rounded-md bg-[#fffef0] text-[#1a1a1a]">1 赔 {{ item.odds }}</span>
          <div v-if="getBetAmount(item.type as any, item.value) > 0" class="mt-2 px-2.5 py-0.5 rounded-md bg-[#1a1a1a] text-[#facc15] border border-[#1a1a1a] text-xs font-mono font-bold flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            <CoinIcon customClass="w-3 h-3" />
            <span>{{ getBetAmount(item.type as any, item.value) }}</span>
          </div>
        </div>
      </div>

      <!-- 2. 三色波 (红波/蓝波/绿波) -->
      <div v-if="activeTab === 'waves'" class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          @click="placeBet('wave_color', 'red', '红波', 2.8)"
          class="p-5 rounded-xl border-4 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-between select-none"
          :class="getBetAmount('wave_color', 'red') > 0 ? 'bg-[#ef4444] text-white shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'bg-[#fffef0] text-[#1a1a1a] hover:bg-[#fee2e2] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'"
        >
          <div class="flex items-center gap-2">
            <span class="w-4 h-4 rounded-full bg-[#ef4444] border-2 border-[#1a1a1a]"></span>
            <span class="text-lg font-black" :class="getBetAmount('wave_color', 'red') > 0 ? 'text-white' : 'text-[#ef4444]'">红 波 (Red)</span>
          </div>
          <span class="text-xs font-mono font-bold mt-1" :class="getBetAmount('wave_color', 'red') > 0 ? 'text-white' : 'text-[#1a1a1a]/70'">涵盖 17 个红球 · 1 赔 2.8</span>
          <div v-if="getBetAmount('wave_color', 'red') > 0" class="mt-2 px-3 py-0.5 rounded-md bg-[#1a1a1a] text-white border border-[#1a1a1a] text-xs font-mono font-bold flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            <CoinIcon customClass="w-3 h-3" />
            <span>{{ getBetAmount('wave_color', 'red') }}</span>
          </div>
        </div>

        <div
          @click="placeBet('wave_color', 'blue', '蓝波', 2.9)"
          class="p-5 rounded-xl border-4 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-between select-none"
          :class="getBetAmount('wave_color', 'blue') > 0 ? 'bg-[#3b82f6] text-white shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'bg-[#fffef0] text-[#1a1a1a] hover:bg-[#e0f2fe] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'"
        >
          <div class="flex items-center gap-2">
            <span class="w-4 h-4 rounded-full bg-[#3b82f6] border-2 border-[#1a1a1a]"></span>
            <span class="text-lg font-black" :class="getBetAmount('wave_color', 'blue') > 0 ? 'text-white' : 'text-[#3b82f6]'">蓝 波 (Blue)</span>
          </div>
          <span class="text-xs font-mono font-bold mt-1" :class="getBetAmount('wave_color', 'blue') > 0 ? 'text-white' : 'text-[#1a1a1a]/70'">涵盖 16 个蓝球 · 1 赔 2.9</span>
          <div v-if="getBetAmount('wave_color', 'blue') > 0" class="mt-2 px-3 py-0.5 rounded-md bg-[#1a1a1a] text-white border border-[#1a1a1a] text-xs font-mono font-bold flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            <CoinIcon customClass="w-3 h-3" />
            <span>{{ getBetAmount('wave_color', 'blue') }}</span>
          </div>
        </div>

        <div
          @click="placeBet('wave_color', 'green', '绿波', 2.9)"
          class="p-5 rounded-xl border-4 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-between select-none"
          :class="getBetAmount('wave_color', 'green') > 0 ? 'bg-[#22c55e] text-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'bg-[#fffef0] text-[#1a1a1a] hover:bg-[#dcfce7] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'"
        >
          <div class="flex items-center gap-2">
            <span class="w-4 h-4 rounded-full bg-[#22c55e] border-2 border-[#1a1a1a]"></span>
            <span class="text-lg font-black text-[#1a1a1a]">绿 波 (Green)</span>
          </div>
          <span class="text-xs font-mono font-bold mt-1 text-[#1a1a1a]/70">涵盖 16 个绿球 · 1 赔 2.9</span>
          <div v-if="getBetAmount('wave_color', 'green') > 0" class="mt-2 px-3 py-0.5 rounded-md bg-[#1a1a1a] text-[#22c55e] border border-[#1a1a1a] text-xs font-mono font-bold flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
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
          class="p-3 rounded-xl border-3 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-center select-none"
          :class="getBetAmount('zodiac', zod) > 0 ? 'bg-[#facc15] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] -translate-y-0.5' : 'bg-[#fffef0] hover:bg-[#fef9c3] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'"
        >
          <span class="text-lg font-black text-[#1a1a1a]">{{ zod }}</span>
          <span class="text-[10px] font-mono font-bold text-[#1a1a1a]/70">1:11.5</span>
          <span v-if="getBetAmount('zodiac', zod) > 0" class="mt-1 text-[10px] font-mono font-black bg-[#1a1a1a] text-[#facc15] px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
            <CoinIcon customClass="w-2.5 h-2.5" />
            <span>{{ getBetAmount('zodiac', zod) }}</span>
          </span>
        </div>
      </div>

      <!-- 4. 特码直选 1-49 (1 赔 47) -->
      <div v-if="activeTab === 'exact'" class="rounded-xl bg-[#fffef0] border-4 border-[#1a1a1a] p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
        <div class="text-xs font-black font-mono text-[#1a1a1a] mb-3 flex items-center justify-between">
          <span class="uppercase tracking-wider">特码 1-49 直选号盘 (1 赔 47)</span>
          <span class="bg-[#facc15] px-2 py-0.5 border-2 border-[#1a1a1a] rounded-md text-[11px] font-bold text-[#1a1a1a]">点击球号下注</span>
        </div>
        <div class="grid grid-cols-7 sm:grid-cols-10 gap-2 max-h-72 overflow-y-auto pr-1">
          <div
            v-for="n in 49"
            :key="n"
            @click="placeBet('exact_number', n, `特码${n}`, 47)"
            class="p-2 rounded-lg border-2 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-center select-none relative"
            :class="getBetAmount('exact_number', n) > 0 ? 'bg-[#facc15] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]' : 'bg-white hover:bg-[#fffef0]'"
          >
            <div
              class="w-7 h-7 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center font-mono font-black text-xs shadow-[1px_1px_0px_0px_#1a1a1a]"
              :class="getBallWave(n) === 'red' ? 'bg-[#ef4444] text-white' : getBallWave(n) === 'blue' ? 'bg-[#3b82f6] text-white' : 'bg-[#22c55e] text-[#1a1a1a]'"
            >
              {{ n < 10 ? '0' + n : n }}
            </div>
            <span v-if="getBetAmount('exact_number', n) > 0" class="mt-1 text-[9px] font-mono font-black bg-[#1a1a1a] text-[#facc15] px-1 rounded-sm flex items-center gap-0.5">
              <CoinIcon customClass="w-2.5 h-2.5" />
              <span>{{ getBetAmount('exact_number', n) }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Bottom Controls: Chips + Scheduled Status -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-4 border-[#1a1a1a]">
        <ChipSelector v-model="selectedChip" :disabled="lotteryStore.isMarksixDrawing" />

        <div class="flex items-center space-x-3 w-full sm:w-auto">
          <button
            @click="clearAllBets"
            :disabled="totalBetAmount === 0 || lotteryStore.isMarksixDrawing"
            class="comic-btn-white flex-1 sm:flex-none px-4 py-2.5 text-xs disabled:opacity-40"
          >
            清空下注
          </button>
          <div
            class="px-5 py-2.5 rounded-lg border-3 border-[#1a1a1a] text-xs font-black font-mono flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] flex-1 sm:flex-none"
            :class="lotteryStore.isMarksixDrawing ? 'bg-[#ef4444] text-white' : totalBetAmount > 0 ? 'bg-[#facc15] text-[#1a1a1a]' : 'bg-[#fffef0] text-[#1a1a1a]'"
          >
            <template v-if="lotteryStore.isMarksixDrawing">
              <Disc class="w-4 h-4 animate-spin" />
              <span>本期特码摇号中...</span>
            </template>
            <template v-else-if="totalBetAmount > 0">
              <CheckCircle class="w-4 h-4 text-[#22c55e]" />
              <span>已下注 {{ formattedTotalBet }} 币 · 待开奖</span>
            </template>
            <template v-else>
              <span>请在倒计时结束前下注 ({{ lotteryStore.marksixRemainingSeconds }}s)</span>
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
import { Disc, ArrowLeft, Clock, CheckCircle } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { useLotteryStore } from '@/stores/lottery'
import { useChatStore } from '@/stores/chat'
import { sound } from '@/lib/sound'
import BallShaker from '@/components/game/BallShaker.vue'
import ChipSelector from '@/components/game/ChipSelector.vue'
import ChatPanel from '@/components/chat/ChatPanel.vue'
import CoinIcon from '@/components/common/CoinIcon.vue'
import {
  settleMarkSixBets,
  getBallWave,
  ZODIACS
} from '../engine'
import type { MarkSixBetItem, MarkSixBetType, MarkSixDrawResult } from '../types'

const authStore = useAuthStore()
const walletStore = useWalletStore()
const lotteryStore = useLotteryStore()
const chatStore = useChatStore()

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

// 正在滚球的动效定时器与下注时所处期号
let drawAnimInterval: ReturnType<typeof setInterval> | null = null
let periodAtBetting = lotteryStore.marksixPeriod

const currentResult = ref<MarkSixDrawResult>({
  period: lotteryStore.marksixPeriod,
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
  // 封盘摇号阶段禁止下注
  if (lotteryStore.isMarksixDrawing || isDrawing.value) return

  if (authStore.userChips < totalBetAmount.value + selectedChip.value) {
    alert('筹码不足，请先前往签到获取筹码！')
    return
  }

  sound.playChip()
  periodAtBetting = lotteryStore.marksixPeriod

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
  if (lotteryStore.isMarksixDrawing || isDrawing.value) return
  bets.value = []
}

// 监听全服定时开奖阶段变动
watch(
  () => lotteryStore.isMarksixDrawing,
  (isDrawPhase) => {
    if (isDrawPhase) {
      // 封盘滚球阶段启动
      isDrawing.value = true
      sound.playDiceRoll()
      if (drawAnimInterval) clearInterval(drawAnimInterval)
      drawAnimInterval = setInterval(() => {
        currentResult.value.number = Math.floor(Math.random() * 49) + 1
      }, 90)
    } else {
      // 倒计时进入新一期，开奖结果揭晓并结算
      if (drawAnimInterval) {
        clearInterval(drawAnimInterval)
        drawAnimInterval = null
      }
      isDrawing.value = false
      handleScheduledMarkSixConclusion()
    }
  }
)

// 当期开奖结束，执行结算与记录
async function handleScheduledMarkSixConclusion() {
  const settledPeriod = periodAtBetting || lotteryStore.marksixPeriod
  const result = lotteryStore.getMarksixResultForPeriod(settledPeriod)
  currentResult.value = result
  historyList.value.unshift(result)
  if (historyList.value.length > 15) historyList.value.pop()

  // 广播全服公共频道开奖结果
  const waveName = result.waveColor === 'red' ? '红波' : result.waveColor === 'blue' ? '蓝波' : '绿波'
  chatStore.sendSystemAnnouncement(
    'global_lottery',
    `【六合彩】第 ${settledPeriod} 期特码：[${result.number < 10 ? '0' + result.number : result.number}] (${waveName} · 生肖${result.zodiac} · ${result.isBig ? '大' : '小'} · ${result.isOdd ? '单' : '双'})！`
  )

  if (bets.value.length > 0) {
    const { totalBet, totalPayout, netProfit } = settleMarkSixBets(bets.value, result)
    lastProfit.value = netProfit

    if (netProfit > 0) {
      sound.playWin()
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
    } else if (netProfit < 0) {
      sound.playLose()
    }

    // 记录流水
    await walletStore.recordGameSettlement(
      'marksix',
      totalBet,
      totalPayout,
      {
        number: result.number,
        zodiac: result.zodiac,
        waveColor: result.waveColor,
        period: settledPeriod
      }
    )

    // 清空注单，准备下一期
    bets.value = []
  }
}

onUnmounted(() => {
  if (drawAnimInterval) clearInterval(drawAnimInterval)
})
</script>
