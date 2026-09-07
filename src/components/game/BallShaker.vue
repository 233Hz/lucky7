<template>
  <div class="flex flex-col items-center select-none">
    <!-- Lottery Ball Sphere with Solid Black Border & Hard Shadow -->
    <div
      class="w-13 h-13 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center font-black text-lg sm:text-xl border-3 border-black relative overflow-hidden transition-all duration-200"
      :class="[
        colorWaveClass,
        rolling ? 'animate-spin scale-110 shadow-brutal' : 'shadow-brutal hover:-translate-y-0.5'
      ]"
    >
      <span class="font-mono font-black tracking-tighter">
        {{ formattedNumber }}
      </span>
    </div>

    <!-- Zodiac & Info badge -->
    <div v-if="zodiac && !rolling" class="mt-2 flex items-center space-x-1 px-2.5 py-0.5 rounded-none bg-white border-2 border-black text-xs font-black font-mono shadow-brutal-sm text-black">
      <span class="text-[#ff9500]">{{ zodiac }}</span>
      <span class="text-black">·</span>
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
    case 'red': return 'bg-[#ff006e] text-white'
    case 'blue': return 'bg-[#00d9ff] text-black'
    case 'green': return 'bg-[#ccff00] text-black'
  }
})

const colorWaveText = computed(() => {
  switch (waveColor.value) {
    case 'red': return 'text-[#ff006e]'
    case 'blue': return 'text-[#0088cc]'
    case 'green': return 'text-[#059669]'
  }
})
</script>
