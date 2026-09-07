<template>
  <div class="relative flex items-center justify-center">
    <div
      class="px-3.5 py-1 rounded-lg text-xs font-mono font-black flex items-center space-x-2 border-3 border-[#1a1a1a] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]"
      :class="[
        seconds <= 5
          ? 'bg-[#ef4444] text-white animate-bounce'
          : 'bg-[#facc15] text-[#1a1a1a]'
      ]"
    >
      <span class="w-2 h-2 rounded-full" :class="seconds <= 5 ? 'bg-white' : 'bg-[#1a1a1a]'"></span>
      <span>倒计时: {{ seconds }}s</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  seconds: number
}>()
</script>
