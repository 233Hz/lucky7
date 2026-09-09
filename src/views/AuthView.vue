<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md space-y-6">
      <!-- Logo & Heading -->
      <div class="text-center space-y-2">
        <div class="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-[#facc15] text-[#1a1a1a] font-black text-3xl border-3 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] -rotate-3">
          7
        </div>
        <h2 class="text-3xl font-black text-[#1a1a1a] uppercase tracking-tight font-mono">
          {{ isSignUp ? '创建 LUCKY 7 账号' : '登录 LUCKY 7 大厅' }}
        </h2>
        <p class="text-xs text-[#4a4a4a] font-mono font-bold flex items-center justify-center gap-1">
          <span v-if="isSignUp" class="flex items-center gap-1">
            <span>注册即送 10,000</span>
            <CoinIcon customClass="w-3.5 h-3.5" />
            <span>虚拟体验筹码</span>
          </span>
          <span v-else>随时随地，开启热血漫画竞技之旅</span>
        </p>
      </div>

      <!-- Auth Form Card -->
      <div class="rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] space-y-5">
        <!-- Tab Switcher -->
        <div class="grid grid-cols-2 p-1.5 rounded-lg bg-white border-3 border-[#1a1a1a] text-xs font-black font-mono gap-1">
          <button
            type="button"
            @click="isSignUp = false; authStore.authError = null"
            class="py-2 rounded-md transition-all"
            :class="!isSignUp ? 'bg-[#facc15] text-[#1a1a1a] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]' : 'text-[#1a1a1a] hover:bg-[#fffef0] border-2 border-transparent'"
          >
            登录已有账号
          </button>
          <button
            type="button"
            @click="isSignUp = true; authStore.authError = null"
            class="py-2 rounded-md transition-all"
            :class="isSignUp ? 'bg-[#facc15] text-[#1a1a1a] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]' : 'text-[#1a1a1a] hover:bg-[#fffef0] border-2 border-transparent'"
          >
            注册新用户
          </button>
        </div>

        <!-- Error Alert -->
        <div
          v-if="authStore.authError"
          class="p-3 rounded-md bg-[#ef4444] border-2 border-[#1a1a1a] text-white text-xs font-mono font-bold flex items-center space-x-2 shadow-[2px_2px_0px_0px_#1a1a1a]"
        >
          <AlertCircle class="w-4 h-4 flex-shrink-0" />
          <span>{{ authStore.authError }}</span>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Nickname (only on sign up) -->
          <div v-if="isSignUp">
            <label class="block text-xs font-black text-[#1a1a1a] uppercase mb-1 font-mono">玩家昵称</label>
            <input
              v-model="nickname"
              type="text"
              required
              placeholder="例如: 赌圣阿星"
              class="comic-input w-full px-3.5 py-2.5 text-sm"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-xs font-black text-[#1a1a1a] uppercase mb-1 font-mono">电子邮箱</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="player@example.com"
              class="comic-input w-full px-3.5 py-2.5 text-sm"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-xs font-black text-[#1a1a1a] uppercase mb-1 font-mono">密码</label>
            <input
              v-model="password"
              type="password"
              required
              minlength="6"
              placeholder="••••••••"
              class="comic-input w-full px-3.5 py-2.5 text-sm"
            />
          </div>

          <!-- Submit Button -->
          <button
            v-prevent-reclick
            type="submit"
            :disabled="authStore.loading || isSubmitting"
            class="comic-btn-red w-full py-3.5 text-sm font-black mt-2 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <span>{{ (authStore.loading || isSubmitting) ? '处理中...' : (isSignUp ? '立即注册并获取 10,000' : '登录大厅 · ENTER') }}</span>
            <CoinIcon v-if="isSignUp && !authStore.loading && !isSubmitting" customClass="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AlertCircle } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import CoinIcon from '@/components/common/CoinIcon.vue'

const router = useRouter()
const authStore = useAuthStore()

const isSignUp = ref(false)
const email = ref('')
const password = ref('')
const nickname = ref('')
const isSubmitting = ref(false)

async function handleSubmit() {
  if (isSubmitting.value || authStore.loading) return
  isSubmitting.value = true
  try {
    let ok = false
    if (isSignUp.value) {
      ok = await authStore.signUp(email.value, password.value, nickname.value)
    } else {
      ok = await authStore.signIn(email.value, password.value)
    }

    if (ok) {
      router.push('/')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
