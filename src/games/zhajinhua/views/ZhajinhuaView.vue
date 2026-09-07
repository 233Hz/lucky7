<template>
  <div class="max-w-6xl mx-auto px-4 py-6">
    <!-- Header Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-4 border-black">
      <div class="flex items-center space-x-3">
        <router-link to="/" class="brutal-btn brutal-btn-white px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
          <ArrowLeft class="w-4 h-4" />
          <span>返回大厅</span>
        </router-link>
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-black flex items-center gap-2 tracking-tight">
            <Layers class="w-6 h-6 text-black" />
            <span>炸金花 (Golden Flower)</span>
            <span class="brutal-badge bg-[#ccff00] text-black">
              智能AI对战
            </span>
          </h1>
          <p class="text-xs font-mono font-bold text-black/70 flex items-center gap-1 mt-0.5">
            <span>底注: {{ minBet }}</span>
            <CoinIcon customClass="w-3.5 h-3.5" />
            <span class="ml-1 text-black">| 闷牌 1 倍，看牌 2 倍</span>
          </p>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <button
          @click="startNewGame"
          :disabled="gameStatus === 'playing'"
          class="brutal-btn brutal-btn-lime px-6 py-2.5 text-sm font-black disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Play v-if="gameStatus !== 'playing'" class="w-4 h-4 fill-black" />
          <RotateCw v-else class="w-4 h-4 animate-spin" />
          <span>{{ gameStatus === 'ended' || gameStatus === 'waiting' ? '开始新对局' : '对局进行中' }}</span>
        </button>
      </div>
    </div>

    <!-- Table Surface -->
    <div class="relative rounded-none bg-white border-4 border-black p-6 min-h-[580px] flex flex-col justify-between shadow-brutal-xl overflow-hidden">
      <!-- Felt Ambient Pattern -->
      <div class="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

      <!-- 1. Top Opponents Area (AI Players) -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-6 justify-items-center relative z-20 pt-2">
        <div
          v-for="(ai, idx) in aiPlayers"
          :key="ai.id"
          class="relative flex flex-col items-center"
        >
          <PlayerSeat
            :seat="{
              id: ai.id,
              nickname: ai.nickname,
              avatarUrl: ai.avatarUrl,
              chips: ai.chips,
              currentBet: ai.currentBet,
              status: ai.folded ? 'folded' : 'active',
              cards: ai.cards,
              handName: gameStatus === 'ended' && !ai.folded ? evaluateZhajinhua(ai.cards).typeName : (ai.seen ? '已看牌' : '暗牌')
            }"
            :isCurrentTurn="currentTurnIdx === idx + 1 && gameStatus === 'playing'"
            :showCardsFaceDown="gameStatus !== 'ended'"
          />
        </div>
      </div>

      <!-- 2. Middle Table Area: Pot & Round Badge -->
      <div class="my-6 flex flex-col items-center justify-center relative z-10">
        <div class="px-6 py-3 rounded-none bg-[#ffff00] border-3 border-black shadow-brutal flex items-center space-x-4">
          <div class="w-10 h-10 rounded-none bg-black text-[#ffff00] border-2 border-black flex items-center justify-center shadow-sm">
            <CoinIcon customClass="w-6 h-6" />
          </div>
          <div>
            <div class="text-[10px] text-black font-mono font-black uppercase tracking-widest">底池彩金 (POT)</div>
            <div class="text-2xl font-black font-mono text-black">{{ formattedPot }}</div>
          </div>
        </div>

        <div v-if="gameStatus === 'playing'" class="mt-2.5 text-xs font-mono text-black font-black bg-white px-4 py-1.5 rounded-none border-2 border-black shadow-brutal-sm flex items-center gap-1.5">
          <span>第 {{ currentRound }} 轮</span>
          <span>|</span>
          <span>当前单注: {{ currentBetUnit }}</span>
          <CoinIcon customClass="w-3.5 h-3.5" />
        </div>
      </div>

      <!-- 3. Bottom Hero Player Area -->
      <div class="flex flex-col items-center relative z-20 pb-2">
        <!-- Hero Cards and Hand type (Spaced cleanly side-by-side, no collision) -->
        <div class="flex flex-col items-center mb-3">
          <div class="flex items-center space-x-3 sm:space-x-4 mb-2">
            <template v-if="hero.cards.length > 0">
              <PlayingCard
                v-for="(card, i) in hero.cards"
                :key="i"
                :card="card"
                :faceDown="!hero.seen && gameStatus === 'playing'"
                size="md"
              />
            </template>
            <div v-else class="w-20 h-28 rounded-none border-2 border-dashed border-black bg-[#f4f4f0] flex items-center justify-center text-black/50 text-xs font-mono font-bold">
              等待发牌
            </div>
          </div>

          <!-- Hero Hand Evaluation text -->
          <div v-if="hero.seen && hero.cards.length === 3" class="px-3.5 py-1 rounded-none bg-black text-[#ccff00] border border-black font-black font-mono text-xs shadow-brutal-sm">
            手牌: {{ heroHandEvaluation?.typeName }}
          </div>
        </div>

        <!-- Hero Seat summary -->
        <div class="flex items-center space-x-4 mb-4">
          <div class="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-none bg-white border-2 border-black shadow-brutal-sm">
            <img :src="hero.avatarUrl" class="w-6 h-6 rounded-none border-2 border-black" />
            <span class="text-sm font-black text-black">{{ hero.nickname }}</span>
            <div class="flex items-center space-x-1 ml-2 text-black font-mono font-black text-sm">
              <CoinIcon customClass="w-4 h-4" />
              <span>{{ formattedHeroChips }}</span>
            </div>
          </div>
          <div v-if="hero.currentBet > 0" class="text-xs font-mono font-black text-black px-3 py-1 rounded-none bg-[#ffff00] border-2 border-black shadow-brutal-sm flex items-center gap-1">
            <span>本局下注: {{ hero.currentBet }}</span>
            <CoinIcon customClass="w-3.5 h-3.5" />
          </div>
        </div>

        <!-- Action Control Buttons (Hero Turn) -->
        <div
          v-if="gameStatus === 'playing' && !hero.folded"
          class="flex items-center space-x-2 sm:space-x-4 flex-wrap justify-center gap-y-2"
        >
          <!-- 看牌 -->
          <button
            v-if="!hero.seen"
            @click="handleHeroCheck"
            class="brutal-btn brutal-btn-cyan px-5 py-2.5 text-sm font-black flex items-center gap-1.5"
          >
            <Eye class="w-4 h-4" />
            <span>看牌</span>
          </button>

          <!-- 弃牌 -->
          <button
            @click="handleHeroFold"
            class="brutal-btn brutal-btn-white px-5 py-2.5 text-sm font-bold flex items-center gap-1.5"
          >
            <Flag class="w-4 h-4" />
            <span>弃牌</span>
          </button>

          <!-- 跟注 -->
          <button
            @click="handleHeroCall"
            :disabled="currentTurnIdx !== 0 || hero.chips < heroBetCost"
            class="brutal-btn brutal-btn-lime px-6 py-2.5 text-sm font-black disabled:opacity-40 flex items-center gap-1.5"
          >
            <PlusCircle class="w-4 h-4" />
            <span>跟注 ({{ heroBetCost }})</span>
            <CoinIcon customClass="w-4 h-4" />
          </button>

          <!-- 加注 -->
          <button
            @click="handleHeroRaise"
            :disabled="currentTurnIdx !== 0 || hero.chips < heroBetCost * 2"
            class="brutal-btn brutal-btn-orange px-6 py-2.5 text-sm font-black disabled:opacity-40 flex items-center gap-1.5"
          >
            <ArrowUpCircle class="w-4 h-4" />
            <span>加注 ({{ heroBetCost * 2 }})</span>
            <CoinIcon customClass="w-4 h-4" />
          </button>

          <!-- 比牌 -->
          <button
            v-if="currentRound >= 2 && activeAICount > 0"
            @click="handleHeroCompare"
            :disabled="currentTurnIdx !== 0 || hero.chips < heroBetCost * 2"
            class="brutal-btn brutal-btn-pink px-6 py-2.5 text-sm font-black disabled:opacity-40 flex items-center gap-1.5"
          >
            <Swords class="w-4 h-4" />
            <span>比牌 (PK)</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Settlement Result Modal -->
    <Modal v-model="showResultModal" title="对局结算">
      <div class="text-center py-4 space-y-4">
        <div class="flex justify-center">
          <div
            class="w-16 h-16 rounded-none border-3 border-black flex items-center justify-center shadow-brutal"
            :class="gameResult?.isWin ? 'bg-[#ccff00] text-black' : 'bg-[#ff006e] text-white'"
          >
            <Trophy v-if="gameResult?.isWin" class="w-9 h-9" />
            <Frown v-else class="w-9 h-9" />
          </div>
        </div>
        <h2 class="text-2xl font-black text-black">
          {{ gameResult?.isWin ? '恭喜获胜！' : '本局遗憾失利' }}
        </h2>
        <p class="text-black font-bold text-sm">
          获胜者: <span class="bg-[#ffff00] px-2 py-0.5 border border-black text-black font-black">{{ gameResult?.winnerName }}</span>
        </p>
        <div class="px-4 py-3 rounded-none bg-[#f4f4f0] border-2 border-black text-sm font-mono font-bold flex items-center justify-between shadow-brutal-sm">
          <span class="text-black/70 uppercase">盈亏筹码:</span>
          <span class="flex items-center gap-1 font-black" :class="gameResult?.netProfit && gameResult.netProfit >= 0 ? 'text-black bg-[#ccff00] px-2 py-0.5 border border-black' : 'text-white bg-[#ff006e] px-2 py-0.5 border border-black'">
            <span>{{ (gameResult?.netProfit ?? 0) >= 0 ? '+' : '' }}{{ gameResult?.netProfit }}</span>
            <CoinIcon customClass="w-4 h-4" />
          </span>
        </div>
      </div>
      <template #footer>
        <button
          @click="startNewGame"
          class="brutal-btn brutal-btn-lime w-full py-2.5 text-sm font-black flex items-center justify-center gap-1.5"
        >
          <RotateCw class="w-4 h-4" />
          <span>再来一局</span>
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import confetti from 'canvas-confetti'
import {
  Layers,
  ArrowLeft,
  Play,
  RotateCw,
  Eye,
  Flag,
  PlusCircle,
  ArrowUpCircle,
  Swords,
  Trophy,
  Frown
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { sound } from '@/lib/sound'
import PlayingCard from '@/components/game/PlayingCard.vue'
import PlayerSeat from '@/components/game/PlayerSeat.vue'
import CoinIcon from '@/components/common/CoinIcon.vue'
import Modal from '@/components/common/Modal.vue'
import {
  createDeck,
  shuffleDeck,
  evaluateZhajinhua,
  compareZhajinhuaHands,
  getAIZhajinhuaAction
} from '../engine'
import type { ZhajinhuaPlayer, ZhajinhuaEvaluation } from '../types'

const authStore = useAuthStore()
const walletStore = useWalletStore()

const minBet = ref<number>(50)
const pot = ref<number>(0)
const currentRound = ref<number>(1)
const currentBetUnit = ref<number>(50)
const gameStatus = ref<'waiting' | 'playing' | 'ended'>('waiting')
const currentTurnIdx = ref<number>(0) // 0 is Hero, 1..N are AIs
const showResultModal = ref<boolean>(false)
const gameResult = ref<{ isWin: boolean; winnerName: string; netProfit: number } | null>(null)

// Hero (Local User)
const hero = ref<ZhajinhuaPlayer>({
  id: 'hero',
  nickname: '玩家',
  avatarUrl: '',
  chips: 10000,
  cards: [],
  seen: false,
  folded: false,
  currentBet: 0,
  isAI: false
})

// AI Players
const aiPlayers = ref<ZhajinhuaPlayer[]>([
  {
    id: 'ai_1',
    nickname: '赌王阿星',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=stephen',
    chips: 10000,
    cards: [],
    seen: false,
    folded: false,
    currentBet: 0,
    isAI: true
  },
  {
    id: 'ai_2',
    nickname: '冷静的高进',
    avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=godofgamblers',
    chips: 15000,
    cards: [],
    seen: false,
    folded: false,
    currentBet: 0,
    isAI: true
  }
])

const formattedPot = computed(() => new Intl.NumberFormat('en-US').format(pot.value))
const formattedHeroChips = computed(() => new Intl.NumberFormat('en-US').format(hero.value.chips))

const activeAICount = computed(() => aiPlayers.value.filter(p => !p.folded).length)

const heroBetCost = computed(() => {
  return hero.value.seen ? currentBetUnit.value * 2 : currentBetUnit.value
})

const heroHandEvaluation = computed<ZhajinhuaEvaluation | null>(() => {
  if (hero.value.cards.length === 3) {
    return evaluateZhajinhua(hero.value.cards)
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

// 开始新局
function startNewGame() {
  showResultModal.value = false
  if (authStore.profile && authStore.profile.chips < minBet.value) {
    alert('筹码不足，请先签到领取筹码！')
    return
  }

  // 同步用户余额
  if (authStore.profile) {
    hero.value.chips = authStore.profile.chips
  }

  const deck = shuffleDeck(createDeck())
  pot.value = 0
  currentRound.value = 1
  currentBetUnit.value = minBet.value

  // 重置 Hero
  hero.value.cards = [deck.pop()!, deck.pop()!, deck.pop()!]
  hero.value.seen = false
  hero.value.folded = false
  hero.value.currentBet = minBet.value
  hero.value.chips -= minBet.value
  pot.value += minBet.value

  // 重置 AI
  aiPlayers.value.forEach(ai => {
    ai.cards = [deck.pop()!, deck.pop()!, deck.pop()!]
    ai.seen = false
    ai.folded = false
    ai.currentBet = minBet.value
    ai.chips -= minBet.value
    pot.value += minBet.value
  })

  sound.playDealCard()
  gameStatus.value = 'playing'
  currentTurnIdx.value = 0 // Hero takes first action
}

// Hero 看牌
function handleHeroCheck() {
  hero.value.seen = true
  sound.playClick()
}

// Hero 弃牌
function handleHeroFold() {
  hero.value.folded = true
  sound.playLose()
  checkRoundFinish()
  if (gameStatus.value === 'playing') {
    nextTurn()
  }
}

// Hero 跟注
function handleHeroCall() {
  const cost = heroBetCost.value
  hero.value.chips -= cost
  hero.value.currentBet += cost
  pot.value += cost
  sound.playChip()
  nextTurn()
}

// Hero 加注
function handleHeroRaise() {
  currentBetUnit.value += minBet.value
  const cost = heroBetCost.value
  hero.value.chips -= cost
  hero.value.currentBet += cost
  pot.value += cost
  sound.playChip()
  nextTurn()
}

// Hero 比牌
function handleHeroCompare() {
  const activeAIs = aiPlayers.value.filter(a => !a.folded)
  if (activeAIs.length === 0) return

  const cost = heroBetCost.value * 2
  hero.value.chips -= cost
  hero.value.currentBet += cost
  pot.value += cost
  sound.playChip()

  // 挑选第一个在局 AI 比牌
  const targetAI = activeAIs[0]
  const cmp = compareZhajinhuaHands(hero.value.cards, targetAI.cards)

  if (cmp >= 0) {
    // Hero 胜出，目标 AI 弃牌
    targetAI.folded = true
  } else {
    // Hero 败，Hero 弃牌
    hero.value.folded = true
    sound.playLose()
  }

  checkRoundFinish()
  if (gameStatus.value === 'playing') {
    nextTurn()
  }
}

// 轮流到下一个玩家
function nextTurn() {
  if (checkRoundFinish()) return

  currentTurnIdx.value = (currentTurnIdx.value + 1) % (aiPlayers.value.length + 1)

  // 如果轮到已弃牌的玩家，直接跳到下一位
  if (currentTurnIdx.value === 0 && hero.value.folded) {
    nextTurn()
    return
  }

  if (currentTurnIdx.value > 0) {
    const ai = aiPlayers.value[currentTurnIdx.value - 1]
    if (ai.folded) {
      nextTurn()
      return
    }
    // 触发 AI 动作
    setTimeout(() => {
      runAITurn(ai)
    }, 700)
  }
}

// 执行 AI 行为
function runAITurn(ai: ZhajinhuaPlayer) {
  if (gameStatus.value !== 'playing' || ai.folded) return

  const action = getAIZhajinhuaAction(
    ai.cards,
    ai.seen,
    currentRound.value,
    currentBetUnit.value,
    ai.chips
  )

  const betCost = ai.seen ? currentBetUnit.value * 2 : currentBetUnit.value

  if (action === 'check') {
    ai.seen = true
    // 看牌后自动跟注或弃牌
    if (ai.chips >= currentBetUnit.value * 2) {
      ai.chips -= currentBetUnit.value * 2
      ai.currentBet += currentBetUnit.value * 2
      pot.value += currentBetUnit.value * 2
      sound.playChip()
    } else {
      ai.folded = true
    }
  } else if (action === 'fold') {
    ai.folded = true
  } else if (action === 'raise' && ai.chips >= betCost * 2) {
    currentBetUnit.value += minBet.value
    const cost = ai.seen ? currentBetUnit.value * 2 : currentBetUnit.value
    ai.chips -= cost
    ai.currentBet += cost
    pot.value += cost
    sound.playChip()
  } else if (action === 'compare') {
    // AI 选择与 Hero 比牌
    if (!hero.value.folded) {
      const cmp = compareZhajinhuaHands(ai.cards, hero.value.cards)
      if (cmp > 0) {
        hero.value.folded = true
        sound.playLose()
      } else {
        ai.folded = true
      }
    } else {
      ai.chips -= betCost
      ai.currentBet += betCost
      pot.value += betCost
    }
  } else {
    // 默认跟注
    ai.chips -= betCost
    ai.currentBet += betCost
    pot.value += betCost
    sound.playChip()
  }

  // 轮次增加
  if (currentTurnIdx.value === aiPlayers.value.length) {
    currentRound.value++
  }

  if (!checkRoundFinish()) {
    nextTurn()
  }
}

// 检查是否仅剩 1 名在局玩家，或者到达封顶轮次进行开牌
function checkRoundFinish(): boolean {
  const activeAll = [hero.value, ...aiPlayers.value].filter(p => !p.folded)

  if (activeAll.length <= 1 || currentRound.value > 15) {
    finishGame(activeAll)
    return true
  }
  return false
}

// 结算游戏
async function finishGame(survivors: ZhajinhuaPlayer[]) {
  gameStatus.value = 'ended'
  let winner = survivors[0]

  if (survivors.length > 1) {
    // 比较幸存者手牌决出冠军
    survivors.sort((a, b) => compareZhajinhuaHands(b.cards, a.cards))
    winner = survivors[0]
  }

  const isHeroWin = winner.id === hero.value.id
  let netProfit = 0

  if (isHeroWin) {
    netProfit = pot.value - hero.value.currentBet
    hero.value.chips += pot.value
    sound.playWin()
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } })
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

  // 同步记录至 Supabase
  await walletStore.recordGameSettlement(
    'zhajinhua',
    hero.value.currentBet,
    isHeroWin ? pot.value : 0,
    {
      hand: hero.value.cards,
      eval: heroHandEvaluation.value?.typeName,
      winner: winner.nickname
    }
  )
}
</script>
