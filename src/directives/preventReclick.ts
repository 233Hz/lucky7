import type { Directive, DirectiveBinding } from 'vue'

interface PreventReclickElement extends HTMLElement {
  __preventReclickTimer__?: number | ReturnType<typeof setTimeout>
  __preventReclickClickHandler__?: (e: MouseEvent) => void
}

/**
 * v-prevent-reclick
 * Prevents duplicate clicks on buttons within a cooldown interval (default 800ms).
 * Usage:
 *   <button v-prevent-reclick ...>
 *   <button v-prevent-reclick="1200" ...>
 */
export const preventReclick: Directive<PreventReclickElement, number | undefined> = {
  mounted(el: PreventReclickElement, binding: DirectiveBinding<number | undefined>) {
    const delay = typeof binding.value === 'number' ? binding.value : 800

    el.__preventReclickClickHandler__ = (e: MouseEvent) => {
      // If already undergoing debounce, stop event propagation
      if (el.dataset.reclickBlocked === 'true') {
        e.stopImmediatePropagation()
        e.preventDefault()
        return
      }

      el.dataset.reclickBlocked = 'true'
      el.style.pointerEvents = 'none'

      el.__preventReclickTimer__ = setTimeout(() => {
        el.dataset.reclickBlocked = 'false'
        el.style.pointerEvents = ''
      }, delay)
    }

    el.addEventListener('click', el.__preventReclickClickHandler__, true)
  },

  unmounted(el: PreventReclickElement) {
    if (el.__preventReclickTimer__) {
      clearTimeout(el.__preventReclickTimer__)
    }
    if (el.__preventReclickClickHandler__) {
      el.removeEventListener('click', el.__preventReclickClickHandler__, true)
    }
  }
}
