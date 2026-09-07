<template>
  <div
    class="relative rounded-lg select-none transition-all duration-300 shadow-md font-sans border"
    :class="[
      sizeClasses[size],
      faceDown
        ? 'bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 border-indigo-700/60'
        : 'bg-white text-slate-900 border-slate-200',
      highlight ? 'ring-2 ring-gold-400 -translate-y-1 shadow-gold-500/30' : ''
    ]"
  >
    <!-- Card Back -->
    <div
      v-if="faceDown || !card"
      class="w-full h-full rounded-md flex items-center justify-center p-1 overflow-hidden"
    >
      <div class="w-full h-full rounded border border-indigo-500/30 bg-indigo-950/40 flex items-center justify-center relative">
        <span class="text-indigo-400/40 text-xs font-black tracking-wider rotate-[-45deg]">L7</span>
      </div>
    </div>

    <!-- Card Face -->
    <div v-else class="w-full h-full flex flex-col justify-between p-1 sm:p-1.5 leading-none">
      <!-- Top Left corner -->
      <div class="flex flex-col items-center" :class="isRed ? 'text-rose-600' : 'text-slate-900'">
        <span class="font-black text-xs sm:text-sm tracking-tighter">{{ card.rank }}</span>
        <span class="text-[10px] sm:text-xs -mt-0.5">{{ suitSymbols[card.suit] }}</span>
      </div>

      <!-- Center Large Suit -->
      <div
        class="flex-1 flex items-center justify-center text-lg sm:text-2xl"
        :class="isRed ? 'text-rose-600' : 'text-slate-900'"
      >
        {{ suitSymbols[card.suit] }}
      </div>

      <!-- Bottom Right corner (inverted) -->
      <div class="flex flex-col items-center rotate-180" :class="isRed ? 'text-rose-600' : 'text-slate-900'">
        <span class="font-black text-xs sm:text-sm tracking-tighter">{{ card.rank }}</span>
        <span class="text-[10px] sm:text-xs -mt-0.5">{{ suitSymbols[card.suit] }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Card } from '@/types/game'

const props = withDefaults(
  defineProps<{
    card?: Card | null
    faceDown?: boolean
    size?: 'sm' | 'md' | 'lg'
    highlight?: boolean
  }>(),
  {
    card: null,
    faceDown: false,
    size: 'md',
    highlight: false
  }
)

const isRed = computed(() => {
  return props.card?.suit === 'hearts' || props.card?.suit === 'diamonds'
})

const suitSymbols: Record<string, string> = {
  spades: '♠',
  hearts: '♥',
  clubs: '♣',
  diamonds: '♦'
}

const sizeClasses: Record<string, string> = {
  sm: 'w-10 h-14 text-[10px]',
  md: 'w-14 h-20 text-xs sm:w-16 sm:h-24 sm:text-sm',
  lg: 'w-20 h-28 text-base sm:w-24 sm:h-36 sm:text-lg'
}
</script>
