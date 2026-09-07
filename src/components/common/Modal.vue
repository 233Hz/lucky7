<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
        @click.self="handleBackdropClick"
      >
        <div
          class="relative w-full max-w-lg overflow-hidden rounded-none bg-white border-4 border-black shadow-brutal-xl transition-all"
        >
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b-4 border-black bg-[#ccff00] px-6 py-3.5">
            <h3 class="text-base font-black text-black uppercase tracking-wider flex items-center gap-2 font-mono">
              <slot name="title">{{ title }}</slot>
            </h3>
            <button
              @click="close"
              class="p-1 rounded-none border-2 border-black bg-white text-black shadow-brutal-sm hover:bg-[#ff006e] hover:text-white active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Modal Body -->
          <div class="px-6 py-5 max-h-[75vh] overflow-y-auto bg-white text-black">
            <slot />
          </div>

          <!-- Modal Footer -->
          <div v-if="$slots.footer" class="flex items-center justify-end space-x-3 border-t-2 border-black bg-[#f4f4f0] px-6 py-4">
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
