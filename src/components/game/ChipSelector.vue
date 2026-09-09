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
      <!-- Circular Chip Design with Solid Comic Ink Outline & Hard Shadow -->
      <div
        class="w-11 h-11 sm:w-12 sm:h-12 aspect-square rounded-full flex items-center justify-center font-mono font-black text-xs sm:text-sm transition-all"
        :class="[
          chipStyles[chip] || 'bg-white text-[#1a1a1a]',
          modelValue === chip
            ? 'border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] ring-2 ring-[#facc15]'
            : 'border-3 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'
        ]"
      >
        <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center border border-[#1a1a1a]/40 font-black">
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
  10: 'bg-white text-[#1a1a1a]',
  50: 'bg-[#ef4444] text-white',
  100: 'bg-[#facc15] text-[#1a1a1a]',
  500: 'bg-[#3b82f6] text-white',
  1000: 'bg-[#22c55e] text-white',
  5000: 'bg-[#1a1a1a] text-[#facc15]'
}

function selectChip(val: number) {
  if (props.disabled) return
  sound.playChip()
  emit('update:modelValue', val)
  emit('change', val)
}
</script>
