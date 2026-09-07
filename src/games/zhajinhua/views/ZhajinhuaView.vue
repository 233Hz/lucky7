<template>
  <div class="max-w-6xl mx-auto px-4 py-6">
    <!-- Header Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-4 border-[#1a1a1a]">
      <div class="flex items-center space-x-3">
        <router-link
          to="/"
          @click="handleLeaveRoom"
          class="comic-btn-white px-3 py-1.5 text-xs inline-flex items-center gap-1.5"
          :class="isLeaving ? 'opacity-50 pointer-events-none' : ''"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>返回大厅</span>
        </router-link>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-black text-[#1a1a1a] flex items-center gap-2 tracking-tight">
              <Layers class="w-6 h-6 text-[#1a1a1a]" />
              <span>{{ roomStore.currentRoom?.name || '炸金花对战桌' }}</span>
            </h1>
            <span
              class="comic-badge font-black"
              :class="roomStore.currentRoom?.status === 'playing' ? 'bg-[#ef4444] text-white' : 'bg-[#22c55e] text-[#1a1a1a]'"
            >
              {{ roomStore.currentRoom?.status === 'playing' ? '对局进行中' : '房间准备中' }}
            </span>
            <span v-if="roomStore.isHost" class="comic-badge bg-[#facc15] text-[#1a1a1a]">
              您是房主
            </span>
          </div>
          <p class="text-xs font-mono font-bold text-[#1a1a1a]/70 flex items-center gap-1 mt-0.5">
            <span>底注: {{ minBet }}</span>
            <CoinIcon customClass="w-3.5 h-3.5" />
            <span class="ml-1 text-[#1a1a1a]">| 闷牌 1 倍，看牌 2 倍</span>
            <span class="ml-2 bg-[#1a1a1a] text-[#facc15] px-2 py-0.5 rounded-md text-[11px] font-black border border-[#1a1a1a]">
              在桌人数: {{ roomStore.roomPlayers.length }}/{{ roomStore.currentRoom?.max_players || 6 }}
            </span>
          </p>
        </div>
      </div>

      <!-- Quick Actions / Room Controls -->
      <div class="flex items-center space-x-2">
        <button
          @click="isChatOpen = !isChatOpen"
          class="brutal-btn px-3 py-2 text-xs font-black flex items-center gap-1.5 transition-all"
          :class="isChatOpen ? 'brutal-btn-yellow shadow-brutal-sm' : 'brutal-btn-white'"
        >
          <MessageSquare class="w-3.5 h-3.5" />
          <span>{{ isChatOpen ? '收起聊天' : '房间聊天' }}</span>
        </button>

        <button
          v-if="!isSupabaseConfigured() && roomStore.currentRoom?.status === 'waiting' && roomStore.roomPlayers.length < (roomStore.currentRoom?.max_players || 6)"
          v-prevent-reclick
          @click="handleAddTestPlayer"
          class="comic-btn-blue px-3 py-2 text-xs font-bold flex items-center gap-1"
          title="辅助本地测试：快捷添加测试对手"
        >
          <UserPlus class="w-3.5 h-3.5" />
          <span>+ 邀请测试玩家</span>
        </button>

        <button
          v-prevent-reclick
          :disabled="isLeaving"
          @click="handleLeaveRoom"
          class="comic-btn-white px-3.5 py-2 text-xs font-bold flex items-center gap-1 hover:bg-[#ef4444] hover:text-white disabled:opacity-50"
        >
          <LogOut class="w-3.5 h-3.5" />
          <span>{{ isLeaving ? '退出中...' : '退出房间' }}</span>
        </button>
      </div>
    </div>

    <!-- Main Content Grid (Table + In-Room Chat) -->
    <div class="grid grid-cols-1 gap-6 items-start" :class="isChatOpen ? 'xl:grid-cols-12' : ''">
      <!-- Left: Table Surface -->
      <div :class="isChatOpen ? 'xl:col-span-8' : 'w-full'">
        <div class="relative rounded-none bg-white border-4 border-black p-6 min-h-[580px] flex flex-col justify-between shadow-brutal-xl overflow-hidden">
      <!-- Halftone Dots Texture -->
      <div class="absolute inset-0 bg-[radial-gradient(#1a1a1a_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-10 pointer-events-none"></div>

      <!-- 1. Top Opponents Area (Real players in room, zero auto-bots) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-items-center relative z-20 pt-2 min-h-[140px]">
        <!-- Seated Opponents -->
        <div
          v-for="(opp, idx) in opponentPlayers"
          :key="opp.id"
          class="relative flex flex-col items-center"
        >
          <PlayerSeat
            :seat="{
              id: opp.id,
              nickname: opp.nickname,
              avatarUrl: opp.avatarUrl,
              chips: opp.chips,
              currentBet: opp.currentBet,
              status: opp.folded ? 'folded' : 'active',
              cards: opp.cards,
              handName: gameStatus === 'ended' && !opp.folded && opp.cards.length === 3 ? evaluateZhajinhua(opp.cards).typeName : (opp.seen ? '已看牌' : '')
            }"
            :isCurrentTurn="currentTurnIdx === idx + 1 && gameStatus === 'playing'"
            :showCardsFaceDown="gameStatus !== 'ended'"
            :isHost="opp.isHost"
            :readyStatus="gameStatus === 'waiting' ? opp.readyStatus : undefined"
          />

          <!-- Controls for opponents: Simulated toggle ready for test players, and Kick Player for Host -->
          <div
            v-if="gameStatus === 'waiting'"
            class="mt-4 flex items-center gap-1 z-30"
          >
            <button
              v-if="opp.id.startsWith('test_player_')"
              v-prevent-reclick
              @click="handleToggleOpponentReady(opp.id)"
              class="px-2 py-0.5 text-[10px] font-black border-2 border-[#1a1a1a] rounded-md bg-[#fffef0] hover:bg-[#facc15]"
            >
              {{ opp.readyStatus === 'ready' ? '设为未准备' : '模拟准备' }}
            </button>
            <button
              v-if="roomStore.isHost"
              v-prevent-reclick
              @click="handleKickPlayer(opp.id, opp.nickname)"
              :disabled="kickingUserId === opp.id"
              class="px-2 py-0.5 text-[10px] font-black border-2 border-[#1a1a1a] rounded-md bg-[#ef4444] text-white hover:bg-[#dc2626] transition-colors flex items-center gap-1 shadow-[1px_1px_0px_0px_#1a1a1a] disabled:opacity-50"
              title="将该玩家移出房间"
            >
              <UserX class="w-3 h-3" />
              <span>{{ kickingUserId === opp.id ? '踢出中...' : '踢出' }}</span>
            </button>
          </div>
        </div>

        <!-- Empty Seat Placeholders -->
        <div
          v-for="idx in emptySeatsCount"
          :key="'empty_' + idx"
          class="w-32 sm:w-36 h-32 rounded-lg border-2 border-dashed border-[#1a1a1a]/40 flex flex-col items-center justify-center p-3 text-center bg-[#fffef0]/60"
        >
          <div class="w-8 h-8 rounded-md border border-[#1a1a1a]/30 bg-[#1a1a1a]/5 flex items-center justify-center mb-1 text-[#1a1a1a]/40">
            <Users class="w-4 h-4" />
          </div>
          <span class="text-xs font-mono font-bold text-[#1a1a1a]/50">等待玩家入座</span>
          <span class="text-[10px] font-mono text-[#1a1a1a]/30 mt-0.5">空闲座位</span>
        </div>
      </div>

      <!-- 2. Middle Table Area: Pot & Waiting Banner -->
      <div class="my-6 flex flex-col items-center justify-center relative z-10">
        <!-- In-game Pot Display -->
        <div v-if="gameStatus === 'playing'" class="px-6 py-3 rounded-xl bg-[#facc15] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex items-center space-x-4">
          <div class="w-10 h-10 rounded-lg bg-[#1a1a1a] text-[#facc15] border-2 border-[#1a1a1a] flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            <CoinIcon customClass="w-6 h-6" />
          </div>
          <div>
            <div class="text-[10px] text-[#1a1a1a] font-mono font-black uppercase tracking-widest">底池彩金 (POT)</div>
            <div class="text-2xl font-black font-mono text-[#1a1a1a]">{{ formattedPot }}</div>
          </div>
        </div>

        <div v-if="gameStatus === 'playing'" class="mt-2.5 text-xs font-mono text-[#1a1a1a] font-black bg-[#fffef0] px-4 py-1.5 rounded-md border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] flex items-center gap-1.5">
          <span>第 {{ currentRound }} 轮</span>
          <span>|</span>
          <span>当前单注: {{ currentBetUnit }}</span>
          <CoinIcon customClass="w-3.5 h-3.5" />
        </div>

        <!-- Waiting Stage Center Banner -->
        <div v-if="gameStatus === 'waiting'" class="px-6 py-4 rounded-xl bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] text-center max-w-md">
          <div class="text-xs font-mono font-black text-[#1a1a1a] uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
            <Clock class="w-4 h-4 text-[#1a1a1a]" />
            <span>房间等待准备就绪</span>
          </div>
          <div class="text-sm font-black text-[#1a1a1a]">
            {{ waitingStatusText }}
          </div>
          <div class="text-[11px] font-mono font-bold text-[#1a1a1a]/70 mt-1">
            进入房间后须先准备；所有玩家准备完毕后，房主即可开启对局
          </div>
        </div>
      </div>

      <!-- 3. Bottom Hero Player Area -->
      <div class="flex flex-col items-center relative z-20 pb-2">
        <!-- Hero Cards and Hand type -->
        <div class="flex flex-col items-center mb-3">
          <div class="flex items-center space-x-3 sm:space-x-4 mb-2">
            <template v-if="hero.cards.length > 0 && gameStatus !== 'waiting'">
              <PlayingCard
                v-for="(card, i) in hero.cards"
                :key="i"
                :card="card"
                :faceDown="!hero.seen && gameStatus === 'playing'"
                size="md"
              />
            </template>
            <div v-else class="w-20 h-28 rounded-lg border-2 border-dashed border-[#1a1a1a] bg-[#fffef0] flex items-center justify-center text-[#1a1a1a]/50 text-xs font-mono font-bold text-center px-2">
              {{ gameStatus === 'waiting' ? (roomStore.isCurrentUserReady ? '已准备就绪' : '等待准备') : '等待发牌' }}
            </div>
          </div>

          <!-- Hero Hand Evaluation text -->
          <div v-if="hero.seen && hero.cards.length === 3 && gameStatus !== 'waiting'" class="px-3.5 py-1 rounded-md bg-[#1a1a1a] text-[#facc15] border-2 border-[#1a1a1a] font-black font-mono text-xs shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            手牌: {{ heroHandEvaluation?.typeName }}
          </div>
        </div>

        <!-- Hero Seat summary -->
        <div class="flex items-center space-x-4 mb-4">
          <div class="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-lg bg-[#fffef0] border-3 border-[#1a1a1a] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] relative">
            <img :src="hero.avatarUrl" class="w-6 h-6 rounded-md border-2 border-[#1a1a1a]" />
            <span class="text-sm font-black text-[#1a1a1a]">{{ hero.nickname }}</span>
            <div class="flex items-center space-x-1 ml-2 text-[#1a1a1a] font-mono font-black text-sm">
              <CoinIcon customClass="w-4 h-4" />
              <span>{{ formattedHeroChips }}</span>
            </div>
            <span
              v-if="gameStatus === 'waiting'"
              class="ml-2 px-2 py-0.5 text-[10px] font-black border-2 border-[#1a1a1a] rounded-md uppercase"
              :class="roomStore.isCurrentUserReady ? 'bg-[#22c55e] text-[#1a1a1a]' : 'bg-[#ef4444] text-white'"
            >
              {{ roomStore.isCurrentUserReady ? '已准备' : '未准备' }}
            </span>
          </div>

          <div v-if="hero.currentBet > 0 && gameStatus === 'playing'" class="text-xs font-mono font-black text-[#1a1a1a] px-3 py-1 rounded-md bg-[#facc15] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] flex items-center gap-1">
            <span>本局下注: {{ hero.currentBet }}</span>
            <CoinIcon customClass="w-3.5 h-3.5" />
          </div>
        </div>

        <!-- A. Waiting Stage Action Controls (Ready & Start) -->
        <div v-if="gameStatus === 'waiting'" class="flex items-center space-x-3 flex-wrap justify-center gap-y-2">
          <!-- 准备 / 取消准备 Button for current user -->
          <button
            v-prevent-reclick
            :disabled="isTogglingReady"
            @click="handleToggleReady"
            class="comic-btn px-6 py-2.5 text-sm font-black flex items-center gap-2 disabled:opacity-50"
            :class="roomStore.isCurrentUserReady ? 'comic-btn-white' : 'comic-btn-green'"
          >
            <CheckCircle v-if="!roomStore.isCurrentUserReady" class="w-4 h-4" />
            <XCircle v-else class="w-4 h-4" />
            <span>{{ isTogglingReady ? '更新中...' : (roomStore.isCurrentUserReady ? '取消准备' : '准备就绪') }}</span>
          </button>

          <!-- 房主开始游戏 Button (Only host can see/click, enabled when all ready) -->
          <button
            v-if="roomStore.isHost"
            v-prevent-reclick
            @click="handleStartGame"
            :disabled="!roomStore.canStartGame || isStarting"
            class="comic-btn px-7 py-2.5 text-sm font-black disabled:opacity-40 flex items-center gap-2"
            :class="roomStore.canStartGame && !isStarting ? 'comic-btn-green shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]' : 'comic-btn-white cursor-not-allowed'"
          >
            <Play class="w-4 h-4 fill-[#1a1a1a]" />
            <span>{{ isStarting ? '正在开局...' : hostStartButtonText }}</span>
          </button>

          <!-- Non-host Waiting status -->
          <div
            v-else
            class="px-4 py-2 bg-[#fffef0] border-2 border-[#1a1a1a] rounded-md font-mono text-xs font-bold shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] text-[#1a1a1a]"
          >
            {{ roomStore.isCurrentUserReady ? '已准备完毕，请等待房主开启对局...' : '请先点击【准备就绪】' }}
          </div>
        </div>

        <!-- B. In-Game Action Controls (Hero Turn) -->
        <div
          v-else-if="gameStatus === 'playing' && !hero.folded"
          class="flex items-center space-x-2 sm:space-x-4 flex-wrap justify-center gap-y-2"
        >
          <!-- 看牌 -->
          <button
            v-if="!hero.seen"
            v-prevent-reclick
            :disabled="isActionBusy"
            @click="handleHeroCheck"
            class="comic-btn-blue px-5 py-2.5 text-sm font-black flex items-center gap-1.5 disabled:opacity-50"
          >
            <Eye class="w-4 h-4" />
            <span>看牌</span>
          </button>

          <!-- 弃牌 -->
          <button
            v-prevent-reclick
            :disabled="isActionBusy"
            @click="handleHeroFold"
            class="comic-btn-white px-5 py-2.5 text-sm font-bold flex items-center gap-1.5 disabled:opacity-50"
          >
            <Flag class="w-4 h-4" />
            <span>弃牌</span>
          </button>

          <!-- 跟注 -->
          <button
            v-prevent-reclick
            @click="handleHeroCall"
            :disabled="currentTurnIdx !== 0 || hero.chips < heroBetCost || isActionBusy"
            class="comic-btn-green px-6 py-2.5 text-sm font-black disabled:opacity-40 flex items-center gap-1.5"
          >
            <PlusCircle class="w-4 h-4" />
            <span>跟注 ({{ heroBetCost }})</span>
            <CoinIcon customClass="w-3.5 h-3.5" />
          </button>

          <!-- 加注 -->
          <button
            v-prevent-reclick
            @click="handleHeroRaise"
            :disabled="currentTurnIdx !== 0 || hero.chips < heroBetCost * 2 || isActionBusy"
            class="comic-btn-yellow px-6 py-2.5 text-sm font-black disabled:opacity-40 flex items-center gap-1.5"
          >
            <ArrowUpCircle class="w-4 h-4" />
            <span>加注 ({{ heroBetCost * 2 }})</span>
            <CoinIcon customClass="w-3.5 h-3.5" />
          </button>

          <!-- 比牌 -->
          <button
            v-if="currentRound >= 2 && activeOpponentCount > 0"
            v-prevent-reclick
            @click="handleHeroCompare"
            :disabled="currentTurnIdx !== 0 || hero.chips < heroBetCost * 2 || isActionBusy"
            class="comic-btn-red px-6 py-2.5 text-sm font-black disabled:opacity-40 flex items-center gap-1.5"
          >
            <Swords class="w-4 h-4" />
            <span>比牌 (PK)</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Right: In-Room Chat Channel -->
  <div v-if="isChatOpen" class="xl:col-span-4 h-[580px] sticky top-20">
    <ChatPanel
      :channel="roomChannel"
      :title="`${roomStore.currentRoom?.name || '对战'} · 房间聊天`"
      subtitle="在桌玩家私密畅聊"
      channelType="room"
      :isHost="roomStore.isHost"
      :allowClose="true"
      @close="isChatOpen = false"
    />
  </div>
</div>

    <!-- Settlement Result Modal -->
    <Modal v-model="showResultModal" title="对局结算">
      <div class="text-center py-4 space-y-4">
        <div class="flex justify-center">
          <div
            class="w-16 h-16 rounded-xl border-3 border-[#1a1a1a] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            :class="gameResult?.isWin ? 'bg-[#22c55e] text-[#1a1a1a]' : 'bg-[#ef4444] text-white'"
          >
            <Trophy v-if="gameResult?.isWin" class="w-9 h-9" />
            <Frown v-else class="w-9 h-9" />
          </div>
        </div>
        <h2 class="text-2xl font-black text-[#1a1a1a]">
          {{ gameResult?.isWin ? '恭喜获胜！' : '本局遗憾失利' }}
        </h2>
        <p class="text-[#1a1a1a] font-bold text-sm">
          获胜者: <span class="bg-[#facc15] px-2 py-0.5 border-2 border-[#1a1a1a] rounded-md text-[#1a1a1a] font-black">{{ gameResult?.winnerName }}</span>
        </p>
        <div class="px-4 py-3 rounded-lg bg-[#fffef0] border-2 border-[#1a1a1a] text-sm font-mono font-bold flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
          <span class="text-[#1a1a1a]/70 uppercase">盈亏筹码:</span>
          <span class="flex items-center gap-1 font-black" :class="gameResult?.netProfit && gameResult.netProfit >= 0 ? 'text-[#1a1a1a] bg-[#22c55e] px-2 py-0.5 border border-[#1a1a1a] rounded-md' : 'text-white bg-[#ef4444] px-2 py-0.5 border border-[#1a1a1a] rounded-md'">
            <span>{{ (gameResult?.netProfit ?? 0) >= 0 ? '+' : '' }}{{ gameResult?.netProfit }}</span>
            <CoinIcon customClass="w-4 h-4" />
          </span>
        </div>
      </div>
      <template #footer>
        <button
          @click="returnToPreparation"
          class="comic-btn-green w-full py-2.5 text-sm font-black flex items-center justify-center gap-1.5"
        >
          <RotateCw class="w-4 h-4" />
          <span>返回准备下一局</span>
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
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
  Frown,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  UserPlus,
  UserX,
  LogOut,
  MessageSquare
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { useRoomStore } from '@/stores/room'
import { useChatStore } from '@/stores/chat'
import { isSupabaseConfigured } from '@/lib/supabase'
import { sound } from '@/lib/sound'
import PlayingCard from '@/components/game/PlayingCard.vue'
import PlayerSeat from '@/components/game/PlayerSeat.vue'
import CoinIcon from '@/components/common/CoinIcon.vue'
import Modal from '@/components/common/Modal.vue'
import ChatPanel from '@/components/chat/ChatPanel.vue'
import {
  createDeck,
  shuffleDeck,
  evaluateZhajinhua,
  compareZhajinhuaHands,
  getAIZhajinhuaAction
} from '../engine'
import type { ZhajinhuaPlayer, ZhajinhuaEvaluation } from '../types'

const router = useRouter()
const authStore = useAuthStore()
const walletStore = useWalletStore()
const roomStore = useRoomStore()
const chatStore = useChatStore()

const isChatOpen = ref<boolean>(true)
const roomChannel = computed(() => 'room_' + (roomStore.currentRoom?.id || 'default'))

const minBet = computed(() => roomStore.currentRoom?.min_bet || 50)
const pot = ref<number>(0)
const currentRound = ref<number>(1)
const currentBetUnit = ref<number>(50)
const gameStatus = ref<'waiting' | 'playing' | 'ended'>('waiting')
const currentTurnIdx = ref<number>(0) // 0 is Hero, 1..N are Opponents
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

// Dynamic Opponents from roomPlayers (No hardcoded bots!)
interface InGameOpponent extends ZhajinhuaPlayer {
  readyStatus: 'ready' | 'waiting'
  isHost: boolean
}
const opponents = ref<InGameOpponent[]>([])

// Synchronize opponents with roomPlayers
const opponentPlayers = computed<InGameOpponent[]>(() => {
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
      cards: existing ? existing.cards : [],
      seen: existing ? existing.seen : false,
      folded: existing ? existing.folded : false,
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

const activeOpponentCount = computed(() => opponents.value.filter(p => !p.folded).length)

const heroBetCost = computed(() => {
  return hero.value.seen ? currentBetUnit.value * 2 : currentBetUnit.value
})

const heroHandEvaluation = computed<ZhajinhuaEvaluation | null>(() => {
  if (hero.value.cards.length === 3) {
    return evaluateZhajinhua(hero.value.cards)
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

const isStarting = ref(false)
const isTogglingReady = ref(false)
const isLeaving = ref(false)
const isActionBusy = ref(false)
const kickingUserId = ref<string | null>(null)

// 关键 Bug 修复：监听房间对局状态，确保房主开局后所有玩家同步进入对局界面
watch(
  () => roomStore.currentRoom?.status,
  (newStatus) => {
    if (newStatus === 'playing' && gameStatus.value === 'waiting') {
      startNewRound()
    } else if (newStatus === 'waiting' && gameStatus.value !== 'waiting') {
      returnToPreparation()
    }
  },
  { immediate: true }
)

function onWindowBeforeUnload() {
  roomStore.leaveRoom()
}

onMounted(async () => {
  window.addEventListener('beforeunload', onWindowBeforeUnload)

  if (authStore.profile) {
    hero.value.id = authStore.profile.id
    hero.value.nickname = authStore.profile.nickname
    hero.value.avatarUrl = authStore.profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${authStore.profile.id}`
    hero.value.chips = authStore.profile.chips
  }

  // Ensure current room exists; if entered directly, create a default room with 0 bots
  if (!roomStore.currentRoom) {
    await roomStore.createRoom(
      'zhajinhua',
      `${authStore.profile?.nickname || '玩家'}的炸金花桌`,
      50,
      6
    )
  }

  // 初始化本房间专属聊天频道
  chatStore.initChannel(roomChannel.value)
  chatStore.sendSystemAnnouncement(
    roomChannel.value,
    `【${authStore.profile?.nickname || '玩家'}】进入了房间。`
  )
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', onWindowBeforeUnload)
  roomStore.leaveRoom()
})

// Toggle current player ready
async function handleToggleReady() {
  if (isTogglingReady.value) return
  isTogglingReady.value = true
  try {
    await roomStore.toggleReady()
    sound.playClick()
    chatStore.sendSystemAnnouncement(
      roomChannel.value,
      `【${authStore.profile?.nickname || '玩家'}】${roomStore.isCurrentUserReady ? '已准备就绪！' : '取消了准备。'}`
    )
  } finally {
    isTogglingReady.value = false
  }
}

// 辅助本地测试：添加测试玩家
function handleAddTestPlayer() {
  roomStore.addTestPlayer()
  const lastPlayer = roomStore.roomPlayers[roomStore.roomPlayers.length - 1]
  chatStore.sendSystemAnnouncement(
    roomChannel.value,
    `【${lastPlayer?.profile?.nickname || '新玩家'}】加入入座。`
  )
}

// 房主踢出玩家
async function handleKickPlayer(userId: string, nickname: string) {
  if (!roomStore.isHost || kickingUserId.value) return
  if (!confirm(`确定要将玩家【${nickname}】移出房间吗？`)) return

  kickingUserId.value = userId
  try {
    const ok = await roomStore.kickPlayer(userId)
    if (ok) {
      chatStore.sendSystemAnnouncement(
        roomChannel.value,
        `【房主】已将玩家【${nickname}】移出房间。`
      )
    }
  } finally {
    kickingUserId.value = null
  }
}

// Toggle simulated opponent ready (for convenient 1-tab local testing)
function handleToggleOpponentReady(userId: string) {
  roomStore.toggleReady(userId)
  const opp = roomStore.roomPlayers.find(p => p.user_id === userId)
  if (opp) {
    chatStore.sendSystemAnnouncement(
      roomChannel.value,
      `【${opp.profile?.nickname || '玩家'}】${opp.status === 'ready' ? '已准备就绪！' : '取消了准备。'}`
    )
  }
}

// Leave room and return to home lobby
async function handleLeaveRoom() {
  if (isLeaving.value) return
  isLeaving.value = true
  try {
    chatStore.sendSystemAnnouncement(
      roomChannel.value,
      `【${authStore.profile?.nickname || '玩家'}】离开了房间。`
    )
    await roomStore.leaveRoom()
    router.push('/')
  } finally {
    isLeaving.value = false
  }
}

// Host starts game: all seated players must be ready and >= 2 players
async function handleStartGame() {
  if (!roomStore.canStartGame || isStarting.value) return
  isStarting.value = true
  try {
    const ok = await roomStore.startGame()
    if (!ok) return

    chatStore.sendSystemAnnouncement(
      roomChannel.value,
      `房主开启了对局，盲注与底池已扣除，正在发牌中...`
    )
    startNewRound()
  } finally {
    isStarting.value = false
  }
}

// Start dealing and playing round
function startNewRound() {
  showResultModal.value = false
  if (authStore.profile && authStore.profile.chips < minBet.value) {
    alert('筹码不足，请先签到领取筹码！')
    return
  }

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

  // 重置对局在桌 Opponents
  opponents.value = opponentPlayers.value.map(opp => {
    return {
      ...opp,
      cards: [deck.pop()!, deck.pop()!, deck.pop()!],
      seen: false,
      folded: false,
      currentBet: minBet.value,
      chips: opp.chips - minBet.value
    }
  })

  opponents.value.forEach(() => {
    pot.value += minBet.value
  })

  sound.playDealCard()
  gameStatus.value = 'playing'
  currentTurnIdx.value = 0 // Hero takes first turn
}

// Return to preparation stage after a round ends
function returnToPreparation() {
  showResultModal.value = false
  gameStatus.value = 'waiting'
  hero.value.cards = []
  hero.value.seen = false
  hero.value.folded = false
  hero.value.currentBet = 0
  opponents.value = []
  if (roomStore.currentRoom?.status === 'playing') {
    roomStore.resetRoomToWaiting()
  }
}

// Hero 看牌
function handleHeroCheck() {
  if (isActionBusy.value || currentTurnIdx.value !== 0) return
  isActionBusy.value = true
  hero.value.seen = true
  sound.playClick()
  setTimeout(() => { isActionBusy.value = false }, 300)
}

// Hero 弃牌
function handleHeroFold() {
  if (isActionBusy.value || currentTurnIdx.value !== 0) return
  isActionBusy.value = true
  hero.value.folded = true
  sound.playLose()
  checkRoundFinish()
  if (gameStatus.value === 'playing') {
    nextTurn()
  }
  setTimeout(() => { isActionBusy.value = false }, 300)
}

// Hero 跟注
function handleHeroCall() {
  if (isActionBusy.value || currentTurnIdx.value !== 0 || hero.value.chips < heroBetCost.value) return
  isActionBusy.value = true
  const cost = heroBetCost.value
  hero.value.chips -= cost
  hero.value.currentBet += cost
  pot.value += cost
  sound.playChip()
  nextTurn()
  setTimeout(() => { isActionBusy.value = false }, 300)
}

// Hero 加注
function handleHeroRaise() {
  if (isActionBusy.value || currentTurnIdx.value !== 0 || hero.value.chips < heroBetCost.value * 2) return
  isActionBusy.value = true
  currentBetUnit.value += minBet.value
  const cost = heroBetCost.value
  hero.value.chips -= cost
  hero.value.currentBet += cost
  pot.value += cost
  sound.playChip()
  nextTurn()
  setTimeout(() => { isActionBusy.value = false }, 300)
}

// Hero 比牌
function handleHeroCompare() {
  if (isActionBusy.value || currentTurnIdx.value !== 0 || hero.value.chips < heroBetCost.value * 2) return
  isActionBusy.value = true
  const activeOpponents = opponents.value.filter(a => !a.folded)
  if (activeOpponents.length === 0) {
    isActionBusy.value = false
    return
  }

  const cost = heroBetCost.value * 2
  hero.value.chips -= cost
  hero.value.currentBet += cost
  pot.value += cost
  sound.playChip()

  // 挑选第一个在局对手比牌
  const targetOpp = activeOpponents[0]
  const cmp = compareZhajinhuaHands(hero.value.cards, targetOpp.cards)

  if (cmp >= 0) {
    targetOpp.folded = true
  } else {
    hero.value.folded = true
    sound.playLose()
  }

  checkRoundFinish()
  if (gameStatus.value === 'playing') {
    nextTurn()
  }
  setTimeout(() => { isActionBusy.value = false }, 300)
}

// 轮流到下一个玩家
function nextTurn() {
  if (checkRoundFinish()) return

  currentTurnIdx.value = (currentTurnIdx.value + 1) % (opponents.value.length + 1)

  // 如果轮到已弃牌的玩家，直接跳到下一位
  if (currentTurnIdx.value === 0 && hero.value.folded) {
    nextTurn()
    return
  }

  if (currentTurnIdx.value > 0) {
    const opp = opponents.value[currentTurnIdx.value - 1]
    if (opp.folded) {
      nextTurn()
      return
    }
    // 如果是模拟测试玩家，触发自动行为
    if (opp.isAI || opp.id.startsWith('test_player_')) {
      setTimeout(() => {
        runOpponentTurn(opp)
      }, 700)
    }
  }
}

// 执行对手行为 (支持模拟玩家决策)
function runOpponentTurn(opp: InGameOpponent) {
  if (gameStatus.value !== 'playing' || opp.folded) return

  const action = getAIZhajinhuaAction(
    opp.cards,
    opp.seen,
    currentRound.value,
    currentBetUnit.value,
    opp.chips
  )

  const betCost = opp.seen ? currentBetUnit.value * 2 : currentBetUnit.value

  if (action === 'check') {
    opp.seen = true
    if (opp.chips >= currentBetUnit.value * 2) {
      opp.chips -= currentBetUnit.value * 2
      opp.currentBet += currentBetUnit.value * 2
      pot.value += currentBetUnit.value * 2
      sound.playChip()
    } else {
      opp.folded = true
    }
  } else if (action === 'fold') {
    opp.folded = true
  } else if (action === 'raise' && opp.chips >= betCost * 2) {
    currentBetUnit.value += minBet.value
    const cost = opp.seen ? currentBetUnit.value * 2 : currentBetUnit.value
    opp.chips -= cost
    opp.currentBet += cost
    pot.value += cost
    sound.playChip()
  } else if (action === 'compare') {
    if (!hero.value.folded) {
      const cmp = compareZhajinhuaHands(opp.cards, hero.value.cards)
      if (cmp > 0) {
        hero.value.folded = true
        sound.playLose()
      } else {
        opp.folded = true
      }
    } else {
      opp.chips -= betCost
      opp.currentBet += betCost
      pot.value += betCost
    }
  } else {
    opp.chips -= betCost
    opp.currentBet += betCost
    pot.value += betCost
    sound.playChip()
  }

  if (currentTurnIdx.value === opponents.value.length) {
    currentRound.value++
  }

  if (!checkRoundFinish()) {
    nextTurn()
  }
}

// 检查是否仅剩 1 名在局玩家，或者到达封顶轮次进行开牌
function checkRoundFinish(): boolean {
  const activeAll = [hero.value, ...opponents.value].filter(p => !p.folded)

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
    survivors.sort((a, b) => compareZhajinhuaHands(b.cards, a.cards))
    winner = survivors[0]
  }

  const isHeroWin = winner?.id === hero.value.id
  let netProfit = 0

  if (isHeroWin) {
    netProfit = pot.value - hero.value.currentBet
    hero.value.chips += pot.value
    sound.playWin()
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } })
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

  chatStore.sendSystemAnnouncement(
    roomChannel.value,
    `对局结束！获胜者为【${winner?.nickname || '无人'}】，赢得彩金 ${pot.value} 筹码！`
  )

  await walletStore.recordGameSettlement(
    'zhajinhua',
    hero.value.currentBet,
    isHeroWin ? pot.value : 0,
    {
      hand: hero.value.cards,
      eval: heroHandEvaluation.value?.typeName,
      winner: winner?.nickname
    }
  )
}
</script>
