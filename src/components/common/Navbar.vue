<template>
  <header class="sticky top-0 z-40 w-full border-b-4 border-black bg-white">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <!-- Logo -->
      <div class="flex items-center space-x-6">
        <router-link to="/" class="flex items-center space-x-2.5 group">
          <div class="flex h-10 w-10 items-center justify-center rounded-none bg-[#ccff00] text-black border-2 border-black font-black text-2xl shadow-brutal-sm group-hover:bg-[#ffff00] transition-colors">
            7
          </div>
          <div class="flex flex-col">
            <span class="text-xl font-black tracking-wider text-black">
              LUCKY 7
            </span>
            <span class="text-[10px] -mt-1 text-black font-mono font-bold tracking-widest">ARCADE HUB</span>
          </div>
        </router-link>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center space-x-2">
          <router-link
            to="/"
            class="px-3 py-1.5 rounded-none text-xs font-black uppercase border-2 border-black transition-all"
            :class="$route.path === '/' ? 'text-black bg-[#ccff00] shadow-brutal-sm' : 'text-black bg-white hover:bg-[#ffff00] hover:shadow-brutal-sm'"
          >
            游戏大厅
          </router-link>
          <router-link
            to="/checkin"
            class="px-3 py-1.5 rounded-none text-xs font-black uppercase border-2 border-black transition-all flex items-center space-x-1.5"
            :class="$route.path === '/checkin' ? 'text-black bg-[#ccff00] shadow-brutal-sm' : 'text-black bg-white hover:bg-[#ffff00] hover:shadow-brutal-sm'"
          >
            <span>每日签到</span>
            <span v-if="!walletStore.isCheckedInToday" class="w-2.5 h-2.5 rounded-none bg-[#ff006e] border border-black animate-pulse"></span>
          </router-link>
          <router-link
            to="/leaderboard"
            class="px-3 py-1.5 rounded-none text-xs font-black uppercase border-2 border-black transition-all"
            :class="$route.path === '/leaderboard' ? 'text-black bg-[#ccff00] shadow-brutal-sm' : 'text-black bg-white hover:bg-[#ffff00] hover:shadow-brutal-sm'"
          >
            排行榜
          </router-link>
          <router-link
            to="/records"
            class="px-3 py-1.5 rounded-none text-xs font-black uppercase border-2 border-black transition-all"
            :class="$route.path === '/records' ? 'text-black bg-[#ccff00] shadow-brutal-sm' : 'text-black bg-white hover:bg-[#ffff00] hover:shadow-brutal-sm'"
          >
            战绩历史
          </router-link>
          <!-- 管理员后台专属入口 -->
          <router-link
            v-if="authStore.isAdmin"
            to="/admin"
            class="px-3 py-1.5 rounded-none text-xs font-black uppercase border-2 border-black text-black bg-[#ff9500] hover:bg-[#ffff00] shadow-brutal-sm transition-all flex items-center space-x-1"
          >
            <ShieldAlert class="w-3.5 h-3.5" />
            <span>管理后台</span>
          </router-link>
        </nav>
      </div>

      <!-- Right Action Area -->
      <div class="flex items-center space-x-2.5">
        <!-- Sound Mute Toggle -->
        <button
          @click="toggleSound"
          class="p-2 rounded-none border-2 border-black bg-white text-black shadow-brutal-sm hover:bg-[#ffff00] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          :title="isMuted ? '取消静音' : '静音'"
        >
          <VolumeX v-if="isMuted" class="w-4 h-4 text-[#ff006e]" />
          <Volume2 v-else class="w-4 h-4" />
        </button>

        <!-- User Chips Balance Box -->
        <div class="flex items-center space-x-2 px-3 py-1.5 rounded-none bg-[#ffff00] border-2 border-black shadow-brutal-sm">
          <CoinIcon customClass="w-4 h-4" />
          <span class="text-sm font-black tracking-tight text-black font-mono">
            {{ formattedChips }}
          </span>
          <router-link
            to="/checkin"
            class="text-[11px] font-black text-black bg-[#ccff00] px-1.5 py-0.5 border border-black hover:bg-white transition-colors"
          >
            领币
          </router-link>
        </div>

        <!-- User Profile Dropdown or Login -->
        <div v-if="authStore.isAuthenticated" class="relative">
          <router-link
            to="/profile"
            class="flex items-center space-x-2 px-2 py-1 rounded-none border-2 border-black bg-white hover:bg-[#00d9ff] shadow-brutal-sm transition-colors"
          >
            <img
              :src="avatarUrl"
              class="w-6 h-6 rounded-none border border-black bg-slate-100 object-cover"
              alt="avatar"
            />
            <span class="hidden sm:inline-block text-xs font-black text-black max-w-[90px] truncate font-mono">
              {{ authStore.profile?.nickname || '玩家' }}
            </span>
          </router-link>
        </div>
        <div v-else>
          <router-link
            to="/auth"
            class="brutal-btn-lime px-3.5 py-1.5 text-xs"
          >
            登录 / 注册
          </router-link>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation Subbar -->
    <div class="md:hidden flex items-center justify-around border-t-2 border-black py-2 px-1 bg-white text-xs font-black text-black">
      <router-link to="/" class="px-2 py-1 rounded-none border border-transparent" :class="{'bg-[#ccff00] border-black shadow-brutal-sm': $route.path === '/'}">
        大厅
      </router-link>
      <router-link to="/checkin" class="px-2 py-1 rounded-none border border-transparent" :class="{'bg-[#ccff00] border-black shadow-brutal-sm': $route.path === '/checkin'}">
        签到
      </router-link>
      <router-link to="/leaderboard" class="px-2 py-1 rounded-none border border-transparent" :class="{'bg-[#ccff00] border-black shadow-brutal-sm': $route.path === '/leaderboard'}">
        排行
      </router-link>
      <router-link to="/records" class="px-2 py-1 rounded-none border border-transparent" :class="{'bg-[#ccff00] border-black shadow-brutal-sm': $route.path === '/records'}">
        战绩
      </router-link>
      <router-link v-if="authStore.isAdmin" to="/admin" class="px-2 py-1 rounded-none border border-black bg-[#ff9500] text-black">
        后台
      </router-link>
      <router-link to="/profile" class="px-2 py-1 rounded-none border border-transparent" :class="{'bg-[#ccff00] border-black shadow-brutal-sm': $route.path === '/profile'}">
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
