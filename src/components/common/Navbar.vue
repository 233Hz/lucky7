<template>
  <header class="sticky top-0 z-40 w-full border-b-4 border-[#1a1a1a] bg-[#fffef0]">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <!-- Logo -->
      <div class="flex items-center space-x-6">
        <router-link to="/" class="flex items-center space-x-2 sm:space-x-2.5 group flex-shrink-0">
          <div class="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-[#facc15] text-[#1a1a1a] border-3 border-[#1a1a1a] font-black text-xl sm:text-2xl shadow-[2px_2px_0px_0px_#1a1a1a] sm:shadow-[3px_3px_0px_0px_#1a1a1a] group-hover:-rotate-6 group-hover:scale-110 transition-transform flex-shrink-0">
            7
          </div>
          <div class="flex flex-col">
            <span class="text-base sm:text-xl font-black tracking-wider text-[#1a1a1a] leading-none">
              LUCKY 7
            </span>
            <span class="hidden sm:block text-[10px] text-[#1a1a1a] font-mono font-black tracking-widest mt-0.5">COMIC ARCADE</span>
          </div>
        </router-link>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center space-x-2">
          <router-link
            to="/"
            class="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase border-3 border-[#1a1a1a] transition-all"
            :class="$route.path === '/' ? 'text-[#1a1a1a] bg-[#facc15] shadow-[3px_3px_0px_0px_#1a1a1a] -translate-y-0.5' : 'text-[#1a1a1a] bg-white hover:bg-[#fffef0] hover:shadow-[3px_3px_0px_0px_#1a1a1a]'"
          >
            游戏大厅
          </router-link>
          <router-link
            to="/checkin"
            class="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase border-3 border-[#1a1a1a] transition-all flex items-center space-x-1.5"
            :class="$route.path === '/checkin' ? 'text-[#1a1a1a] bg-[#facc15] shadow-[3px_3px_0px_0px_#1a1a1a] -translate-y-0.5' : 'text-[#1a1a1a] bg-white hover:bg-[#fffef0] hover:shadow-[3px_3px_0px_0px_#1a1a1a]'"
          >
            <span>每日签到</span>
            <span v-if="!walletStore.isCheckedInToday" class="w-2.5 h-2.5 rounded-full bg-[#ef4444] border-2 border-[#1a1a1a] animate-pulse"></span>
          </router-link>
          <router-link
            to="/leaderboard"
            class="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase border-3 border-[#1a1a1a] transition-all"
            :class="$route.path === '/leaderboard' ? 'text-[#1a1a1a] bg-[#facc15] shadow-[3px_3px_0px_0px_#1a1a1a] -translate-y-0.5' : 'text-[#1a1a1a] bg-white hover:bg-[#fffef0] hover:shadow-[3px_3px_0px_0px_#1a1a1a]'"
          >
            排行榜
          </router-link>
          <router-link
            to="/records"
            class="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase border-3 border-[#1a1a1a] transition-all"
            :class="$route.path === '/records' ? 'text-[#1a1a1a] bg-[#facc15] shadow-[3px_3px_0px_0px_#1a1a1a] -translate-y-0.5' : 'text-[#1a1a1a] bg-white hover:bg-[#fffef0] hover:shadow-[3px_3px_0px_0px_#1a1a1a]'"
          >
            战绩历史
          </router-link>
          <!-- 管理员后台专属入口 -->
          <router-link
            v-if="authStore.isAdmin"
            to="/admin"
            class="px-3.5 py-1.5 rounded-lg text-xs font-black uppercase border-3 border-[#1a1a1a] text-white bg-[#ef4444] hover:bg-[#ff3333] shadow-[3px_3px_0px_0px_#1a1a1a] transition-all flex items-center space-x-1"
          >
            <ShieldAlert class="w-3.5 h-3.5" />
            <span>管理后台</span>
          </router-link>
        </nav>
      </div>

      <!-- Right Action Area -->
      <div class="flex items-center space-x-1.5 sm:space-x-2.5 flex-shrink-0">
        <!-- Sound Mute Toggle -->
        <button
          @click="toggleSound"
          class="p-1.5 sm:p-2 rounded-lg border-2 sm:border-3 border-[#1a1a1a] bg-white text-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] sm:shadow-[3px_3px_0px_0px_#1a1a1a] hover:bg-[#facc15] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex-shrink-0"
          :title="isMuted ? '取消静音' : '静音'"
        >
          <VolumeX v-if="isMuted" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ef4444]" />
          <Volume2 v-else class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <!-- User Chips Balance Box -->
        <div class="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#facc15] border-2 sm:border-3 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] sm:shadow-[3px_3px_0px_0px_#1a1a1a] flex-shrink-0">
          <CoinIcon customClass="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span class="text-xs sm:text-sm font-black tracking-tight text-[#1a1a1a] font-mono">
            {{ formattedChips }}
          </span>
          <router-link
            to="/checkin"
            class="text-[10px] sm:text-[11px] font-black text-white bg-[#ef4444] px-1.5 sm:px-2 py-0.5 rounded border border-[#1a1a1a] hover:bg-[#ff3333] shadow-[1px_1px_0px_0px_#1a1a1a] transition-colors ml-0.5"
          >
            领币
          </router-link>
        </div>

        <!-- User Profile Dropdown or Login -->
        <div v-if="authStore.isAuthenticated" class="relative flex-shrink-0">
          <router-link
            to="/profile"
            class="flex items-center space-x-1 sm:space-x-2 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border-2 sm:border-3 border-[#1a1a1a] bg-white hover:bg-[#3b82f6] hover:text-white shadow-[2px_2px_0px_0px_#1a1a1a] sm:shadow-[3px_3px_0px_0px_#1a1a1a] transition-colors group"
          >
            <img
              :src="avatarUrl"
              class="w-5 h-5 sm:w-6 sm:h-6 rounded-md border border-[#1a1a1a] bg-white object-cover"
              alt="avatar"
            />
            <span class="hidden sm:inline-block text-xs font-black text-[#1a1a1a] group-hover:text-white max-w-[90px] truncate font-mono">
              {{ authStore.profile?.nickname || '玩家' }}
            </span>
          </router-link>
        </div>
        <div v-else class="flex-shrink-0">
          <router-link
            to="/auth"
            class="comic-btn-red px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs"
          >
            登录 / 注册
          </router-link>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation Subbar -->
    <div class="md:hidden flex items-center justify-around border-t-2 sm:border-t-3 border-[#1a1a1a] py-1.5 px-1 bg-[#fffef0] text-[11px] font-black text-[#1a1a1a]">
      <router-link to="/" class="px-2 py-0.5 rounded-md border-2" :class="$route.path === '/' ? 'bg-[#facc15] border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]' : 'border-transparent'">
        大厅
      </router-link>
      <router-link to="/checkin" class="px-2 py-0.5 rounded-md border-2" :class="$route.path === '/checkin' ? 'bg-[#facc15] border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]' : 'border-transparent'">
        签到
      </router-link>
      <router-link to="/leaderboard" class="px-2 py-0.5 rounded-md border-2" :class="$route.path === '/leaderboard' ? 'bg-[#facc15] border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]' : 'border-transparent'">
        排行
      </router-link>
      <router-link to="/records" class="px-2 py-0.5 rounded-md border-2" :class="$route.path === '/records' ? 'bg-[#facc15] border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]' : 'border-transparent'">
        战绩
      </router-link>
      <router-link v-if="authStore.isAdmin" to="/admin" class="px-2 py-0.5 rounded-md border-2 border-[#1a1a1a] bg-[#ef4444] text-white shadow-[2px_2px_0px_0px_#1a1a1a]">
        后台
      </router-link>
      <router-link to="/profile" class="px-2 py-0.5 rounded-md border-2" :class="$route.path === '/profile' ? 'bg-[#facc15] border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]' : 'border-transparent'">
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
