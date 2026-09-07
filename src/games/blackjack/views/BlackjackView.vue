<template>
  <div class="max-w-5xl mx-auto px-4 py-6">
    <!-- Top Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-3">
        <router-link to="/" class="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors">
          ← 返回大厅
        </router-link>
        <div>
          <h1 class="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <span>🃏 21点 (Blackjack)</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300">
              单人对战庄家 · 3:2 天王赔率
            </span>
          </h1>
          <p class="text-xs text-slate-400">庄家必须在 16 点及以下补牌，17 点及以上停牌</p>
        </div>
      </div>
    </div>

    <!-- Felt Table -->
    <div class="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-2 border-slate-800 p-6 min-h-[520px] flex flex-col justify-between shadow-2xl overflow-hidden">
      <!-- Dealer Area (Top) -->
      <div class="flex flex-col items-center">
        <div class="flex items-center space-x-2 mb-2">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">庄家 (DEALER)</span>
          <span
            v-if="dealerScore.total > 0 && phase !== 'betting'"
            class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold"
            :class="dealerScore.isBust ? 'bg-rose-950 text-rose-400' : 'bg-slate-800 text-amber-300'"
          >
            {{ phase === 'player_turn' ? '?' : dealerScore.total + ' 点' }}
          </span>
        </div>

        <!-- Dealer Cards -->
        <div class="flex items-center -space-x-4 min-h-[100px]">
          <template v-if="dealerCards.length > 0">
            <PlayingCard
              v-for="(c, idx) in dealerCards"
              :key="idx"
              :card="c"
              :faceDown="idx === 1 && phase === 'player_turn'"
              size="md"
            />
          </template>
          <div v-else class="w-16 h-24 rounded-lg border-2 border-dashed border-slate-800 flex items-center justify-center text-slate-600 text-xs">
            等待发牌
          </div>
        </div>
      </div>

      <!-- Center Status & Round Info -->
      <div class="flex flex-col items-center justify-center my-4">
        <div v-if="phase === 'betting'" class="text-center space-y-2">
          <span class="text-sm font-semibold text-slate-300">请选择下注筹码，点击「发牌」开始</span>
          <div class="text-xs text-amber-400/80 font-mono">当前已下注: {{ currentBet }} 🪙</div>
        </div>

        <div v-else-if="roundResult" class="text-center space-y-1 py-2 px-6 rounded-2xl bg-slate-950/80 border border-slate-700 shadow-xl">
          <div class="text-lg font-black" :class="roundResult.netProfit > 0 ? 'text-emerald-400' : roundResult.netProfit < 0 ? 'text-rose-400' : 'text-slate-300'">
            {{ roundResult.description }}
          </div>
          <div class="text-xs font-mono font-bold" :class="roundResult.netProfit >= 0 ? 'text-amber-300' : 'text-rose-400'">
            {{ roundResult.netProfit >= 0 ? '+' : '' }}{{ roundResult.netProfit }} 🪙
          </div>
        </div>
      </div>

      <!-- Player Area (Bottom) -->
      <div class="flex flex-col items-center">
        <!-- Player Cards -->
        <div class="flex items-center -space-x-4 mb-2 min-h-[100px]">
          <template v-if="playerCards.length > 0">
            <PlayingCard
              v-for="(c, idx) in playerCards"
              :key="idx"
              :card="c"
              size="md"
              :highlight="playerScore.isBlackjack"
            />
          </template>
          <div v-else class="w-16 h-24 rounded-lg border-2 border-dashed border-slate-800 flex items-center justify-center text-slate-600 text-xs">
            等待下注
          </div>
        </div>

        <!-- Player Points Pill -->
        <div class="flex items-center space-x-2 mb-4">
          <div class="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono font-bold flex items-center space-x-2">
            <span class="text-slate-400">闲家点数:</span>
            <span :class="playerScore.isBust ? 'text-rose-400 font-black' : playerScore.isBlackjack ? 'text-amber-300 font-black' : 'text-emerald-400'">
              {{ playerScore.total }} 点
              <span v-if="playerScore.isSoft && !playerScore.isBust && playerScore.total !== 21">(软)</span>
              <span v-if="playerScore.isBlackjack">✨ BLACKJACK!</span>
              <span v-if="playerScore.isBust">💥 爆牌</span>
            </span>
          </div>

          <div v-if="currentBet > 0" class="px-3 py-1 rounded-full bg-amber-950/70 border border-amber-800 text-xs font-mono font-bold text-amber-300">
            下注: {{ currentBet }} 🪙
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
              class="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 border border-slate-700 transition-all disabled:opacity-40"
            >
              清空下注
            </button>
            <button
              @click="dealHands"
              :disabled="currentBet === 0 || authStore.userChips < currentBet"
              class="px-8 py-2.5 rounded-xl text-sm font-black text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-40"
            >
              确认发牌
            </button>
          </div>
        </div>

        <!-- 2. Playing Stage -->
        <div v-else-if="phase === 'player_turn'" class="flex items-center space-x-4">
          <!-- 要牌 (Hit) -->
          <button
            @click="handleHit"
            class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all"
          >
            ➕ 要牌 (Hit)
          </button>

          <!-- 停牌 (Stand) -->
          <button
            @click="handleStand"
            class="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-black text-sm transition-all"
          >
            ✋ 停牌 (Stand)
          </button>

          <!-- 加倍 (Double) -->
          <button
            v-if="playerCards.length === 2 && authStore.userChips >= currentBet * 2"
            @click="handleDouble"
            class="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-sm shadow-lg shadow-amber-600/30 transition-all"
          >
            ⚡ 加倍 (Double)
          </button>
        </div>

        <!-- 3. Settled Stage -->
        <div v-else-if="phase === 'settled'" class="flex items-center space-x-4">
          <button
            @click="resetToBetting"
            class="px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition-all"
          >
            再来一局
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
import PlayingCard from '@/components/game/PlayingCard.vue'
import ChipSelector from '@/components/game/ChipSelector.vue'
import { createBlackjackDeck, calculateHandScore, determineBlackjackOutcome } from '../engine'
import type { Card } from '@/types/game'

const authStore = useAuthStore()
const walletStore = useWalletStore()

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

function addBet(val: number) {
  if (phase.value !== 'betting') return
  currentBet.value += val
}

function clearBet() {
  currentBet.value = 0
}

// 发牌
function dealHands() {
  if (currentBet.value <= 0 || authStore.userChips < currentBet.value) return

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
}

// 玩家要牌
function handleHit() {
  if (phase.value !== 'player_turn') return
  playerCards.value.push(deck.value.pop()!)
  sound.playDealCard()

  if (playerScore.value.isBust) {
    sound.playLose()
    finishRound()
  } else if (playerScore.value.total === 21) {
    handleStand()
  }
}

// 玩家停牌
function handleStand() {
  if (phase.value !== 'player_turn') return
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
    }
  }

  setTimeout(runDealer, 400)
}

// 玩家加倍
function handleDouble() {
  if (phase.value !== 'player_turn' || playerCards.value.length !== 2) return
  currentBet.value *= 2
  playerCards.value.push(deck.value.pop()!)
  sound.playDealCard()

  if (playerScore.value.isBust) {
    sound.playLose()
    finishRound()
  } else {
    handleStand()
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
