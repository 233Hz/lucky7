import { useDialogStore, type DialogOptions } from '@/stores/dialog'

export const dialog = {
  alert(message: string, options?: Omit<DialogOptions, 'message' | 'showCancel'>): Promise<void> {
    return useDialogStore().alert(message, options)
  },

  confirm(message: string, options?: Omit<DialogOptions, 'message' | 'showCancel'>): Promise<boolean> {
    return useDialogStore().confirm(message, options)
  },

  warning(message: string, options?: Omit<DialogOptions, 'message' | 'showCancel' | 'type'>): Promise<void> {
    return useDialogStore().alert(message, { ...options, type: 'warning' })
  },

  error(message: string, options?: Omit<DialogOptions, 'message' | 'showCancel' | 'type'>): Promise<void> {
    return useDialogStore().alert(message, { ...options, type: 'error' })
  },

  success(message: string, options?: Omit<DialogOptions, 'message' | 'showCancel' | 'type'>): Promise<void> {
    return useDialogStore().alert(message, { ...options, type: 'success' })
  },

  info(message: string, options?: Omit<DialogOptions, 'message' | 'showCancel' | 'type'>): Promise<void> {
    return useDialogStore().alert(message, { ...options, type: 'info' })
  }
}

// 自动拦截浏览器原生 window.alert，保证全项目任何角落弹出均遵循统一美观的漫画风格 UI
export function setupGlobalAlertInterception() {
  if (typeof window !== 'undefined') {
    window.alert = (message?: any) => {
      dialog.alert(message !== undefined && message !== null ? String(message) : '')
    }
  }
}
