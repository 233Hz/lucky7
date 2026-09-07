<template>
  <div
    class="flex flex-col items-center transition-all duration-150 relative select-none"
    :class="[
      isCurrentTurn ? 'z-20 scale-105' : 'opacity-95',
      seat.status === 'folded' ? 'opacity-40 grayscale' : ''
    ]"
  >
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
      <div v-else-if="seat.status === 'active'" class="text-xs text-black font-mono font-bold bg-white px-2 py-1 border border-black shadow-brutal-sm">
        等待发牌
      </div>
    </div>

    <!-- Avatar & Info Card -->
    <div
      class="w-32 sm:w-36 rounded-lg border-3 border-[#1a1a1a] p-2.5 text-center transition-all relative font-mono"
      :class="[
        isCurrentTurn ? 'bg-[#facc15] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'bg-[#fffef0] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]',
        isHero ? 'ring-2 ring-[#ef4444]' : ''
      ]"
    >
      <!-- Dealer Button Badge -->
      <div
        v-if="isDealer"
        class="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full border-2 border-[#1a1a1a] bg-[#ef4444] text-white font-black text-xs flex items-center justify-center shadow-[2px_2px_0px_0px_#1a1a1a]"
      >
        D
      </div>

      <!-- Host Badge -->
      <div
        v-if="isHost || seat.isHost"
        class="absolute -top-2.5 -left-2.5 px-2 py-0.5 rounded-md border-2 border-[#1a1a1a] bg-[#facc15] text-[#1a1a1a] font-black text-[10px] shadow-[2px_2px_0px_0px_#1a1a1a] uppercase"
      >
        房主
      </div>

      <!-- Ready Status Badge -->
      <div
        v-if="readyStatus"
        class="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-md border-2 border-[#1a1a1a] text-[10px] font-black shadow-[2px_2px_0px_0px_#1a1a1a] uppercase whitespace-nowrap z-30"
        :class="readyStatus === 'ready' ? 'bg-[#22c55e] text-white' : 'bg-[#f59e0b] text-[#1a1a1a]'"
      >
        {{ readyStatus === 'ready' ? '已准备' : '未准备' }}
      </div>

      <!-- Avatar & Nickname -->
      <div class="flex items-center justify-center space-x-1.5 mb-1">
        <img
          :src="seat.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + seat.id"
          class="w-5 h-5 rounded-md border border-[#1a1a1a] bg-white"
          alt="avatar"
        />
        <span class="text-xs font-black text-[#1a1a1a] truncate max-w-[80px]">
          {{ seat.nickname }}
        </span>
      </div>

      <!-- Chips Balance -->
      <div class="text-[11px] font-mono font-black text-[#1a1a1a] flex items-center justify-center space-x-1">
        <CoinIcon customClass="w-3.5 h-3.5" />
        <span>{{ formattedChips }}</span>
      </div>

      <!-- Status or Hand Rank Badge -->
      <div v-if="seat.handName" class="mt-1 text-[10px] font-black text-white bg-[#22c55e] border-2 border-[#1a1a1a] px-1.5 py-0.5 rounded-md shadow-[2px_2px_0px_0px_#1a1a1a]">
        {{ seat.handName }}
      </div>
      <div v-else-if="statusLabel" class="mt-1 text-[10px] font-black px-1.5 py-0.5 rounded-md border-2 border-[#1a1a1a]" :class="statusClass">
        {{ statusLabel }}
      </div>
    </div>

    <!-- Current Bet Pill -->
    <div
      v-if="seat.currentBet > 0"
      class="mt-1.5 flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-[#3b82f6] border-2 border-[#1a1a1a] text-[10px] font-mono font-black text-white shadow-[2px_2px_0px_0px_#1a1a1a]"
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
    isHost?: boolean
    readyStatus?: 'ready' | 'waiting'
  }>(),
  {
    isCurrentTurn: false,
    showCardsFaceDown: false,
    isDealer: false,
    isHero: false,
    isHost: false,
    readyStatus: undefined
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
    case 'folded': return 'text-[#1a1a1a] bg-white'
    case 'allin': return 'text-white bg-[#ef4444]'
    case 'bust': return 'text-white bg-[#ef4444]'
    default: return 'text-[#1a1a1a] bg-white'
  }
})
</script>
