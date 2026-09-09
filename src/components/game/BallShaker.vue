<template>
  <div class="flex flex-col items-center select-none">
    <!-- Lottery Ball Sphere with Solid Ink Border & Hard Shadow -->
    <div
      class="w-16 h-16 sm:w-20 sm:h-20 aspect-square rounded-full flex flex-col items-center justify-center font-black border-4 border-[#1a1a1a] relative overflow-hidden transition-all duration-200 shrink-0"
      :class="[
        colorWaveClass,
        rolling ? 'animate-bounce shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]' : 'shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] hover:-translate-y-0.5'
      ]"
    >
      <!-- Comic Gloss Highlight -->
      <span class="absolute top-2 left-2.5 w-4 h-2.5 rounded-full bg-white/40 -rotate-45 pointer-events-none"></span>

      <!-- Ball Number -->
      <span class="font-mono font-black text-2xl sm:text-3xl tracking-tight leading-none relative z-10">
        {{ formattedNumber }}
      </span>
    </div>

    <!-- Zodiac & Info badge -->
    <div v-if="zodiac && !rolling" class="mt-2 flex items-center space-x-1.5 px-3 py-0.5 rounded-md bg-white border-2 border-[#1a1a1a] text-xs font-black font-mono shadow-[2px_2px_0px_0px_#1a1a1a] text-[#1a1a1a]">
      <span class="text-[#f59e0b]">{{ zodiac }}</span>
      <span class="text-[#1a1a1a]">·</span>
      <span :class="colorWaveText">{{ waveName }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    number: number
    rolling?: boolean
    zodiac?: string
  }>(),
  {
    rolling: false,
    zodiac: ''
  }
)

const formattedNumber = computed(() => {
  return props.number < 10 ? `0${props.number}` : `${props.number}`
})

// 红波 / 蓝波 / 绿波 标准香港六合彩分类
const redBalls = [1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46]
const blueBalls = [3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48]
// 其余为绿波

const waveColor = computed<'red' | 'blue' | 'green'>(() => {
  if (redBalls.includes(props.number)) return 'red'
  if (blueBalls.includes(props.number)) return 'blue'
  return 'green'
})

const waveName = computed(() => {
  switch (waveColor.value) {
    case 'red': return '红波'
    case 'blue': return '蓝波'
    case 'green': return '绿波'
  }
})

const colorWaveClass = computed(() => {
  switch (waveColor.value) {
    case 'red': return 'bg-[#ef4444] text-white'
    case 'blue': return 'bg-[#3b82f6] text-white'
    case 'green': return 'bg-[#22c55e] text-white'
  }
})

const colorWaveText = computed(() => {
  switch (waveColor.value) {
    case 'red': return 'text-[#ef4444]'
    case 'blue': return 'text-[#3b82f6]'
    case 'green': return 'text-[#22c55e]'
  }
})
</script>
