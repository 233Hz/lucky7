<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md space-y-6">
      <!-- Logo & Heading -->
      <div class="text-center space-y-2">
        <div class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white font-black text-2xl shadow-lg shadow-emerald-500/20">
          7
        </div>
        <h2 class="text-2xl font-extrabold text-white tracking-tight">
          {{ isSignUp ? '创建 Lucky 7 账号' : '登录 Lucky 7 大厅' }}
        </h2>
        <p class="text-xs text-slate-400 flex items-center justify-center gap-1">
          <span v-if="isSignUp" class="flex items-center gap-1">
            <span>注册即送 10,000</span>
            <CoinIcon customClass="w-3.5 h-3.5" />
            <span>虚拟体验筹码</span>
          </span>
          <span v-else>随时随地，开启你的竞技之旅</span>
        </p>
      </div>

      <!-- Auth Form Card -->
      <div class="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-5">
        <!-- Tab Switcher -->
        <div class="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            @click="isSignUp = false"
            class="py-2 rounded-lg transition-all"
            :class="!isSignUp ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'"
          >
            登录已有账号
          </button>
          <button
            type="button"
            @click="isSignUp = true"
            class="py-2 rounded-lg transition-all"
            :class="isSignUp ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'"
          >
            注册新用户
          </button>
        </div>

        <!-- Error Alert -->
        <div
          v-if="authStore.authError"
          class="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2"
        >
          <AlertCircle class="w-4 h-4 flex-shrink-0" />
          <span>{{ authStore.authError }}</span>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Nickname (only on sign up) -->
          <div v-if="isSignUp">
            <label class="block text-xs font-semibold text-slate-400 mb-1">玩家昵称</label>
            <input
              v-model="nickname"
              type="text"
              required
              placeholder="例如: 赌圣阿星"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">电子邮箱</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="player@example.com"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">密码</label>
            <input
              v-model="password"
              type="password"
              required
              minlength="6"
              placeholder="••••••••"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-1.5"
          >
            <span>{{ authStore.loading ? '处理中...' : (isSignUp ? '立即注册并获取 10,000' : '登录') }}</span>
            <CoinIcon v-if="isSignUp && !authStore.loading" customClass="w-4 h-4" />
          </button>
        </form>

        <div class="relative flex items-center justify-center my-2">
          <div class="border-t border-slate-800 w-full"></div>
          <span class="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-widest absolute">或</span>
        </div>

        <!-- Quick Guest Demo Entry -->
        <button
          type="button"
          @click="handleGuestLogin"
          class="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all flex items-center justify-center space-x-1.5"
        >
          <Zap class="w-4 h-4 text-amber-400" />
          <span>一键免密快速试玩</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AlertCircle, Zap } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import CoinIcon from '@/components/common/CoinIcon.vue'

const router = useRouter()
const authStore = useAuthStore()

const isSignUp = ref(false)
const email = ref('')
const password = ref('')
const nickname = ref('')

async function handleSubmit() {
  let ok = false
  if (isSignUp.value) {
    ok = await authStore.signUp(email.value, password.value, nickname.value)
  } else {
    ok = await authStore.signIn(email.value, password.value)
  }

  if (ok) {
    router.push('/')
  }
}

async function handleGuestLogin() {
  await authStore.signIn('guest_' + Math.floor(Math.random() * 1000) + '@lucky7.game', 'guest123456')
  router.push('/')
}
</script>
