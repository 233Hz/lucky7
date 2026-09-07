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
      class="w-32 sm:w-36 rounded-none border-2 border-black p-2 text-center transition-all relative font-mono"
      :class="[
        isCurrentTurn ? 'bg-[#ffff00] shadow-brutal !border-3' : 'bg-white shadow-brutal-sm',
        isHero ? 'ring-2 ring-black' : ''
      ]"
    >
      <!-- Dealer Button Badge -->
      <div
        v-if="isDealer"
        class="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-none border-2 border-black bg-[#ff006e] text-white font-black text-xs flex items-center justify-center shadow-brutal-sm"
      >
        D
      </div>

      <!-- Avatar & Nickname -->
      <div class="flex items-center justify-center space-x-1.5 mb-1">
        <img
          :src="seat.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + seat.id"
          class="w-5 h-5 rounded-none border border-black bg-slate-100"
          alt="avatar"
        />
        <span class="text-xs font-black text-black truncate max-w-[80px]">
          {{ seat.nickname }}
        </span>
      </div>

      <!-- Chips Balance -->
      <div class="text-[11px] font-mono font-black text-black flex items-center justify-center space-x-1">
        <CoinIcon customClass="w-3.5 h-3.5" />
        <span>{{ formattedChips }}</span>
      </div>

      <!-- Status or Hand Rank Badge -->
      <div v-if="seat.handName" class="mt-1 text-[10px] font-black text-black bg-[#ccff00] border border-black px-1 py-0.5 rounded-none shadow-brutal-sm">
        {{ seat.handName }}
      </div>
      <div v-else-if="statusLabel" class="mt-1 text-[10px] font-black px-1 py-0.5 rounded-none border border-black" :class="statusClass">
        {{ statusLabel }}
      </div>
    </div>

    <!-- Current Bet Pill -->
    <div
      v-if="seat.currentBet > 0"
      class="mt-1.5 flex items-center space-x-1 px-2.5 py-0.5 rounded-none bg-[#00d9ff] border-2 border-black text-[10px] font-mono font-black text-black shadow-brutal-sm"
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
    case 'folded': return 'text-slate-600 bg-slate-200'
    case 'allin': return 'text-white bg-[#ff006e]'
    case 'bust': return 'text-white bg-[#ff006e]'
    default: return 'text-black bg-slate-100'
  }
})
</script>
