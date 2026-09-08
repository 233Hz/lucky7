<template>
  <div ref="containerRef" class="relative inline-block" :class="[customClass, fullWidth ? 'w-full' : '']">
    <!-- Trigger Button -->
    <button
      type="button"
      @click="toggleDropdown"
      @keydown.down.prevent="navigateOption(1)"
      @keydown.up.prevent="navigateOption(-1)"
      @keydown.esc="closeDropdown"
      :disabled="disabled"
      class="comic-select-trigger flex items-center justify-between gap-2.5 transition-all select-none text-left font-mono"
      :class="[
        triggerClass,
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white',
        isOpen ? 'bg-white shadow-[4px_4px_0px_0px_#1a1a1a] -translate-x-[1px] -translate-y-[1px]' : ''
      ]"
    >
      <div class="flex items-center gap-2 truncate flex-1 min-w-0">
        <component v-if="selectedOption?.icon" :is="selectedOption.icon" class="w-4 h-4 flex-shrink-0" />
        <span class="truncate font-black">{{ selectedOption?.label ?? placeholder }}</span>
      </div>

      <ChevronDown
        class="w-4 h-4 text-[#1a1a1a] transition-transform duration-200 flex-shrink-0 stroke-[2.5]"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Dropdown Panel (下拉面板) -->
    <Transition
      enter-active-class="transition ease-out duration-150 transform"
      enter-from-class="opacity-0 -translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition ease-in duration-100 transform"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-2 scale-95"
    >
      <div
        v-if="isOpen"
        class="comic-select-panel absolute left-0 top-full mt-1.5 z-50 rounded-lg border-3 sm:border-4 border-[#1a1a1a] bg-[#fffef0] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] overflow-hidden font-mono"
        :class="[panelClass, fullWidth ? 'w-full' : 'min-w-full w-max max-w-xs sm:max-w-sm']"
      >
        <div class="max-h-64 overflow-y-auto py-1 divide-y-2 divide-[#1a1a1a]/10">
          <div
            v-for="opt in normalizedOptions"
            :key="String(opt.value)"
            @click="selectOption(opt)"
            class="px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs font-black transition-colors cursor-pointer select-none"
            :class="[
              opt.disabled ? 'opacity-40 cursor-not-allowed' : (
                isSelected(opt.value)
                  ? 'bg-[#1a1a1a] text-white'
                  : 'text-[#1a1a1a] hover:bg-[#facc15] hover:text-[#1a1a1a]'
              )
            ]"
          >
            <div class="flex items-center gap-2.5 truncate">
              <component v-if="opt.icon" :is="opt.icon" class="w-4 h-4 flex-shrink-0" />
              <span class="truncate">{{ opt.label }}</span>
              <span
                v-if="opt.badge"
                class="px-1.5 py-0.5 rounded text-[10px] border border-[#1a1a1a] font-bold"
                :class="isSelected(opt.value) ? 'bg-[#facc15] text-[#1a1a1a]' : 'bg-white text-[#1a1a1a]'"
              >
                {{ opt.badge }}
              </span>
            </div>

            <Check
              v-if="isSelected(opt.value)"
              class="w-4 h-4 stroke-[3] text-[#facc15] flex-shrink-0"
            />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ChevronDown, Check } from 'lucide-vue-next'
import { sound } from '@/lib/sound'

export interface SelectOption {
  label: string
  value: string | number
  icon?: any
  badge?: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue: string | number
    options: (string | number | SelectOption)[]
    placeholder?: string
    disabled?: boolean
    triggerClass?: string
    panelClass?: string
    fullWidth?: boolean
    customClass?: string
  }>(),
  {
    placeholder: '请选择...',
    disabled: false,
    triggerClass: '',
    panelClass: '',
    fullWidth: false,
    customClass: ''
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', val: string | number): void
  (e: 'change', val: string | number): void
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const normalizedOptions = computed<SelectOption[]>(() => {
  return props.options.map(opt => {
    if (typeof opt === 'object' && opt !== null) {
      return opt as SelectOption
    }
    return {
      label: String(opt),
      value: opt
    }
  })
})

const selectedOption = computed(() => {
  return normalizedOptions.value.find(opt => opt.value === props.modelValue)
})

function isSelected(val: string | number) {
  return val === props.modelValue
}

function toggleDropdown() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  sound.playClick()
}

function closeDropdown() {
  isOpen.value = false
}

function selectOption(opt: SelectOption) {
  if (opt.disabled) return
  emit('update:modelValue', opt.value)
  emit('change', opt.value)
  sound.playClick()
  isOpen.value = false
}

function navigateOption(direction: number) {
  if (!isOpen.value) {
    isOpen.value = true
    return
  }
  const currentIndex = normalizedOptions.value.findIndex(o => o.value === props.modelValue)
  const nextIndex = currentIndex + direction
  if (nextIndex >= 0 && nextIndex < normalizedOptions.value.length) {
    const nextOpt = normalizedOptions.value[nextIndex]
    if (!nextOpt.disabled) {
      selectOption(nextOpt)
    }
  }
}

function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleClickOutside)
})
</script>
