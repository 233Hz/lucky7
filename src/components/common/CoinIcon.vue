<template>
  <svg
    class="inline-block flex-shrink-0 select-none"
    :class="customClass || 'w-4 h-4'"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Outer Gold Rim -->
    <circle cx="12" cy="12" r="10.5" fill="url(#coinGrad)" stroke="#b45309" stroke-width="1.2" />
    <!-- Inner Dotted Ring -->
    <circle cx="12" cy="12" r="8" stroke="#fef08a" stroke-width="0.8" stroke-dasharray="1.5 1.5" opacity="0.9" />
    <!-- Center Number / Currency Symbol -->
    <text
      x="12"
      y="15.5"
      text-anchor="middle"
      font-size="10.5"
      font-weight="900"
      fill="#78350f"
      font-family="monospace, sans-serif"
    >
      7
    </text>
    <defs>
      <linearGradient id="coinGrad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop stop-color="#fde047" />
        <stop offset="0.5" stop-color="#f59e0b" />
        <stop offset="1" stop-color="#d97706" />
      </linearGradient>
    </defs>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  customClass?: string
}>()
</script>
