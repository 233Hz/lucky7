<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
        @click.self="handleBackdropClick"
      >
        <div
          class="relative w-full max-w-lg overflow-hidden rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] transition-all"
        >
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b-4 border-[#1a1a1a] bg-[#facc15] px-6 py-3.5">
            <h3 class="text-base font-black text-[#1a1a1a] uppercase tracking-wider flex items-center gap-2 font-mono">
              <slot name="title">{{ title }}</slot>
            </h3>
            <button
              @click="close"
              class="p-1 rounded-md border-2 border-[#1a1a1a] bg-white text-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] hover:bg-[#ef4444] hover:text-white active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Modal Body -->
          <div class="px-6 py-5 max-h-[75vh] overflow-y-auto bg-[#fffef0] text-[#1a1a1a]">
            <slot />
          </div>

          <!-- Modal Footer -->
          <div v-if="$slots.footer" class="flex items-center justify-end space-x-3 border-t-3 border-[#1a1a1a] bg-white px-6 py-4">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    closeOnBackdrop?: boolean
  }>(),
  {
    title: '',
    closeOnBackdrop: true
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
}>()

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function handleBackdropClick() {
  if (props.closeOnBackdrop) {
    close()
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
