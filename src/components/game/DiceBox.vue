<template>
  <div class="flex items-center justify-center space-x-4 sm:space-x-6 py-4">
    <div
      v-for="(val, idx) in dice"
      :key="idx"
      class="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-white to-slate-100 border-2 border-slate-300 shadow-xl flex items-center justify-center transform transition-transform duration-300"
      :class="rolling ? 'animate-bounce' : 'hover:scale-105'"
    >
      <!-- Dots Grid for 1-6 -->
      <div class="w-10 h-10 sm:w-12 sm:h-12 relative">
        <!-- 1 -->
        <template v-if="val === 1">
          <span class="absolute inset-0 m-auto w-3.5 h-3.5 rounded-full bg-rose-600 shadow-sm"></span>
        </template>
        <!-- 2 -->
        <template v-else-if="val === 2">
          <span class="absolute top-1 left-1 w-2.5 h-2.5 rounded-full bg-slate-900"></span>
          <span class="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-slate-900"></span>
        </template>
        <!-- 3 -->
        <template v-else-if="val === 3">
          <span class="absolute top-1 left-1 w-2.5 h-2.5 rounded-full bg-slate-900"></span>
          <span class="absolute inset-0 m-auto w-2.5 h-2.5 rounded-full bg-slate-900"></span>
          <span class="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-slate-900"></span>
        </template>
        <!-- 4 -->
        <template v-else-if="val === 4">
          <span class="absolute top-1 left-1 w-2.5 h-2.5 rounded-full bg-rose-600"></span>
          <span class="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-600"></span>
          <span class="absolute bottom-1 left-1 w-2.5 h-2.5 rounded-full bg-rose-600"></span>
          <span class="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-600"></span>
        </template>
        <!-- 5 -->
        <template v-else-if="val === 5">
          <span class="absolute top-1 left-1 w-2.5 h-2.5 rounded-full bg-slate-900"></span>
          <span class="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-slate-900"></span>
          <span class="absolute inset-0 m-auto w-2.5 h-2.5 rounded-full bg-slate-900"></span>
          <span class="absolute bottom-1 left-1 w-2.5 h-2.5 rounded-full bg-slate-900"></span>
          <span class="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-slate-900"></span>
        </template>
        <!-- 6 -->
        <template v-else-if="val === 6">
          <span class="absolute top-0.5 left-1 w-2.5 h-2.5 rounded-full bg-slate-900"></span>
          <span class="absolute top-0.5 right-1 w-2.5 h-2.5 rounded-full bg-slate-900"></span>
          <span class="absolute inset-y-0 left-1 my-auto w-2.5 h-2.5 rounded-full bg-slate-900"></span>
          <span class="absolute inset-y-0 right-1 my-auto w-2.5 h-2.5 rounded-full bg-slate-900"></span>
          <span class="absolute bottom-0.5 left-1 w-2.5 h-2.5 rounded-full bg-slate-900"></span>
          <span class="absolute bottom-0.5 right-1 w-2.5 h-2.5 rounded-full bg-slate-900"></span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  dice: number[]
  rolling?: boolean
}>()
</script>
