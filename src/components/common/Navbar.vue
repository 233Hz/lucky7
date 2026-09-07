<template>
  <header class="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <!-- Logo -->
      <div class="flex items-center space-x-6">
        <router-link to="/" class="flex items-center space-x-2.5 group">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white font-black text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            7
          </div>
          <div class="flex flex-col">
            <span class="text-lg font-extrabold tracking-wider bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              LUCKY 7
            </span>
            <span class="text-[10px] -mt-1 text-slate-400 font-medium tracking-widest">ARCADE HUB</span>
          </div>
        </router-link>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center space-x-1">
          <router-link
            to="/"
            class="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors"
            :class="$route.path === '/' ? 'text-emerald-400 bg-emerald-950/50 border border-emerald-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'"
          >
            游戏大厅
          </router-link>
          <router-link
            to="/checkin"
            class="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5"
            :class="$route.path === '/checkin' ? 'text-emerald-400 bg-emerald-950/50 border border-emerald-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'"
          >
            <span>每日签到</span>
            <span v-if="!walletStore.isCheckedInToday" class="flex h-2 w-2 relative">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          </router-link>
          <router-link
            to="/leaderboard"
            class="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors"
            :class="$route.path === '/leaderboard' ? 'text-emerald-400 bg-emerald-950/50 border border-emerald-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'"
          >
            排行榜
          </router-link>
          <router-link
            to="/records"
            class="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors"
            :class="$route.path === '/records' ? 'text-emerald-400 bg-emerald-950/50 border border-emerald-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'"
          >
            战绩历史
          </router-link>
          <!-- 管理员后台专属入口 -->
          <router-link
            v-if="authStore.isAdmin"
            to="/admin"
            class="px-3.5 py-1.5 rounded-lg text-sm font-medium text-amber-400 bg-amber-950/40 border border-amber-800/50 hover:bg-amber-900/50 transition-colors flex items-center space-x-1"
          >
            <ShieldAlert class="w-3.5 h-3.5" />
            <span>管理后台</span>
          </router-link>
        </nav>
      </div>

      <!-- Right Action Area -->
      <div class="flex items-center space-x-3">
        <!-- Sound Mute Toggle -->
        <button
          @click="toggleSound"
          class="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          :title="isMuted ? '取消静音' : '静音'"
        >
          <VolumeX v-if="isMuted" class="w-5 h-5 text-rose-400" />
          <Volume2 v-else class="w-5 h-5" />
        </button>

        <!-- User Chips Balance Pill -->
        <div class="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 shadow-inner">
          <CoinIcon customClass="w-4 h-4" />
          <span class="text-sm font-bold tracking-tight text-amber-300 font-mono">
            {{ formattedChips }}
          </span>
          <router-link
            to="/checkin"
            class="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 ml-1 underline decoration-emerald-500/40"
          >
            领币
          </router-link>
        </div>

        <!-- User Profile Dropdown or Login -->
        <div v-if="authStore.isAuthenticated" class="relative">
          <router-link
            to="/profile"
            class="flex items-center space-x-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-800"
          >
            <img
              :src="avatarUrl"
              class="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 object-cover"
              alt="avatar"
            />
            <span class="hidden sm:inline-block text-xs font-medium text-slate-300 max-w-[90px] truncate">
              {{ authStore.profile?.nickname || '玩家' }}
            </span>
          </router-link>
        </div>
        <div v-else>
          <router-link
            to="/auth"
            class="px-4 py-1.5 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm shadow-emerald-600/30"
          >
            登录 / 注册
          </router-link>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation Subbar -->
    <div class="md:hidden flex items-center justify-around border-t border-slate-800/60 py-2 px-2 bg-slate-950/90 text-xs text-slate-400">
      <router-link to="/" class="px-2 py-1" :class="{'text-emerald-400 font-semibold': $route.path === '/'}">
        大厅
      </router-link>
      <router-link to="/checkin" class="px-2 py-1" :class="{'text-emerald-400 font-semibold': $route.path === '/checkin'}">
        签到
      </router-link>
      <router-link to="/leaderboard" class="px-2 py-1" :class="{'text-emerald-400 font-semibold': $route.path === '/leaderboard'}">
        排行
      </router-link>
      <router-link to="/records" class="px-2 py-1" :class="{'text-emerald-400 font-semibold': $route.path === '/records'}">
        战绩
      </router-link>
      <router-link v-if="authStore.isAdmin" to="/admin" class="px-2 py-1 text-amber-400 font-semibold">
        后台
      </router-link>
      <router-link to="/profile" class="px-2 py-1" :class="{'text-emerald-400 font-semibold': $route.path === '/profile'}">
        我的
      </router-link>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Volume2, VolumeX, ShieldAlert } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { sound } from '@/lib/sound'
import CoinIcon from './CoinIcon.vue'

const authStore = useAuthStore()
const walletStore = useWalletStore()
const isMuted = ref(sound.isMuted())

const formattedChips = computed(() => {
  const chips = authStore.userChips
  return new Intl.NumberFormat('en-US').format(chips)
})

const avatarUrl = computed(() => {
  return authStore.profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${authStore.profile?.id || 'guest'}`
})

function toggleSound() {
  isMuted.value = sound.toggleMute()
  if (!isMuted.value) sound.playClick()
}
</script>
