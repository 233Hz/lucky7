<template>
  <div class="flex items-center justify-center space-x-2 sm:space-x-3 select-none flex-wrap gap-y-2">
    <button
      v-for="chip in chips"
      :key="chip"
      type="button"
      @click="selectChip(chip)"
      class="relative group rounded-full transition-all duration-200 transform focus:outline-none"
      :class="[
        modelValue === chip ? '-translate-y-2 scale-110 shadow-lg' : 'hover:-translate-y-1 opacity-85 hover:opacity-100',
        disabled ? 'cursor-not-allowed opacity-40 hover:translate-y-0' : 'cursor-pointer'
      ]"
      :disabled="disabled"
    >
      <!-- Circular Chip Design -->
      <div
        class="w-11 h-11 sm:w-13 sm:h-13 rounded-full border-4 border-dashed flex items-center justify-center font-mono font-black text-xs sm:text-sm shadow-md transition-shadow"
        :class="chipStyles[chip]"
      >
        <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/40 backdrop-blur-xs flex items-center justify-center border border-white/20">
          {{ chip }}
        </div>
      </div>

      <!-- Active Indicator Glow -->
      <div
        v-if="modelValue === chip"
        class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 animate-pulse"
      ></div>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { ChipValue } from '@/types/game'
import { sound } from '@/lib/sound'

const props = withDefaults(
  defineProps<{
    modelValue: number
    chips?: ChipValue[]
    disabled?: boolean
  }>(),
  {
    chips: () => [10, 50, 100, 500, 1000, 5000],
    disabled: false
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'change', value: number): void
}>()

const chipStyles: Record<number, string> = {
  10: 'bg-gradient-to-tr from-slate-600 to-slate-400 border-slate-300 text-white shadow-slate-900/40',
  50: 'bg-gradient-to-tr from-rose-700 to-rose-500 border-rose-300 text-white shadow-rose-900/40',
  100: 'bg-gradient-to-tr from-emerald-700 to-emerald-500 border-emerald-300 text-white shadow-emerald-900/40',
  500: 'bg-gradient-to-tr from-indigo-700 to-indigo-500 border-indigo-300 text-white shadow-indigo-900/40',
  1000: 'bg-gradient-to-tr from-amber-600 to-gold-400 border-amber-200 text-slate-950 shadow-amber-900/40',
  5000: 'bg-gradient-to-tr from-purple-800 to-purple-600 border-purple-300 text-white shadow-purple-900/40'
}

function selectChip(val: number) {
  if (props.disabled) return
  sound.playChip()
  emit('update:modelValue', val)
  emit('change', val)
}
</script>
