<template>
  <div class="flex items-center justify-center gap-1.5 sm:gap-2.5 select-none flex-wrap">
    <button
      v-for="chip in chips"
      :key="chip"
      type="button"
      @click="selectChip(chip)"
      class="relative group rounded-full transition-all duration-150 transform focus:outline-none"
      :class="[
        modelValue === chip ? '-translate-y-1.5 sm:-translate-y-2 scale-110 sm:scale-120 z-10' : 'hover:-translate-y-0.5',
        disabled ? 'cursor-not-allowed opacity-40 hover:translate-y-0' : 'cursor-pointer'
      ]"
      :disabled="disabled"
    >
      <!-- Circular Chip Design with Solid Comic Ink Outline & Hard Shadow -->
      <div
        class="w-10 h-10 sm:w-12 sm:h-12 aspect-square rounded-full flex items-center justify-center font-mono font-black text-[11px] sm:text-sm transition-all"
        :class="[
          chipStyles[chip] || 'bg-white text-[#1a1a1a]',
          modelValue === chip
            ? 'border-3 sm:border-4 border-[#1a1a1a] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] sm:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] ring-2 ring-[#facc15]'
            : 'border-2 sm:border-3 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'
        ]"
      >
        <div class="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center border border-[#1a1a1a]/40 font-black">
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
