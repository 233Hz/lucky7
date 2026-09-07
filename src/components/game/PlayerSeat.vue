<template>
  <div
    class="flex flex-col items-center transition-all duration-300 relative select-none"
    :class="[
      isCurrentTurn ? 'scale-105 z-20' : 'opacity-95',
      seat.status === 'folded' ? 'opacity-40 grayscale' : ''
    ]"
  >
    <!-- Turn Glow Border -->
    <div
      v-if="isCurrentTurn"
      class="absolute -inset-2 rounded-2xl bg-gradient-to-r from-amber-500/30 to-emerald-500/30 blur-sm animate-pulse -z-10"
    ></div>

    <!-- Cards Display -->
    <div class="flex items-center justify-center -space-x-3.5 sm:-space-x-2.5 mb-2 min-h-[84px]">
      <template v-if="seat.cards && seat.cards.length > 0">
        <PlayingCard
          v-for="(c, idx) in seat.cards"
          :key="idx"
          :card="c"
          :faceDown="showCardsFaceDown"
          size="sm"
          class="hover:z-10 hover:-translate-y-1 transition-transform"
        />
      </template>
      <div v-else-if="seat.status === 'active'" class="text-xs text-slate-500 italic">
        等待发牌
      </div>
    </div>

    <!-- Avatar & Info Card -->
    <div
      class="w-32 sm:w-36 rounded-xl bg-slate-900/95 border p-2 text-center shadow-lg transition-colors backdrop-blur-xs relative"
      :class="[
        isCurrentTurn ? 'border-amber-400 bg-slate-800' : 'border-slate-800',
        isHero ? 'ring-1 ring-emerald-500/60' : ''
      ]"
    >
      <!-- Dealer Button Badge -->
      <div
        v-if="isDealer"
        class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shadow"
      >
        D
      </div>

      <!-- Avatar & Nickname -->
      <div class="flex items-center justify-center space-x-1.5 mb-1">
        <img
          :src="seat.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + seat.id"
          class="w-5 h-5 rounded-full bg-slate-800 border border-slate-700"
          alt="avatar"
        />
        <span class="text-xs font-semibold text-slate-200 truncate max-w-[80px]">
          {{ seat.nickname }}
        </span>
      </div>

      <!-- Chips Balance -->
      <div class="text-[11px] font-mono font-bold text-amber-400 flex items-center justify-center space-x-1">
        <CoinIcon customClass="w-3.5 h-3.5" />
        <span>{{ formattedChips }}</span>
      </div>

      <!-- Status or Hand Rank Badge -->
      <div v-if="seat.handName" class="mt-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1 py-0.5 rounded">
        {{ seat.handName }}
      </div>
      <div v-else-if="statusLabel" class="mt-1 text-[10px] font-medium px-1 py-0.5 rounded" :class="statusClass">
        {{ statusLabel }}
      </div>
    </div>

    <!-- Current Bet Pill -->
    <div
      v-if="seat.currentBet > 0"
      class="mt-1.5 flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/50 text-[10px] font-mono font-bold text-amber-300 shadow"
    >
      <span>下注:</span>
      <span>{{ seat.currentBet }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlayerSeatInfo } from '@/types/game'
import PlayingCard from './PlayingCard.vue'
import CoinIcon from '@/components/common/CoinIcon.vue'

const props = withDefaults(
  defineProps<{
    seat: PlayerSeatInfo
    isCurrentTurn?: boolean
    showCardsFaceDown?: boolean
    isDealer?: boolean
    isHero?: boolean
  }>(),
  {
    isCurrentTurn: false,
    showCardsFaceDown: false,
    isDealer: false,
    isHero: false
  }
)

const formattedChips = computed(() => {
  return new Intl.NumberFormat('en-US').format(props.seat.chips)
})

const statusLabel = computed(() => {
  switch (props.seat.status) {
    case 'folded': return '已弃牌'
    case 'allin': return '全下 (All-In)'
    case 'bust': return '爆牌'
    case 'waiting': return '等待中'
    default: return ''
  }
})

const statusClass = computed(() => {
  switch (props.seat.status) {
    case 'folded': return 'text-slate-400 bg-slate-800'
    case 'allin': return 'text-rose-400 bg-rose-950/80 border border-rose-700'
    case 'bust': return 'text-rose-500 bg-rose-950'
    default: return 'text-slate-400'
  }
})
</script>
