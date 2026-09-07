<template>
  <div class="max-w-6xl mx-auto px-4 py-6">
    <!-- Header Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-4 border-black">
      <div class="flex items-center space-x-3">
        <router-link
          to="/"
          @click="handleLeaveRoom"
          class="brutal-btn brutal-btn-white px-3 py-1.5 text-xs inline-flex items-center gap-1.5"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>返回大厅</span>
        </router-link>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-black text-black flex items-center gap-2 tracking-tight">
              <Crown class="w-6 h-6 text-black" />
              <span>{{ roomStore.currentRoom?.name || '德州扑克对战桌' }}</span>
            </h1>
            <span
              class="brutal-badge text-black font-black"
              :class="roomStore.currentRoom?.status === 'playing' ? 'bg-[#ff006e] text-white' : 'bg-[#ccff00]'"
            >
              {{ roomStore.currentRoom?.status === 'playing' ? '对局进行中' : '房间准备中' }}
            </span>
            <span v-if="roomStore.isHost" class="brutal-badge bg-[#ffff00] text-black">
              您是房主
            </span>
          </div>
          <p class="text-xs font-mono font-bold text-black/70 flex items-center gap-1 mt-0.5">
            <span>大盲: {{ bigBlind }}</span>
            <CoinIcon customClass="w-3.5 h-3.5" />
            <span class="ml-1 text-black">| 小盲: {{ smallBlind }}</span>
            <CoinIcon customClass="w-3.5 h-3.5" />
            <span class="ml-2 bg-black text-[#ccff00] px-1.5 py-0.2 rounded-none text-[11px]">
              在桌人数: {{ roomStore.roomPlayers.length }}/{{ roomStore.currentRoom?.max_players || 6 }}
            </span>
          </p>
        </div>
      </div>

      <!-- Quick Actions / Room Controls -->
      <div class="flex items-center space-x-2">
        <button
          v-if="!isSupabaseConfigured() && roomStore.currentRoom?.status === 'waiting' && roomStore.roomPlayers.length < (roomStore.currentRoom?.max_players || 6)"
          @click="roomStore.addTestPlayer()"
          class="brutal-btn brutal-btn-cyan px-3 py-2 text-xs font-bold flex items-center gap-1"
          title="辅助本地测试：快捷添加测试对手"
        >
          <UserPlus class="w-3.5 h-3.5" />
          <span>+ 邀请测试玩家</span>
        </button>

        <button
          @click="handleLeaveRoom"
          class="brutal-btn brutal-btn-white px-3.5 py-2 text-xs font-bold flex items-center gap-1 hover:bg-[#ff006e] hover:text-white"
        >
          <LogOut class="w-3.5 h-3.5" />
          <span>退出房间</span>
        </button>
      </div>
    </div>

    <!-- Felt Poker Table -->
    <div class="relative rounded-none bg-white border-4 border-black p-6 min-h-[580px] flex flex-col justify-between shadow-brutal-xl overflow-hidden">
      <!-- Ambient Felt Pattern -->
      <div class="absolute inset-0 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none"></div>

      <!-- Top Opponents Area (Real players, zero auto-bots) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-items-center relative z-20 pt-2 min-h-[140px]">
        <!-- Seated Opponents -->
        <div
          v-for="(opp, idx) in opponentPlayers"
          :key="opp.id"
          class="flex flex-col items-center relative"
        >
          <PlayerSeat
            :seat="{
              id: opp.id,
              nickname: opp.nickname,
              avatarUrl: opp.avatarUrl,
              chips: opp.chips,
              currentBet: opp.currentBet,
              status: opp.folded ? 'folded' : opp.isAllIn ? 'allin' : 'active',
              cards: opp.holeCards,
              handName: currentRound === 'showdown' && !opp.folded && opp.holeCards.length === 2 && communityCards.length >= 3
                ? evaluateTexas7Cards([...opp.holeCards, ...communityCards]).rankName
                : ''
            }"
            :isCurrentTurn="currentTurnIdx === idx + 1 && gameActive"
            :showCardsFaceDown="currentRound !== 'showdown'"
            :isHost="opp.isHost"
            :readyStatus="roomStore.currentRoom?.status === 'waiting' ? opp.readyStatus : undefined"
          />

          <!-- Quick Test Toggle Ready (Only in local test mode for simulated opponents) -->
          <div
            v-if="roomStore.currentRoom?.status === 'waiting' && opp.id.startsWith('test_player_')"
            class="mt-4 flex items-center gap-1 z-30"
          >
            <button
              @click="handleToggleOpponentReady(opp.id)"
              class="px-2 py-0.5 text-[10px] font-black border border-black bg-white hover:bg-[#ccff00]"
            >
              {{ opp.readyStatus === 'ready' ? '设为未准备' : '模拟准备' }}
            </button>
            <button
              @click="roomStore.removePlayer(opp.id)"
              class="px-1.5 py-0.5 text-[10px] font-black border border-black bg-[#ff006e] text-white"
              title="移出该玩家"
            >
              ×
            </button>
          </div>
        </div>

        <!-- Empty Seats -->
        <div
          v-for="idx in emptySeatsCount"
          :key="'empty_' + idx"
          class="w-32 sm:w-36 h-32 rounded-none border-2 border-dashed border-black/40 flex flex-col items-center justify-center p-3 text-center bg-[#fafaf9]/80"
        >
          <div class="w-8 h-8 rounded-none border border-black/30 bg-black/5 flex items-center justify-center mb-1 text-black/40">
            <Users class="w-4 h-4" />
          </div>
          <span class="text-xs font-mono font-bold text-black/50">等待玩家入座</span>
          <span class="text-[10px] font-mono text-black/30 mt-0.5">空闲座位</span>
        </div>
      </div>

      <!-- Center Community Cards & Pot / Waiting Banner -->
      <div class="flex flex-col items-center justify-center my-6 relative z-10">
        <!-- In-game Pot Display -->
        <template v-if="gameActive || currentRound === 'showdown'">
          <div class="px-6 py-3 rounded-none bg-[#ffff00] border-3 border-black shadow-brutal flex items-center space-x-3 mb-4">
            <span class="text-xs font-black font-mono text-black uppercase tracking-wider">总彩池:</span>
            <div class="flex items-center gap-1 text-2xl font-black font-mono text-black">
              <CoinIcon customClass="w-6 h-6" />
              <span>{{ formattedPot }}</span>
            </div>
            <span class="text-xs px-2.5 py-0.5 rounded-none bg-black text-[#ffff00] border border-black font-mono font-bold uppercase">
              {{ roundName }}
            </span>
          </div>

          <!-- 5 Community Cards Area -->
          <div class="flex items-center space-x-2.5 sm:space-x-3.5 min-h-[116px] p-3 rounded-none bg-[#f4f4f0] border-3 border-black shadow-brutal-sm">
            <template v-if="communityCards.length > 0">
              <PlayingCard
                v-for="(c, idx) in communityCards"
                :key="idx"
                :card="c"
                size="md"
              />
            </template>
            <div
              v-for="idx in (5 - communityCards.length)"
              :key="'ph_' + idx"
              class="w-20 h-28 sm:w-22 sm:h-32 rounded-none border-2 border-dashed border-black bg-white flex items-center justify-center text-black/50 text-xs font-mono font-bold"
            >
              {{ idx === 1 && communityCards.length === 0 ? '翻牌' : idx === 4 ? '转牌' : '河牌' }}
            </div>
          </div>
        </template>

        <!-- Waiting Stage Center Banner -->
        <div v-else class="px-6 py-4 rounded-none bg-white border-3 border-black shadow-brutal text-center max-w-md">
          <div class="text-xs font-mono font-black text-black uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
            <Clock class="w-4 h-4 text-black" />
            <span>房间等待准备就绪</span>
          </div>
          <div class="text-sm font-black text-black">
            {{ waitingStatusText }}
          </div>
          <div class="text-[11px] font-mono font-bold text-black/70 mt-1">
            进入房间后须先准备；所有玩家准备完毕后，房主即可开启对局
          </div>
        </div>
      </div>

      <!-- Bottom Hero Area -->
      <div class="flex flex-col items-center relative z-20 pb-2">
        <!-- Hero Hole Cards & Hand Type -->
        <div class="flex flex-col items-center mb-3">
          <div class="flex items-center space-x-3 sm:space-x-4 mb-2">
            <template v-if="hero.holeCards.length > 0 && gameActive">
              <PlayingCard
                v-for="(c, idx) in hero.holeCards"
                :key="idx"
                :card="c"
                size="md"
              />
            </template>
            <div v-else class="w-20 h-28 rounded-none border-2 border-dashed border-black bg-[#f4f4f0] flex items-center justify-center text-black/50 text-xs font-mono font-bold text-center px-2">
              {{ roomStore.currentRoom?.status === 'waiting' ? (roomStore.isCurrentUserReady ? '已准备就绪' : '等待准备') : '等待发底牌' }}
            </div>
          </div>

          <!-- Hero Hand Evaluation Rank -->
          <div v-if="heroEvaluation && gameActive" class="px-3.5 py-1 rounded-none bg-black text-[#ccff00] border border-black font-black font-mono text-xs shadow-brutal-sm">
            手牌等级: {{ heroEvaluation.rankName }}
          </div>
        </div>

        <!-- Hero Status Pill -->
        <div class="flex items-center space-x-4 mb-4">
          <div class="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-none bg-white border-2 border-black shadow-brutal-sm">
            <img :src="hero.avatarUrl" class="w-6 h-6 rounded-none border-2 border-black" />
            <span class="text-sm font-black text-black">{{ hero.nickname }}</span>
            <div class="flex items-center space-x-1 ml-2 text-black font-mono font-black text-sm">
              <CoinIcon customClass="w-4 h-4" />
              <span>{{ formattedHeroChips }}</span>
            </div>
            <span
              v-if="roomStore.currentRoom?.status === 'waiting'"
              class="ml-2 px-2 py-0.5 text-[10px] font-black border border-black uppercase"
              :class="roomStore.isCurrentUserReady ? 'bg-[#ccff00] text-black' : 'bg-[#ff9500] text-black'"
            >
              {{ roomStore.isCurrentUserReady ? '已准备' : '未准备' }}
            </span>
          </div>

          <div v-if="hero.currentBet > 0 && gameActive" class="text-xs font-mono font-black text-black px-3 py-1 rounded-none bg-[#ffff00] border-2 border-black shadow-brutal-sm flex items-center gap-1">
            <span>本轮下注: {{ hero.currentBet }}</span>
            <CoinIcon customClass="w-3.5 h-3.5" />
          </div>
        </div>

        <!-- A. Waiting Stage Action Controls (Ready & Host Start) -->
        <div v-if="roomStore.currentRoom?.status === 'waiting'" class="flex items-center space-x-3 flex-wrap justify-center gap-y-2">
          <!-- 准备 / 取消准备 Button for current user -->
          <button
            @click="handleToggleReady"
            class="brutal-btn px-6 py-2.5 text-sm font-black flex items-center gap-2"
            :class="roomStore.isCurrentUserReady ? 'brutal-btn-white' : 'brutal-btn-lime'"
          >
            <CheckCircle v-if="!roomStore.isCurrentUserReady" class="w-4 h-4" />
            <XCircle v-else class="w-4 h-4" />
            <span>{{ roomStore.isCurrentUserReady ? '取消准备' : '准备就绪' }}</span>
          </button>

          <!-- 房主开始游戏 Button (Only host can see/click, enabled when all ready) -->
          <button
            v-if="roomStore.isHost"
            @click="handleStartGame"
            :disabled="!roomStore.canStartGame"
            class="brutal-btn px-7 py-2.5 text-sm font-black disabled:opacity-40 flex items-center gap-2"
            :class="roomStore.canStartGame ? 'brutal-btn-lime shadow-brutal' : 'brutal-btn-white cursor-not-allowed'"
          >
            <Play class="w-4 h-4 fill-black" />
            <span>{{ hostStartButtonText }}</span>
          </button>

          <!-- Non-host Waiting status -->
          <div
            v-else
            class="px-4 py-2 bg-white border-2 border-black font-mono text-xs font-bold shadow-brutal-sm text-black"
          >
            {{ roomStore.isCurrentUserReady ? '已准备完毕，请等待房主开启对局...' : '请先点击【准备就绪】' }}
          </div>
        </div>

        <!-- B. In-Game Hero Actions -->
        <div
          v-else-if="gameActive && !hero.folded"
          class="flex items-center space-x-2 sm:space-x-4 flex-wrap justify-center gap-y-2"
        >
          <!-- 弃牌 (Fold) -->
          <button
            @click="handleHeroFold"
            :disabled="currentTurnIdx !== 0"
            class="brutal-btn brutal-btn-white px-5 py-2.5 text-sm font-bold disabled:opacity-40 flex items-center gap-1.5"
          >
            <Flag class="w-4 h-4" />
            <span>弃牌 (Fold)</span>
          </button>

          <!-- 过牌 (Check) 或 跟注 (Call) -->
          <button
            v-if="heroCallAmount === 0"
            @click="handleHeroCheck"
            :disabled="currentTurnIdx !== 0"
            class="brutal-btn brutal-btn-cyan px-6 py-2.5 text-sm font-black disabled:opacity-40 flex items-center gap-1.5"
          >
            <Check class="w-4 h-4" />
            <span>过牌 (Check)</span>
          </button>
          <button
            v-else
            @click="handleHeroCall"
            :disabled="currentTurnIdx !== 0 || hero.chips < heroCallAmount"
            class="brutal-btn brutal-btn-lime px-6 py-2.5 text-sm font-black disabled:opacity-40 flex items-center gap-1.5"
          >
            <PlusCircle class="w-4 h-4" />
            <span>跟注 (Call: {{ heroCallAmount }})</span>
            <CoinIcon customClass="w-3.5 h-3.5" />
          </button>

          <!-- 加注 (Raise) -->
          <button
            @click="handleHeroRaise"
            :disabled="currentTurnIdx !== 0 || hero.chips < highestBet + bigBlind"
            class="brutal-btn brutal-btn-orange px-6 py-2.5 text-sm font-black disabled:opacity-40 flex items-center gap-1.5"
          >
            <ArrowUpCircle class="w-4 h-4" />
            <span>加注 (+{{ bigBlind }})</span>
            <CoinIcon customClass="w-3.5 h-3.5" />
          </button>

          <!-- 全下 (All-In) -->
          <button
            @click="handleHeroAllIn"
            :disabled="currentTurnIdx !== 0 || hero.chips <= 0"
            class="brutal-btn brutal-btn-pink px-5 py-2.5 text-sm font-black disabled:opacity-40 flex items-center gap-1.5"
          >
            <Zap class="w-4 h-4" />
            <span>全下 (All-In)</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Settlement Modal -->
    <Modal v-model="showResultModal" title="德扑牌局结算">
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
          {{ gameResult?.isWin ? '胜利赢得底池！' : '本局遗憾失利' }}
        </h2>
        <p class="text-black font-bold text-sm">
          最终胜者: <span class="bg-[#ffff00] px-2 py-0.5 border border-black text-black font-black">{{ gameResult?.winnerName }}</span>
        </p>
        <div class="px-4 py-3 rounded-none bg-[#f4f4f0] border-2 border-black text-sm font-mono font-bold flex items-center justify-between shadow-brutal-sm">
          <span class="text-black/70 uppercase">净盈亏筹码:</span>
          <span class="flex items-center gap-1 font-black" :class="gameResult?.netProfit && gameResult.netProfit >= 0 ? 'text-black bg-[#ccff00] px-2 py-0.5 border border-black' : 'text-white bg-[#ff006e] px-2 py-0.5 border border-black'">
            <span>{{ (gameResult?.netProfit ?? 0) >= 0 ? '+' : '' }}{{ gameResult?.netProfit }}</span>
            <CoinIcon customClass="w-4 h-4" />
          </span>
        </div>
      </div>
      <template #footer>
        <button
          @click="returnToPreparation"
          class="brutal-btn brutal-btn-lime w-full py-2.5 text-sm font-black flex items-center justify-center gap-1.5"
        >
          <RotateCw class="w-4 h-4" />
          <span>返回准备下一局</span>
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import confetti from 'canvas-confetti'
import {
  Crown,
  ArrowLeft,
  Play,
  RotateCw,
  Flag,
  Check,
  PlusCircle,
  ArrowUpCircle,
  Zap,
  Trophy,
  Frown,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  UserPlus,
  LogOut
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { useRoomStore } from '@/stores/room'
import { isSupabaseConfigured } from '@/lib/supabase'
import { sound } from '@/lib/sound'
import PlayingCard from '@/components/game/PlayingCard.vue'
import PlayerSeat from '@/components/game/PlayerSeat.vue'
import Modal from '@/components/common/Modal.vue'
import CoinIcon from '@/components/common/CoinIcon.vue'
import { createTexasDeck, evaluateTexas7Cards, getAITexasAction } from '../engine'
import type { TexasPlayer, TexasBetRound, TexasEvaluation } from '../types'
import type { Card } from '@/types/game'

const router = useRouter()
const authStore = useAuthStore()
const walletStore = useWalletStore()
const roomStore = useRoomStore()

const smallBlind = computed(() => Math.floor((roomStore.currentRoom?.min_bet || 50) / 2) || 25)
const bigBlind = computed(() => roomStore.currentRoom?.min_bet || 50)
const pot = ref(0)
const currentRound = ref<TexasBetRound>('preflop')
const gameActive = ref(false)
const currentTurnIdx = ref(0) // 0 is Hero, 1..N are Opponents
const showResultModal = ref(false)
const gameResult = ref<{ isWin: boolean; winnerName: string; netProfit: number } | null>(null)

let deck: Card[] = []
const communityCards = ref<Card[]>([])

// Hero (Local User)
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

// Dynamic Opponents from roomPlayers (No hardcoded bots!)
interface InGameTexasOpponent extends TexasPlayer {
  readyStatus: 'ready' | 'waiting'
  isHost: boolean
}
const opponents = ref<InGameTexasOpponent[]>([])

// Synchronize opponents with roomPlayers
const opponentPlayers = computed<InGameTexasOpponent[]>(() => {
  if (!roomStore.currentRoom) return []
  const otherRoomPlayers = roomStore.roomPlayers.filter(
    p => p.user_id !== authStore.profile?.id
  )

  return otherRoomPlayers.map(p => {
    const existing = opponents.value.find(op => op.id === p.user_id)
    return {
      id: p.user_id,
      nickname: p.profile?.nickname || `玩家_${p.seat + 1}`,
      avatarUrl: p.profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.user_id}`,
      chips: existing ? existing.chips : p.chips,
      holeCards: existing ? existing.holeCards : [],
      folded: existing ? existing.folded : false,
      isAllIn: existing ? existing.isAllIn : false,
      currentBet: existing ? existing.currentBet : 0,
      isAI: p.user_id.startsWith('test_player_'),
      isHost: p.user_id === roomStore.currentRoom?.host_id,
      readyStatus: p.status === 'ready' ? 'ready' : 'waiting'
    }
  })
})

const maxSeats = computed(() => roomStore.currentRoom?.max_players || 6)
const emptySeatsCount = computed(() => {
  return Math.max(0, maxSeats.value - roomStore.roomPlayers.length)
})

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
  const all = [hero.value, ...opponents.value]
  return Math.max(0, ...all.map(p => p.currentBet))
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

const waitingStatusText = computed(() => {
  const total = roomStore.roomPlayers.length
  const ready = roomStore.readyCount
  if (total < 2) {
    return `当前在桌 1 人，至少需 2 名玩家就绪后由房主开局`
  }
  if (ready < total) {
    return `全员准备中 (${ready}/${total} 已准备)`
  }
  return `全员均已准备完毕，等待房主开启对局！`
})

const hostStartButtonText = computed(() => {
  const total = roomStore.roomPlayers.length
  const ready = roomStore.readyCount
  if (total < 2) {
    return '等待其他玩家加入 (至少2人)'
  }
  if (ready < total) {
    return `等待全员准备 (${ready}/${total})`
  }
  return '开始游戏 (全员已就绪)'
})

onMounted(async () => {
  if (authStore.profile) {
    hero.value.id = authStore.profile.id
    hero.value.nickname = authStore.profile.nickname
    hero.value.avatarUrl = authStore.profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${authStore.profile.id}`
    hero.value.chips = authStore.profile.chips
  }

  // Ensure room exists; if direct entry, create default room with 0 bots
  if (!roomStore.currentRoom) {
    await roomStore.createRoom(
      'texas',
      `${authStore.profile?.nickname || '玩家'}的德州扑克桌`,
      50,
      6
    )
  }
})

// Toggle player ready status
async function handleToggleReady() {
  await roomStore.toggleReady()
  sound.playClick()
}

// Toggle simulated test opponent ready
function handleToggleOpponentReady(userId: string) {
  roomStore.toggleReady(userId)
}

// Leave room
async function handleLeaveRoom() {
  await roomStore.leaveRoom()
  router.push('/')
}

// Host starts game
async function handleStartGame() {
  if (!roomStore.canStartGame) return
  const ok = await roomStore.startGame()
  if (!ok) return

  startNewRound()
}

// Start deal & betting rounds
function startNewRound() {
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

  // 同步 Opponents
  opponents.value = opponentPlayers.value.map(opp => {
    return {
      ...opp,
      holeCards: [deck.pop()!, deck.pop()!],
      folded: false,
      isAllIn: false,
      currentBet: 0
    }
  })

  // 盲注投入：小盲 (Hero) + 大盲 (Opponent 1)
  const sbAmt = Math.min(smallBlind.value, hero.value.chips)
  hero.value.chips -= sbAmt
  hero.value.currentBet = sbAmt
  pot.value += sbAmt

  if (opponents.value.length > 0) {
    const bbOpp = opponents.value[0]
    const bbAmt = Math.min(bigBlind.value, bbOpp.chips)
    bbOpp.chips -= bbAmt
    bbOpp.currentBet = bbAmt
    pot.value += bbAmt
  }

  sound.playDealCard()
  gameActive.value = true
  currentTurnIdx.value = 0
}

function returnToPreparation() {
  showResultModal.value = false
  gameActive.value = false
  currentRound.value = 'preflop'
  communityCards.value = []
  hero.value.holeCards = []
  hero.value.folded = false
  hero.value.isAllIn = false
  hero.value.currentBet = 0
  opponents.value = []
  roomStore.resetRoomToWaiting()
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

  currentTurnIdx.value = (currentTurnIdx.value + 1) % (opponents.value.length + 1)

  if (currentTurnIdx.value === 0 && hero.value.folded) {
    advanceTurn()
    return
  }

  if (currentTurnIdx.value > 0) {
    const opp = opponents.value[currentTurnIdx.value - 1]
    if (opp.folded || opp.isAllIn) {
      advanceTurn()
      return
    }

    if (opp.isAI || opp.id.startsWith('test_player_')) {
      setTimeout(() => {
        runOpponentTurn(opp)
      }, 600)
    }
  }
}

function runOpponentTurn(opp: InGameTexasOpponent) {
  if (!gameActive.value || opp.folded) return

  const callAmt = Math.max(0, highestBet.value - opp.currentBet)
  const action = getAITexasAction(opp.holeCards, communityCards.value, callAmt, opp.chips)

  if (action === 'fold') {
    opp.folded = true
  } else if (action === 'raise' && opp.chips >= callAmt + bigBlind.value) {
    const raiseCost = callAmt + bigBlind.value
    opp.chips -= raiseCost
    opp.currentBet += raiseCost
    pot.value += raiseCost
    sound.playChip()
  } else if (callAmt > 0) {
    const actualCall = Math.min(callAmt, opp.chips)
    opp.chips -= actualCall
    opp.currentBet += actualCall
    pot.value += actualCall
    sound.playChip()
  } else {
    sound.playClick()
  }

  advanceTurn()
}

// 检查下注轮次推进或是否只剩 1 人
function checkRoundAdvancement(): boolean {
  const activePlayers = [hero.value, ...opponents.value].filter(p => !p.folded)

  if (activePlayers.length === 1) {
    showdownAndSettle(activePlayers[0])
    return true
  }

  // 检查本轮各玩家下注是否持平
  const allBetsEqual = activePlayers.every(p => p.currentBet === highestBet.value || p.isAllIn)

  if (allBetsEqual && currentTurnIdx.value === opponents.value.length) {
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
    const active = [hero.value, ...opponents.value].filter(p => !p.folded)
    active.sort((a, b) => {
      const evA = evaluateTexas7Cards([...a.holeCards, ...communityCards.value])
      const evB = evaluateTexas7Cards([...b.holeCards, ...communityCards.value])
      return evB.score - evA.score
    })
    winner = active[0]
  }

  const isHeroWin = winner?.id === hero.value.id
  let netProfit = 0

  if (isHeroWin) {
    netProfit = pot.value - hero.value.currentBet
    hero.value.chips += pot.value
    sound.playWin()
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
  } else if (winner) {
    netProfit = -hero.value.currentBet
    winner.chips += pot.value
    sound.playLose()
  }

  gameResult.value = {
    isWin: isHeroWin,
    winnerName: winner?.nickname || '无人获胜',
    netProfit
  }
  showResultModal.value = true

  await walletStore.recordGameSettlement(
    'texas',
    hero.value.currentBet,
    isHeroWin ? pot.value : 0,
    {
      communityCards: communityCards.value,
      heroHoleCards: hero.value.holeCards,
      heroHand: heroEvaluation.value?.rankName,
      winner: winner?.nickname
    }
  )
}
</script>
