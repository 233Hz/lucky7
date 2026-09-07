<template>
  <div
    class="relative select-none transition-all duration-300 shadow-md font-sans rounded-xl overflow-hidden border"
    :class="[
      sizeClasses[size],
      faceDown || !card
        ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border-indigo-700/60 shadow-indigo-950/50'
        : 'bg-white text-slate-900 border-slate-200 shadow-lg',
      highlight ? 'ring-2 ring-amber-400 -translate-y-2 shadow-amber-500/30' : ''
    ]"
  >
    <!-- Card Back (Face Down) -->
    <div
      v-if="faceDown || !card"
      class="w-full h-full p-1 sm:p-1.5 flex items-center justify-center"
    >
      <div class="w-full h-full rounded-lg border border-indigo-500/40 bg-indigo-950/60 flex flex-col items-center justify-center relative overflow-hidden">
        <!-- Geometric Grid Pattern -->
        <div class="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:8px_8px] opacity-25"></div>
        <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-amber-400/40 bg-indigo-900/80 flex items-center justify-center shadow-inner relative z-10">
          <span class="text-[10px] sm:text-xs font-black text-amber-300 tracking-wider">7</span>
        </div>
      </div>
    </div>

    <!-- Card Face (Face Up) -->
    <div
      v-else
      class="w-full h-full flex flex-col justify-between p-1.5 sm:p-2 relative bg-gradient-to-b from-white to-slate-50"
    >
      <!-- Top Left Corner -->
      <div class="flex flex-col items-start leading-none" :class="isRed ? 'text-rose-600' : 'text-slate-900'">
        <span class="font-extrabold text-xs sm:text-sm tracking-tight font-mono">{{ card.rank }}</span>
        <svg class="w-3 h-3 sm:w-3.5 sm:h-3.5 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
          <path :d="suitPaths[card.suit]" />
        </svg>
      </div>

      <!-- Center Large Suit Icon -->
      <div
        class="absolute inset-0 m-auto flex items-center justify-center pointer-events-none"
        :class="isRed ? 'text-rose-600' : 'text-slate-900'"
      >
        <svg class="w-6 h-6 sm:w-8 sm:h-8 opacity-90 drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
          <path :d="suitPaths[card.suit]" />
        </svg>
      </div>

      <!-- Bottom Right Inverted Corner -->
      <div class="flex flex-col items-end leading-none rotate-180 self-end" :class="isRed ? 'text-rose-600' : 'text-slate-900'">
        <span class="font-extrabold text-xs sm:text-sm tracking-tight font-mono">{{ card.rank }}</span>
        <svg class="w-3 h-3 sm:w-3.5 sm:h-3.5 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
          <path :d="suitPaths[card.suit]" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Card, Suit } from '@/types/game'

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

// Precise SVG vector path data for each card suit
const suitPaths: Record<Suit, string> = {
  // Spades ♠
  spades: 'M12 2C10 6 5 9 5 14a5 5 0 009.9 1H10v4h4v-4a5 5 0 004.9-5c0-5-5-8-7-12z',
  // Hearts ♥
  hearts: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  // Clubs ♣
  clubs: 'M12 2a4 4 0 00-3.8 2.8 4.5 4.5 0 00-4.2 4.2 4.5 4.5 0 003.5 4.4A4.5 4.5 0 006 17h4v4h4v-4h4a4.5 4.5 0 00-1.5-3.6 4.5 4.5 0 003.5-4.4 4.5 4.5 0 00-4.2-4.2A4 4 0 0012 2z',
  // Diamonds ♦
  diamonds: 'M12 2L3.5 12 12 22l8.5-10L12 2z'
}

const sizeClasses: Record<string, string> = {
  sm: 'w-14 h-20',
  md: 'w-20 h-28 sm:w-22 sm:h-32',
  lg: 'w-24 h-34 sm:w-28 sm:h-40'
}
</script>
