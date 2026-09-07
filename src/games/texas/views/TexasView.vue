<template>
  <div class="max-w-6xl mx-auto px-4 py-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-3">
        <router-link to="/" class="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors">
          ← 返回大厅
        </router-link>
        <div>
          <h1 class="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <span>♠️ 德州扑克 (Texas Hold'em)</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300">
              专业竞技 · 7选5牌型评估
            </span>
          </h1>
          <p class="text-xs text-slate-400">大盲: {{ bigBlind }} 🪙 | 小盲: {{ smallBlind }} 🪙</p>
        </div>
      </div>

      <button
        @click="startNewGame"
        :disabled="gameActive"
        class="px-5 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
      >
        {{ gameActive ? '对局进行中' : '开始新对局' }}
      </button>
    </div>

    <!-- Felt Poker Table -->
    <div class="relative rounded-3xl bg-gradient-to-b from-emerald-950 via-slate-950 to-slate-950 border-4 border-emerald-900/60 p-6 min-h-[560px] flex flex-col justify-between shadow-2xl overflow-hidden">
      <!-- Ambient Felt Pattern -->
      <div class="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none"></div>

      <!-- Top AI Opponents -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 justify-items-center relative z-20">
        <div
          v-for="(ai, idx) in aiPlayers"
          :key="ai.id"
          class="flex flex-col items-center"
        >
          <PlayerSeat
            :seat="{
              id: ai.id,
              nickname: ai.nickname,
              avatarUrl: ai.avatarUrl,
              chips: ai.chips,
              currentBet: ai.currentBet,
              status: ai.folded ? 'folded' : ai.isAllIn ? 'allin' : 'active',
              cards: ai.holeCards,
              handName: currentRound === 'showdown' && !ai.folded ? evaluateTexas7Cards([...ai.holeCards, ...communityCards]).rankName : ''
            }"
            :isCurrentTurn="currentTurnIdx === idx + 1 && gameActive"
            :showCardsFaceDown="currentRound !== 'showdown'"
          />
        </div>
      </div>

      <!-- Center Community Cards & Pot -->
      <div class="flex flex-col items-center justify-center my-6 relative z-10">
        <!-- Pot Display -->
        <div class="px-5 py-2 rounded-2xl bg-slate-900/90 border border-emerald-500/50 backdrop-blur-md shadow-xl flex items-center space-x-3 mb-4">
          <span class="text-xs text-slate-400 font-bold uppercase tracking-wider">总彩池:</span>
          <span class="text-2xl font-black font-mono text-amber-300">🪙 {{ formattedPot }}</span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-semibold uppercase">
            {{ roundName }}
          </span>
        </div>

        <!-- 5 Community Cards Area -->
        <div class="flex items-center space-x-2 sm:space-x-3 min-h-[96px] p-2 rounded-2xl bg-slate-950/60 border border-slate-800">
          <template v-if="communityCards.length > 0">
            <PlayingCard
              v-for="(c, idx) in communityCards"
              :key="idx"
              :card="c"
              size="md"
            />
          </template>
          <!-- Placeholder card outlines if < 5 -->
          <div
            v-for="idx in (5 - communityCards.length)"
            :key="'ph_' + idx"
            class="w-14 h-20 sm:w-16 sm:h-24 rounded-lg border-2 border-dashed border-slate-800 flex items-center justify-center text-slate-700 text-xs font-mono"
          >
            {{ idx === 1 && communityCards.length === 0 ? '翻牌' : idx === 4 ? '转牌' : '河牌' }}
          </div>
        </div>
      </div>

      <!-- Bottom Hero Player Area -->
      <div class="flex flex-col items-center relative z-20">
        <!-- Hero Hole Cards -->
        <div class="flex flex-col items-center mb-2">
          <div class="flex items-center -space-x-3 mb-1">
            <template v-if="hero.holeCards.length > 0">
              <PlayingCard
                v-for="(card, i) in hero.holeCards"
                :key="i"
                :card="card"
                size="md"
              />
            </template>
          </div>

          <!-- Hero Best 5-Card Hand Evaluation Badge -->
          <div v-if="heroEvaluation" class="px-3 py-1 rounded-full bg-slate-900 border border-emerald-500/60 text-emerald-300 font-bold text-xs shadow">
            成牌牌型: {{ heroEvaluation.rankName }}
          </div>
        </div>

        <!-- Hero Chips & Bet Info -->
        <div class="flex items-center space-x-3 mb-3">
          <div class="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <img :src="hero.avatarUrl" class="w-6 h-6 rounded-full border border-slate-700" />
            <span class="text-sm font-bold text-slate-200">{{ hero.nickname }}</span>
            <span class="text-amber-400 font-mono font-black text-sm ml-2">🪙 {{ formattedHeroChips }}</span>
          </div>
          <div v-if="hero.currentBet > 0" class="text-xs font-mono text-amber-300 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800">
            本轮注额: {{ hero.currentBet }}
          </div>
        </div>

        <!-- Action Control Buttons -->
        <div v-if="gameActive && !hero.folded" class="flex items-center space-x-3 flex-wrap justify-center gap-y-2">
          <!-- 弃牌 (Fold) -->
          <button
            @click="handleHeroFold"
            :disabled="currentTurnIdx !== 0"
            class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 border border-slate-700 text-sm font-bold transition-all disabled:opacity-40"
          >
            弃牌 (Fold)
          </button>

          <!-- 过牌 (Check) 或 跟注 (Call) -->
          <button
            v-if="heroCallAmount === 0"
            @click="handleHeroCheck"
            :disabled="currentTurnIdx !== 0"
            class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-40"
          >
            过牌 (Check)
          </button>
          <button
            v-else
            @click="handleHeroCall"
            :disabled="currentTurnIdx !== 0 || hero.chips < heroCallAmount"
            class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-40"
          >
            跟注 (Call: {{ heroCallAmount }} 🪙)
          </button>

          <!-- 加注 (Raise) -->
          <button
            @click="handleHeroRaise"
            :disabled="currentTurnIdx !== 0 || hero.chips < highestBet + bigBlind"
            class="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold shadow-lg shadow-amber-600/30 transition-all disabled:opacity-40"
          >
            加注 (+{{ bigBlind }} 🪙)
          </button>

          <!-- 全下 (All-In) -->
          <button
            @click="handleHeroAllIn"
            :disabled="currentTurnIdx !== 0 || hero.chips <= 0"
            class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-black shadow-lg shadow-rose-600/30 transition-all disabled:opacity-40"
          >
            全下 (All-In)
          </button>
        </div>
      </div>
    </div>

    <!-- Settlement Modal -->
    <Modal v-model="showResultModal" title="德扑牌局结算">
      <div class="text-center py-4 space-y-4">
        <div class="text-4xl">{{ gameResult?.isWin ? '🏆' : '💀' }}</div>
        <h2 class="text-2xl font-black" :class="gameResult?.isWin ? 'text-emerald-400' : 'text-rose-400'">
          {{ gameResult?.isWin ? '胜利赢得底池！' : '本局遗憾失利' }}
        </h2>
        <p class="text-slate-300 text-sm">
          最终胜者: <span class="font-bold text-amber-400">{{ gameResult?.winnerName }}</span>
        </p>
        <div class="px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono flex items-center justify-between">
          <span class="text-slate-400">净盈亏筹码:</span>
          <span :class="gameResult?.netProfit && gameResult.netProfit >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'">
            {{ (gameResult?.netProfit ?? 0) >= 0 ? '+' : '' }}{{ gameResult?.netProfit }} 🪙
          </span>
        </div>
      </div>
      <template #footer>
        <button
          @click="startNewGame"
          class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow transition-all"
        >
          开始下一局
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import confetti from 'canvas-confetti'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { sound } from '@/lib/sound'
import PlayingCard from '@/components/game/PlayingCard.vue'
import PlayerSeat from '@/components/game/PlayerSeat.vue'
import Modal from '@/components/common/Modal.vue'
import { createTexasDeck, evaluateTexas7Cards, getAITexasAction } from '../engine'
import type { TexasPlayer, TexasBetRound, TexasEvaluation } from '../types'
import type { Card } from '@/types/game'

const authStore = useAuthStore()
const walletStore = useWalletStore()

const smallBlind = ref(50)
const bigBlind = ref(100)
const pot = ref(0)
const currentRound = ref<TexasBetRound>('preflop')
const gameActive = ref(false)
const currentTurnIdx = ref(0) // 0 is Hero, 1..N are AIs
const showResultModal = ref(false)
const gameResult = ref<{ isWin: boolean; winnerName: string; netProfit: number } | null>(null)

let deck: Card[] = []
const communityCards = ref<Card[]>([])

const hero = ref<TexasPlayer>({
  id: 'hero',
  nickname: '玩家',
  avatarUrl: '',
  chips: 10000,
  holeCards: [],
  currentBet: 0,
  folded: false,
  isAllIn: false,
  isAI: false
})

const aiPlayers = ref<TexasPlayer[]>([
  {
    id: 'ai_texas_1',
    nickname: 'Phil Ivey',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ivey',
    chips: 10000,
    holeCards: [],
    currentBet: 0,
    folded: false,
    isAllIn: false,
    isAI: true
  },
  {
    id: 'ai_texas_2',
    nickname: 'Tom Dwan',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=dwan',
    chips: 12000,
    holeCards: [],
    currentBet: 0,
    folded: false,
    isAllIn: false,
    isAI: true
  }
])

const formattedPot = computed(() => new Intl.NumberFormat('en-US').format(pot.value))
const formattedHeroChips = computed(() => new Intl.NumberFormat('en-US').format(hero.value.chips))

const roundName = computed(() => {
  switch (currentRound.value) {
    case 'preflop': return '翻牌前 (Pre-Flop)'
    case 'flop': return '翻牌圈 (Flop)'
    case 'turn': return '转牌圈 (Turn)'
    case 'river': return '河牌圈 (River)'
    case 'showdown': return '摊牌结算 (Showdown)'
  }
})

const highestBet = computed(() => {
  const all = [hero.value, ...aiPlayers.value]
  return Math.max(...all.map(p => p.currentBet))
})

const heroCallAmount = computed(() => {
  return Math.max(0, highestBet.value - hero.value.currentBet)
})

const heroEvaluation = computed<TexasEvaluation | null>(() => {
  if (hero.value.holeCards.length === 2 && communityCards.value.length >= 3) {
    return evaluateTexas7Cards([...hero.value.holeCards, ...communityCards.value])
  }
  return null
})

onMounted(() => {
  if (authStore.profile) {
    hero.value.nickname = authStore.profile.nickname
    hero.value.avatarUrl = authStore.profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${authStore.profile.id}`
    hero.value.chips = authStore.profile.chips
  }
})

// 开始对局
function startNewGame() {
  if (authStore.profile && authStore.profile.chips < bigBlind.value) {
    alert('筹码不足，请先前往签到获取筹码！')
    return
  }

  showResultModal.value = false
  deck = createTexasDeck()
  communityCards.value = []
  pot.value = 0
  currentRound.value = 'preflop'

  // 同步 Hero
  if (authStore.profile) {
    hero.value.chips = authStore.profile.chips
  }
  hero.value.holeCards = [deck.pop()!, deck.pop()!]
  hero.value.folded = false
  hero.value.isAllIn = false
  hero.value.currentBet = 0

  // 同步 AIs
  aiPlayers.value.forEach(ai => {
    ai.holeCards = [deck.pop()!, deck.pop()!]
    ai.folded = false
    ai.isAllIn = false
    ai.currentBet = 0
  })

  // 盲注投入：小盲 (Hero) + 大盲 (AI 1)
  hero.value.chips -= smallBlind.value
  hero.value.currentBet = smallBlind.value
  pot.value += smallBlind.value

  const bigBlindAI = aiPlayers.value[0]
  bigBlindAI.chips -= bigBlind.value
  bigBlindAI.currentBet = bigBlind.value
  pot.value += bigBlind.value

  sound.playDealCard()
  gameActive.value = true
  currentTurnIdx.value = 0
}

function handleHeroFold() {
  hero.value.folded = true
  sound.playLose()
  checkRoundAdvancement()
}

function handleHeroCheck() {
  sound.playClick()
  advanceTurn()
}

function handleHeroCall() {
  const callAmt = heroCallAmount.value
  hero.value.chips -= callAmt
  hero.value.currentBet += callAmt
  pot.value += callAmt
  sound.playChip()
  advanceTurn()
}

function handleHeroRaise() {
  const raiseAmt = heroCallAmount.value + bigBlind.value
  hero.value.chips -= raiseAmt
  hero.value.currentBet += raiseAmt
  pot.value += raiseAmt
  sound.playChip()
  advanceTurn()
}

function handleHeroAllIn() {
  const allInAmt = hero.value.chips
  hero.value.chips = 0
  hero.value.currentBet += allInAmt
  hero.value.isAllIn = true
  pot.value += allInAmt
  sound.playChip()
  advanceTurn()
}

function advanceTurn() {
  if (checkRoundAdvancement()) return

  currentTurnIdx.value = (currentTurnIdx.value + 1) % (aiPlayers.value.length + 1)

  if (currentTurnIdx.value === 0 && hero.value.folded) {
    advanceTurn()
    return
  }

  if (currentTurnIdx.value > 0) {
    const ai = aiPlayers.value[currentTurnIdx.value - 1]
    if (ai.folded || ai.isAllIn) {
      advanceTurn()
      return
    }
    setTimeout(() => {
      runAITurn(ai)
    }, 600)
  }
}

function runAITurn(ai: TexasPlayer) {
  if (!gameActive.value || ai.folded) return

  const callAmt = Math.max(0, highestBet.value - ai.currentBet)
  const action = getAITexasAction(ai.holeCards, communityCards.value, callAmt, ai.chips)

  if (action === 'fold') {
    ai.folded = true
  } else if (action === 'raise' && ai.chips >= callAmt + bigBlind.value) {
    const raiseCost = callAmt + bigBlind.value
    ai.chips -= raiseCost
    ai.currentBet += raiseCost
    pot.value += raiseCost
    sound.playChip()
  } else if (callAmt > 0) {
    const actualCall = Math.min(callAmt, ai.chips)
    ai.chips -= actualCall
    ai.currentBet += actualCall
    pot.value += actualCall
    sound.playChip()
  } else {
    // Check
    sound.playClick()
  }

  advanceTurn()
}

// 检查下注轮次推进或是否只剩 1 人
function checkRoundAdvancement(): boolean {
  const activePlayers = [hero.value, ...aiPlayers.value].filter(p => !p.folded)

  if (activePlayers.length === 1) {
    showdownAndSettle(activePlayers[0])
    return true
  }

  // 检查本轮各玩家下注是否持平
  const allBetsEqual = activePlayers.every(p => p.currentBet === highestBet.value || p.isAllIn)

  if (allBetsEqual && currentTurnIdx.value === aiPlayers.value.length) {
    // 推进下一街
    nextStreet()
    return true
  }

  return false
}

// 发下一街公共牌
function nextStreet() {
  sound.playDealCard()

  if (currentRound.value === 'preflop') {
    currentRound.value = 'flop'
    communityCards.value.push(deck.pop()!, deck.pop()!, deck.pop()!)
  } else if (currentRound.value === 'flop') {
    currentRound.value = 'turn'
    communityCards.value.push(deck.pop()!)
  } else if (currentRound.value === 'turn') {
    currentRound.value = 'river'
    communityCards.value.push(deck.pop()!)
  } else if (currentRound.value === 'river') {
    currentRound.value = 'showdown'
    // 摊牌比牌
    showdownAndSettle()
    return
  }

  currentTurnIdx.value = 0
}

// 摊牌与结算
async function showdownAndSettle(singleWinner?: TexasPlayer) {
  gameActive.value = false
  currentRound.value = 'showdown'

  let winner = singleWinner

  if (!winner) {
    const active = [hero.value, ...aiPlayers.value].filter(p => !p.folded)
    active.sort((a, b) => {
      const evA = evaluateTexas7Cards([...a.holeCards, ...communityCards.value])
      const evB = evaluateTexas7Cards([...b.holeCards, ...communityCards.value])
      return evB.score - evA.score
    })
    winner = active[0]
  }

  const isHeroWin = winner.id === hero.value.id
  let netProfit = 0

  if (isHeroWin) {
    netProfit = pot.value - hero.value.currentBet
    hero.value.chips += pot.value
    sound.playWin()
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
  } else {
    netProfit = -hero.value.currentBet
    winner.chips += pot.value
    sound.playLose()
  }

  gameResult.value = {
    isWin: isHeroWin,
    winnerName: winner.nickname,
    netProfit
  }
  showResultModal.value = true

  // 同步至 Supabase
  await walletStore.recordGameSettlement(
    'texas',
    hero.value.currentBet,
    isHeroWin ? pot.value : 0,
    {
      communityCards: communityCards.value,
      heroHoleCards: hero.value.holeCards,
      heroHand: heroEvaluation.value?.rankName,
      winner: winner.nickname
    }
  )
}
</script>
