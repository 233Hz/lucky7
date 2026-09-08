import { defineStore } from 'pinia'
import { ref } from 'vue'

export type DialogType = 'info' | 'warning' | 'error' | 'success'

export interface DialogOptions {
  title?: string
  message: string
  type?: DialogType
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  closeOnBackdrop?: boolean
}

export const useDialogStore = defineStore('dialog', () => {
  const isOpen = ref(false)
  const currentOptions = ref<DialogOptions>({
    title: '温馨提示',
    message: '',
    type: 'info',
    confirmText: '确定 · GOT IT',
    cancelText: '取消 · CANCEL',
    showCancel: false,
    closeOnBackdrop: true
  })

  let resolvePromise: ((value: boolean) => void) | null = null

  function show(options: DialogOptions): Promise<boolean> {
    const defaultTitle = options.type === 'error'
      ? '错误提示'
      : options.type === 'warning'
      ? '重要提醒'
      : options.type === 'success'
      ? '操作成功'
      : '温馨提示'

    currentOptions.value = {
      title: options.title || defaultTitle,
      message: options.message,
      type: options.type || 'info',
      confirmText: options.confirmText || (options.showCancel ? '确认 · CONFIRM' : '我知道了 · GOT IT'),
      cancelText: options.cancelText || '取消 · CANCEL',
      showCancel: Boolean(options.showCancel),
      closeOnBackdrop: options.closeOnBackdrop ?? true
    }
    isOpen.value = true

    return new Promise((resolve) => {
      resolvePromise = resolve
    })
  }

  function alert(message: string, options?: Omit<DialogOptions, 'message' | 'showCancel'>): Promise<void> {
    return show({
      ...options,
      message,
      showCancel: false
    }).then(() => {})
  }

  function confirm(message: string, options?: Omit<DialogOptions, 'message' | 'showCancel'>): Promise<boolean> {
    return show({
      ...options,
      message,
      showCancel: true,
      type: options?.type || 'warning'
    })
  }

  function handleConfirm() {
    isOpen.value = false
    if (resolvePromise) {
      resolvePromise(true)
      resolvePromise = null
    }
  }

  function handleCancel() {
    isOpen.value = false
    if (resolvePromise) {
      resolvePromise(false)
      resolvePromise = null
    }
  }

  return {
    isOpen,
    currentOptions,
    show,
    alert,
    confirm,
    handleConfirm,
    handleCancel
  }
})
