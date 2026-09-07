<template>
  <div class="flex items-center justify-center space-x-2 sm:space-x-3 select-none flex-wrap gap-y-2">
    <button
      v-for="chip in chips"
      :key="chip"
      type="button"
      @click="selectChip(chip)"
      class="relative group rounded-full transition-all duration-150 transform focus:outline-none"
      :class="[
        modelValue === chip ? '-translate-y-2 scale-120 z-10' : 'hover:-translate-y-0.5',
        disabled ? 'cursor-not-allowed opacity-40 hover:translate-y-0' : 'cursor-pointer'
      ]"
      :disabled="disabled"
    >
      <!-- Circular Chip Design with Solid Outline & Hard Shadow -->
      <div
        class="w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center font-mono font-black text-xs sm:text-sm transition-all"
        :class="[
          chipStyles[chip] || 'bg-white text-black',
          modelValue === chip
            ? [selectedBorderStyles[chip] || 'border-[#ff006e]', 'border-4 shadow-brutal']
            : 'border-3 border-black shadow-brutal-sm'
        ]"
      >
        <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/25 flex items-center justify-center border border-black/40">
          {{ chip }}
        </div>
      </div>
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
  10: 'bg-white text-black',
  50: 'bg-[#ff006e] text-white',
  100: 'bg-[#ccff00] text-black',
  500: 'bg-[#00d9ff] text-black',
  1000: 'bg-[#ffff00] text-black',
  5000: 'bg-[#ff9500] text-black'
}

const selectedBorderStyles: Record<number, string> = {
  10: 'border-[#ff006e]',
  50: 'border-[#ccff00]',
  100: 'border-[#ff006e]',
  500: 'border-[#ff9500]',
  1000: 'border-[#00d9ff]',
  5000: 'border-[#00d9ff]'
}

function selectChip(val: number) {
  if (props.disabled) return
  sound.playChip()
  emit('update:modelValue', val)
  emit('change', val)
}
</script>
