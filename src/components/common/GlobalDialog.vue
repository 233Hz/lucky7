<template>
  <Teleport to="body">
    <Transition name="dialog-pop">
      <div
        v-if="dialogStore.isOpen"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-[2px]"
        @click.self="onBackdropClick"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="relative w-full max-w-md overflow-hidden rounded-xl bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[10px_10px_0px_0px_rgba(26,26,26,1)] font-mono transition-transform"
        >
          <!-- Header Bar -->
          <div
            class="flex items-center justify-between border-b-4 border-[#1a1a1a] px-5 py-3.5 select-none"
            :class="headerClass"
          >
            <div class="flex items-center space-x-2.5">
              <component :is="iconComponent" class="w-5 h-5 flex-shrink-0" />
              <h3 class="text-sm sm:text-base font-black uppercase tracking-wider">
                {{ dialogStore.currentOptions.title }}
              </h3>
            </div>
            <button
              v-prevent-reclick
              @click="dialogStore.currentOptions.showCancel ? dialogStore.handleCancel() : dialogStore.handleConfirm()"
              class="p-1 rounded-md border-2 border-[#1a1a1a] bg-white text-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] hover:bg-[#ef4444] hover:text-white active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              title="关闭"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Content Body -->
          <div class="p-6 bg-[#fffef0] max-h-[70vh] overflow-y-auto">
            <div class="text-xs sm:text-sm font-bold text-[#1a1a1a] leading-relaxed whitespace-pre-line select-text">
              {{ dialogStore.currentOptions.message }}
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center border-t-3 border-[#1a1a1a] bg-white px-5 py-3.5">
            <div v-if="dialogStore.currentOptions.showCancel" class="flex items-center justify-end space-x-3 w-full">
              <button
                v-prevent-reclick
                @click="dialogStore.handleCancel"
                class="comic-btn-white px-5 py-2 text-xs font-black"
              >
                {{ dialogStore.currentOptions.cancelText }}
              </button>
              <button
                v-prevent-reclick
                @click="dialogStore.handleConfirm"
                class="comic-btn-yellow px-6 py-2 text-xs font-black flex items-center gap-1.5"
              >
                <Check class="w-3.5 h-3.5" />
                <span>{{ dialogStore.currentOptions.confirmText }}</span>
              </button>
            </div>
            <div v-else class="w-full">
              <button
                v-prevent-reclick
                @click="dialogStore.handleConfirm"
                class="comic-btn-yellow w-full py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
              >
                <Check class="w-3.5 h-3.5" />
                <span>{{ dialogStore.currentOptions.confirmText }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { AlertTriangle, AlertCircle, CheckCircle2, Info, X, Check } from 'lucide-vue-next'
import { useDialogStore } from '@/stores/dialog'

const dialogStore = useDialogStore()

const headerClass = computed(() => {
  switch (dialogStore.currentOptions.type) {
    case 'error':
      return 'bg-[#ef4444] text-white'
    case 'success':
      return 'bg-[#22c55e] text-[#1a1a1a]'
    case 'warning':
      return 'bg-[#facc15] text-[#1a1a1a]'
    case 'info':
    default:
      return 'bg-[#facc15] text-[#1a1a1a]'
  }
})

const iconComponent = computed(() => {
  switch (dialogStore.currentOptions.type) {
    case 'error':
      return AlertCircle
    case 'success':
      return CheckCircle2
    case 'warning':
      return AlertTriangle
    case 'info':
    default:
      return Info
  }
})

function onBackdropClick() {
  if (dialogStore.currentOptions.closeOnBackdrop) {
    if (dialogStore.currentOptions.showCancel) {
      dialogStore.handleCancel()
    } else {
      dialogStore.handleConfirm()
    }
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (!dialogStore.isOpen) return
  if (e.key === 'Escape') {
    if (dialogStore.currentOptions.showCancel) {
      dialogStore.handleCancel()
    } else {
      dialogStore.handleConfirm()
    }
  } else if (e.key === 'Enter') {
    dialogStore.handleConfirm()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.dialog-pop-enter-active,
.dialog-pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

.dialog-pop-enter-from,
.dialog-pop-leave-to {
  opacity: 0;
  transform: scale(0.94) translateY(6px);
}
</style>
