<template>
  <div class="relative flex items-center justify-center">
    <div
      class="px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center space-x-1.5 border"
      :class="[
        seconds <= 5
          ? 'bg-rose-950/80 text-rose-400 border-rose-700 animate-pulse'
          : 'bg-slate-900/80 text-amber-400 border-slate-700'
      ]"
    >
      <span class="w-1.5 h-1.5 rounded-full" :class="seconds <= 5 ? 'bg-rose-500' : 'bg-amber-500'"></span>
      <span>倒计时: {{ seconds }}s</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  seconds: number
}>()
</script>
