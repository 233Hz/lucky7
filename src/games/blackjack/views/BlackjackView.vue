<template>
  <div class="max-w-5xl mx-auto px-4 py-6 font-mono">
    <!-- Top Header -->
    <div class="flex items-center justify-between mb-4 border-b-4 border-[#1a1a1a] pb-3">
      <div class="flex items-center space-x-3">
        <router-link to="/" class="comic-btn-white px-3 py-1.5 text-xs">
          <ArrowLeft class="w-4 h-4 mr-1" />
          <span>返回大厅</span>
        </router-link>
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-[#1a1a1a] uppercase flex items-center gap-2">
            <CreditCard class="w-6 h-6 text-[#1a1a1a]" />
            <span>21点 (Blackjack)</span>
            <span class="text-xs px-2.5 py-0.5 rounded-md bg-[#1a1a1a] text-[#facc15] border-2 border-[#1a1a1a] font-black uppercase shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
              单人对决 · 3:2 天王赔率
            </span>
          </h1>
          <p class="text-xs text-[#1a1a1a] font-bold mt-0.5">庄家必须在 16 点及以下补牌，17 点及以上停牌</p>
        </div>
      </div>
    </div>

    <!-- Game Closed / Outside Open Time Notice -->
    <div
      v-if="!scheduleState.isOpen"
      class="mb-6 p-8 rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[6px_6px_0px_0px_#1a1a1a] text-center space-y-4 font-mono text-[#1a1a1a]"
    >
      <div class="w-16 h-16 rounded-xl bg-[#ef4444] text-white border-3 border-[#1a1a1a] flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#1a1a1a]">
        <Clock class="w-8 h-8" />
      </div>
      <h2 class="text-2xl font-black uppercase">21点 (Blackjack) 暂停开放</h2>
      <p class="text-xs sm:text-sm text-[#4a4a4a] font-bold max-w-md mx-auto">
        {{ scheduleState.reason }}<br />
        开放时间：{{ scheduleState.timeDesc }}
      </p>
      <router-link to="/" class="comic-btn-yellow px-6 py-2.5 text-xs inline-block">
        返回游戏大厅 · HOME
      </router-link>
    </div>

    <!-- Felt Table -->
    <div v-else class="relative rounded-xl bg-[#fffef0] border-4 border-[#1a1a1a] p-6 min-h-[540px] flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-hidden">
      <!-- Halftone Dots Texture -->
      <div class="absolute inset-0 bg-[radial-gradient(#1a1a1a_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-10 pointer-events-none"></div>

      <!-- Dealer Area (Top) -->
      <div class="flex flex-col items-center relative z-10">
        <div class="flex items-center space-x-2 mb-2">
          <span class="text-xs font-black text-[#1a1a1a] uppercase tracking-wider">庄家 (DEALER)</span>
          <span
            v-if="dealerScore.total > 0 && phase !== 'betting'"
            class="px-2.5 py-0.5 rounded-md text-xs font-mono font-black border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
            :class="dealerScore.isBust ? 'bg-[#ef4444] text-white' : 'bg-[#facc15] text-[#1a1a1a]'"
          >
            {{ phase === 'player_turn' ? '?' : dealerScore.total + ' 点' }}
          </span>
        </div>

        <!-- Dealer Cards (Spaced cleanly) -->
        <div class="flex items-center space-x-3 min-h-[116px]">
          <template v-if="dealerCards.length > 0">
            <PlayingCard
              v-for="(c, idx) in dealerCards"
              :key="idx"
              :card="c"
              :faceDown="idx === 1 && phase === 'player_turn'"
              size="md"
            />
          </template>
          <div v-else class="w-20 h-28 rounded-lg border-2 border-dashed border-[#1a1a1a] flex items-center justify-center text-[#1a1a1a] text-xs font-mono font-bold bg-[#fffef0]">
            等待发牌
          </div>
        </div>
      </div>

      <!-- Center Status & Round Info -->
      <div class="flex flex-col items-center justify-center my-4 relative z-10">
        <div v-if="phase === 'betting'" class="text-center space-y-2">
          <span class="text-sm font-black text-[#1a1a1a]">请选择下注筹码，点击「发牌」开始</span>
          <div class="text-xs text-[#1a1a1a] font-black flex items-center justify-center gap-1 bg-[#facc15] px-3 py-1 border-2 border-[#1a1a1a] rounded-md shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] inline-block">
            <span>当前已下注: {{ currentBet }}</span>
            <CoinIcon customClass="w-3.5 h-3.5" />
          </div>
        </div>

        <div v-else-if="roundResult" class="text-center space-y-1 py-3 px-6 rounded-xl bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <div class="text-lg font-black uppercase" :class="roundResult.netProfit > 0 ? 'text-[#22c55e]' : roundResult.netProfit < 0 ? 'text-[#ef4444]' : 'text-[#1a1a1a]'">
            {{ roundResult.description }}
          </div>
          <div class="text-xs font-mono font-black flex items-center justify-center gap-1" :class="roundResult.netProfit >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'">
            <span>{{ roundResult.netProfit >= 0 ? '+' : '' }}{{ roundResult.netProfit }}</span>
            <CoinIcon customClass="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      <!-- Player Area (Bottom) -->
      <div class="flex flex-col items-center relative z-10">
        <!-- Player Cards (Spaced cleanly) -->
        <div class="flex items-center space-x-3 mb-2 min-h-[116px]">
          <template v-if="playerCards.length > 0">
            <PlayingCard
              v-for="(c, idx) in playerCards"
              :key="idx"
              :card="c"
              size="md"
              :highlight="playerScore.isBlackjack"
            />
          </template>
          <div v-else class="w-20 h-28 rounded-lg border-2 border-dashed border-[#1a1a1a] flex items-center justify-center text-[#1a1a1a] text-xs font-mono font-bold bg-[#fffef0]">
            等待下注
          </div>
        </div>

        <!-- Player Points Pill -->
        <div class="flex items-center space-x-2 mb-4">
          <div class="px-3.5 py-1 rounded-md bg-[#fffef0] border-2 border-[#1a1a1a] text-xs font-mono font-black text-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] flex items-center space-x-2">
            <span>闲家点数:</span>
            <span :class="playerScore.isBust ? 'text-[#ef4444]' : playerScore.isBlackjack ? 'text-[#ef4444] font-black' : 'text-[#22c55e]'">
              {{ playerScore.total }} 点
              <span v-if="playerScore.isSoft && !playerScore.isBust && playerScore.total !== 21">(软)</span>
              <span v-if="playerScore.isBlackjack" class="inline-flex items-center gap-1 ml-1 text-[#ef4444]">
                <Sparkles class="w-3.5 h-3.5" />
                <span>BLACKJACK!</span>
              </span>
              <span v-if="playerScore.isBust" class="inline-flex items-center gap-1 ml-1 text-[#ef4444]">
                <AlertTriangle class="w-3.5 h-3.5" />
                <span>爆牌</span>
              </span>
            </span>
          </div>

          <div v-if="currentBet > 0" class="px-3.5 py-1 rounded-md bg-[#facc15] border-2 border-[#1a1a1a] text-xs font-mono font-black text-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] flex items-center gap-1">
            <span>下注: {{ currentBet }}</span>
            <CoinIcon customClass="w-3.5 h-3.5" />
          </div>
        </div>

        <!-- Controls Area -->
        <!-- 1. Betting Stage -->
        <div v-if="phase === 'betting'" class="w-full flex flex-col items-center space-y-4">
          <ChipSelector v-model="selectedChip" @change="addBet" />

          <div class="flex items-center space-x-3">
            <button
              @click="clearBet"
              :disabled="currentBet === 0"
              class="comic-btn-white px-4 py-2.5 text-xs"
            >
              清空下注
            </button>
            <button
              v-prevent-reclick
              @click="dealHands"
              :disabled="currentBet === 0 || authStore.userChips < currentBet || isDealing"
              class="comic-btn-green px-8 py-2.5 text-sm disabled:opacity-50"
            >
              <Play class="w-4 h-4 mr-1" />
              <span>{{ isDealing ? '正在发牌...' : '确认发牌' }}</span>
            </button>
          </div>
        </div>

        <!-- 2. Playing Stage -->
        <div v-else-if="phase === 'player_turn'" class="flex items-center space-x-4">
          <!-- 要牌 (Hit) -->
          <button
            v-prevent-reclick
            :disabled="isActionBusy"
            @click="handleHit"
            class="comic-btn-yellow px-6 py-2.5 text-sm disabled:opacity-50"
          >
            <Plus class="w-4 h-4 mr-1" />
            <span>要牌 (Hit)</span>
          </button>

          <!-- 停牌 (Stand) -->
          <button
            v-prevent-reclick
            :disabled="isActionBusy"
            @click="handleStand"
            class="comic-btn-red px-6 py-2.5 text-sm disabled:opacity-50"
          >
            <Hand class="w-4 h-4 mr-1" />
            <span>停牌 (Stand)</span>
          </button>

          <!-- 加倍 (Double) -->
          <button
            v-if="playerCards.length === 2 && authStore.userChips >= currentBet * 2"
            v-prevent-reclick
            :disabled="isActionBusy"
            @click="handleDouble"
            class="comic-btn-blue px-6 py-2.5 text-sm disabled:opacity-50"
          >
            <Zap class="w-4 h-4 mr-1" />
            <span>加倍 (Double)</span>
          </button>
        </div>

        <!-- 3. Settled Stage -->
        <div v-else-if="phase === 'settled'" class="flex items-center space-x-4">
          <button
            v-prevent-reclick
            @click="resetToBetting"
            class="comic-btn-green px-8 py-2.5 text-sm"
          >
            <RotateCw class="w-4 h-4 mr-1" />
            <span>再来一局</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import confetti from 'canvas-confetti'
import {
  CreditCard,
  ArrowLeft,
  Play,
  RotateCw,
  Plus,
  Hand,
  Zap,
  Sparkles,
  AlertTriangle,
  Clock
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { useGameScheduleStore } from '@/stores/gameSchedule'
import { sound } from '@/lib/sound'
import PlayingCard from '@/components/game/PlayingCard.vue'
import ChipSelector from '@/components/game/ChipSelector.vue'
import CoinIcon from '@/components/common/CoinIcon.vue'
import { createBlackjackDeck, calculateHandScore, determineBlackjackOutcome } from '../engine'
import type { Card } from '@/types/game'

const authStore = useAuthStore()
const walletStore = useWalletStore()
const gameScheduleStore = useGameScheduleStore()

const scheduleState = computed(() => gameScheduleStore.checkGameOpen('blackjack'))

type GamePhase = 'betting' | 'player_turn' | 'dealer_turn' | 'settled'
const phase = ref<GamePhase>('betting')

const deck = ref<Card[]>([])
const playerCards = ref<Card[]>([])
const dealerCards = ref<Card[]>([])
const selectedChip = ref<number>(100)
const currentBet = ref<number>(100)

const roundResult = ref<{ outcome: string; netProfit: number; description: string } | null>(null)

const playerScore = computed(() => calculateHandScore(playerCards.value))
const dealerScore = computed(() => calculateHandScore(dealerCards.value))

const isDealing = ref(false)
const isActionBusy = ref(false)

function addBet(val: number) {
  if (phase.value !== 'betting') return
  currentBet.value += val
}

function clearBet() {
  currentBet.value = 0
}

// 发牌
async function dealHands() {
  if (isDealing.value || currentBet.value <= 0 || authStore.userChips < currentBet.value) return
  isDealing.value = true
  try {
    // 扣除下注并初始化牌局
    roundResult.value = null
    deck.value = createBlackjackDeck(4)
    playerCards.value = []
    dealerCards.value = []

    sound.playDealCard()

    // 双方各发 2 张牌
    playerCards.value.push(deck.value.pop()!)
    dealerCards.value.push(deck.value.pop()!)
    playerCards.value.push(deck.value.pop()!)
    dealerCards.value.push(deck.value.pop()!)

    phase.value = 'player_turn'

    // 检查玩家是否起手 Blackjack
    if (playerScore.value.isBlackjack) {
      handleStand()
    }
  } finally {
    isDealing.value = false
  }
}

// 玩家要牌
function handleHit() {
  if (isActionBusy.value || phase.value !== 'player_turn') return
  isActionBusy.value = true
  try {
    playerCards.value.push(deck.value.pop()!)
    sound.playDealCard()

    if (playerScore.value.isBust) {
      sound.playLose()
      finishRound()
    } else if (playerScore.value.total === 21) {
      handleStand()
    }
  } finally {
    setTimeout(() => { isActionBusy.value = false }, 300)
  }
}

// 玩家停牌
function handleStand() {
  if (isActionBusy.value || phase.value !== 'player_turn') return
  isActionBusy.value = true
  phase.value = 'dealer_turn'

  // 庄家暗牌翻开，如果点数小于 17 则连续要牌
  const runDealer = () => {
    sound.playDealCard()
    if (dealerScore.value.total < 17) {
      setTimeout(() => {
        dealerCards.value.push(deck.value.pop()!)
        runDealer()
      }, 600)
    } else {
      finishRound()
      isActionBusy.value = false
    }
  }

  setTimeout(runDealer, 400)
}

// 玩家加倍
function handleDouble() {
  if (isActionBusy.value || phase.value !== 'player_turn' || playerCards.value.length !== 2) return
  isActionBusy.value = true
  try {
    currentBet.value *= 2
    playerCards.value.push(deck.value.pop()!)
    sound.playDealCard()

    if (playerScore.value.isBust) {
      sound.playLose()
      finishRound()
      isActionBusy.value = false
    } else {
      isActionBusy.value = false
      handleStand()
    }
  } catch {
    isActionBusy.value = false
  }
}

// 结算一局
async function finishRound() {
  phase.value = 'settled'

  const { outcome, multiplier, description } = determineBlackjackOutcome(
    playerScore.value,
    dealerScore.value
  )

  const payout = Math.floor(currentBet.value * multiplier)
  const netProfit = payout - currentBet.value

  roundResult.value = {
    outcome,
    netProfit,
    description
  }

  if (netProfit > 0) {
    sound.playWin()
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } })
  } else if (netProfit < 0) {
    sound.playLose()
  }

  // 同步至 Supabase
  await walletStore.recordGameSettlement(
    'blackjack',
    currentBet.value,
    payout,
    {
      playerTotal: playerScore.value.total,
      dealerTotal: dealerScore.value.total,
      outcome,
      playerCards: playerCards.value,
      dealerCards: dealerCards.value
    }
  )
}

function resetToBetting() {
  playerCards.value = []
  dealerCards.value = []
  roundResult.value = null
  phase.value = 'betting'
}
</script>
