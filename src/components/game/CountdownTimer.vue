<template>
  <div class="relative flex items-center justify-center">
    <div
      class="px-3.5 py-1 rounded-none text-xs font-mono font-black flex items-center space-x-2 border-2 border-black shadow-brutal-sm"
      :class="[
        seconds <= 5
          ? 'bg-[#ff006e] text-white animate-bounce'
          : 'bg-[#ffff00] text-black'
      ]"
    >
      <span class="w-2 h-2 rounded-none" :class="seconds <= 5 ? 'bg-white' : 'bg-black'"></span>
      <span>倒计时: {{ seconds }}s</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  seconds: number
}>()
</script>
