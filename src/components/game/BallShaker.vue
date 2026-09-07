<template>
  <div class="flex flex-col items-center select-none">
    <!-- Lottery Ball Sphere -->
    <div
      class="w-13 h-13 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center font-black text-lg sm:text-xl shadow-lg border-2 border-white/60 relative overflow-hidden transition-all duration-300"
      :class="[
        colorWaveClass,
        rolling ? 'animate-spin scale-110' : 'hover:scale-105'
      ]"
    >
      <!-- Gloss highlight reflection -->
      <div class="absolute top-1 left-2 w-4 h-2 rounded-full bg-white/40 blur-[1px]"></div>

      <span class="text-white drop-shadow font-mono tracking-tighter">
        {{ formattedNumber }}
      </span>
    </div>

    <!-- Zodiac & Info pill -->
    <div v-if="zodiac && !rolling" class="mt-1.5 flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-bold text-slate-300">
      <span class="text-amber-400">{{ zodiac }}</span>
      <span class="text-slate-500">·</span>
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
    case 'red': return 'bg-gradient-to-tr from-rose-700 to-rose-500 shadow-rose-500/30'
    case 'blue': return 'bg-gradient-to-tr from-sky-700 to-sky-500 shadow-sky-500/30'
    case 'green': return 'bg-gradient-to-tr from-emerald-700 to-emerald-500 shadow-emerald-500/30'
  }
})

const colorWaveText = computed(() => {
  switch (waveColor.value) {
    case 'red': return 'text-rose-400'
    case 'blue': return 'text-sky-400'
    case 'green': return 'text-emerald-400'
  }
})
</script>
