<template>
  <svg
    class="inline-block flex-shrink-0 select-none"
    :class="customClass || 'w-4 h-4'"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Outer Comic Ink Rim -->
    <circle cx="12" cy="12" r="10" fill="#facc15" stroke="#1a1a1a" stroke-width="2.5" />
    <!-- Inner Ink Ring -->
    <circle cx="12" cy="12" r="7.5" fill="none" stroke="#1a1a1a" stroke-width="1.2" stroke-dasharray="2 1.5" />
    <!-- Center Number / Comic 7 -->
    <text
      x="12"
      y="16"
      text-anchor="middle"
      font-size="11"
      font-weight="900"
      fill="#1a1a1a"
      font-family="Impact, Inter, monospace, sans-serif"
    >
      7
    </text>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  customClass?: string
}>()
</script>
