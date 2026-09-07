<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md space-y-6">
      <!-- Logo & Heading -->
      <div class="text-center space-y-2">
        <div class="inline-flex h-14 w-14 items-center justify-center rounded-none bg-[#ccff00] text-black font-black text-3xl border-3 border-black shadow-brutal">
          7
        </div>
        <h2 class="text-3xl font-black text-black uppercase tracking-tight font-mono">
          {{ isSignUp ? '创建 LUCKY 7 账号' : '登录 LUCKY 7 大厅' }}
        </h2>
        <p class="text-xs text-black font-mono font-bold flex items-center justify-center gap-1">
          <span v-if="isSignUp" class="flex items-center gap-1">
            <span>注册即送 10,000</span>
            <CoinIcon customClass="w-3.5 h-3.5" />
            <span>虚拟体验筹码</span>
          </span>
          <span v-else>随时随地，开启硬派竞技之旅</span>
        </p>
      </div>

      <!-- Auth Form Card -->
      <div class="rounded-none bg-white border-4 border-black p-6 sm:p-8 shadow-brutal-xl space-y-5">
        <!-- Tab Switcher -->
        <div class="grid grid-cols-2 p-1 rounded-none bg-[#f4f4f0] border-2 border-black text-xs font-black font-mono gap-1">
          <button
            type="button"
            @click="isSignUp = false"
            class="py-2 rounded-none transition-all"
            :class="!isSignUp ? 'bg-[#ccff00] text-black border-2 border-black shadow-brutal-sm' : 'text-black hover:bg-white border-2 border-transparent'"
          >
            登录已有账号
          </button>
          <button
            type="button"
            @click="isSignUp = true"
            class="py-2 rounded-none transition-all"
            :class="isSignUp ? 'bg-[#ccff00] text-black border-2 border-black shadow-brutal-sm' : 'text-black hover:bg-white border-2 border-transparent'"
          >
            注册新用户
          </button>
        </div>

        <!-- Error Alert -->
        <div
          v-if="authStore.authError"
          class="p-3 rounded-none bg-[#ff006e] border-2 border-black text-white text-xs font-mono font-bold flex items-center space-x-2 shadow-brutal-sm"
        >
          <AlertCircle class="w-4 h-4 flex-shrink-0" />
          <span>{{ authStore.authError }}</span>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Nickname (only on sign up) -->
          <div v-if="isSignUp">
            <label class="block text-xs font-black text-black uppercase mb-1 font-mono">玩家昵称</label>
            <input
              v-model="nickname"
              type="text"
              required
              placeholder="例如: 赌圣阿星"
              class="brutal-input w-full px-3.5 py-2.5 text-sm placeholder-slate-400"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-xs font-black text-black uppercase mb-1 font-mono">电子邮箱</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="player@example.com"
              class="brutal-input w-full px-3.5 py-2.5 text-sm placeholder-slate-400"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-xs font-black text-black uppercase mb-1 font-mono">密码</label>
            <input
              v-model="password"
              type="password"
              required
              minlength="6"
              placeholder="••••••••"
              class="brutal-input w-full px-3.5 py-2.5 text-sm placeholder-slate-400"
            />
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="brutal-btn-lime w-full py-3.5 text-sm font-black mt-2 flex items-center justify-center gap-1.5"
          >
            <span>{{ authStore.loading ? '处理中...' : (isSignUp ? '立即注册并获取 10,000' : '登录大厅') }}</span>
            <CoinIcon v-if="isSignUp && !authStore.loading" customClass="w-4 h-4" />
          </button>
        </form>

        <div class="relative flex items-center justify-center my-2">
          <div class="border-t-2 border-black w-full"></div>
          <span class="bg-white px-3 text-xs font-mono font-black text-black uppercase tracking-widest absolute">或</span>
        </div>

        <!-- Quick Guest Demo Entry -->
        <button
          type="button"
          @click="handleGuestLogin"
          class="brutal-btn-orange w-full py-3 text-xs font-black flex items-center justify-center space-x-1.5"
        >
          <Zap class="w-4 h-4 mr-1 text-black" />
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
