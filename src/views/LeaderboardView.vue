<template>
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-8">
    <!-- Header -->
    <div class="text-center space-y-2">
      <h1 class="text-3xl sm:text-4xl font-black text-[#1a1a1a] uppercase font-mono flex items-center justify-center gap-2">
        <Trophy class="w-9 h-9 text-[#1a1a1a]" />
        <span>全服财富排行榜 · RANKING</span>
      </h1>
      <p class="text-xs sm:text-sm text-[#4a4a4a] font-mono font-bold">实时展示全平台顶级竞技高手的总资产分镜排名</p>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-16 space-y-4 font-mono">
      <div class="w-12 h-12 border-4 border-[#1a1a1a] border-t-[#facc15] rounded-full animate-spin"></div>
      <div class="text-sm font-black text-[#1a1a1a]">正在拉取全服风云榜...</div>
    </div>

    <!-- Empty State Display -->
    <div
      v-else-if="leaders.length === 0"
      class="rounded-2xl bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] p-8 sm:p-12 text-center max-w-xl mx-auto relative overflow-hidden"
    >
      <div class="absolute inset-0 bg-[radial-gradient(#1a1a1a_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>

      <div class="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-5 rounded-2xl bg-[#facc15] text-[#1a1a1a] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] flex items-center justify-center -rotate-3 hover:rotate-0 transition-transform">
        <Trophy class="w-10 h-10 sm:w-12 sm:h-12 text-[#1a1a1a]" />
      </div>

      <h2 class="text-xl sm:text-2xl font-black text-[#1a1a1a] font-mono tracking-tight mb-2">
        暂无上榜神豪 · 虚位以待
      </h2>
      <p class="text-xs sm:text-sm font-mono font-bold text-[#1a1a1a]/70 max-w-md mx-auto mb-6 leading-relaxed">
        当前全服财富风云榜暂无排名数据。快去各大游戏对局赢取海量筹码，成为全服首屈一指的赌神吧！
      </p>

      <div class="flex flex-wrap items-center justify-center gap-3 relative z-10">
        <router-link
          to="/"
          class="comic-btn-yellow px-5 py-2.5 text-xs sm:text-sm font-black inline-flex items-center gap-1.5"
        >
          <Gamepad2 class="w-4 h-4" />
          <span>前往游戏大厅开战</span>
        </router-link>
        <router-link
          to="/checkin"
          class="comic-btn-red px-5 py-2.5 text-xs sm:text-sm font-black inline-flex items-center gap-1.5"
        >
          <Gift class="w-4 h-4" />
          <span>每日签到免费领币</span>
        </router-link>
      </div>
    </div>

    <!-- Data Loaded State -->
    <template v-else>
      <!-- Top Podium Cards (Dynamic 1-3 players) -->
      <div class="flex flex-wrap justify-center items-end gap-3 sm:gap-6 pt-6">
        <!-- Rank 2: Silver / Blue Panel (Shown if at least 2 players) -->
        <div
          v-if="leaders.length >= 2"
          class="order-1 flex-1 min-w-[100px] max-w-[180px] sm:max-w-[220px] flex flex-col items-center p-3 sm:p-5 rounded-lg bg-[#3b82f6] text-white border-3 sm:border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] sm:shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] text-center font-mono"
        >
          <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-[#1a1a1a] text-[#3b82f6] flex items-center justify-center mb-1 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
            <Medal class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <img :src="leaders[1]?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=rank2'" class="w-10 h-10 sm:w-12 sm:h-12 rounded-md border-2 sm:border-3 border-[#1a1a1a] bg-white mb-1.5 shadow-[2px_2px_0px_0px_#1a1a1a] object-cover" />
          <div class="text-xs sm:text-sm font-black text-white truncate max-w-[80px] sm:max-w-[110px]">{{ leaders[1]?.nickname }}</div>
          <div class="text-[11px] sm:text-xs font-black text-white mt-0.5 flex items-center justify-center gap-1">
            <CoinIcon customClass="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{{ formatChips(leaders[1]?.chips) }}</span>
          </div>
          <span class="mt-2 text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 rounded-md bg-[#1a1a1a] text-white font-black uppercase border border-[#1a1a1a] shadow-[1px_1px_0px_0px_#1a1a1a]">榜眼 #2</span>
        </div>

        <!-- Rank 1: Gold / Yellow Comic Cover Panel (Center & Taller) -->
        <div class="order-2 flex-1 min-w-[110px] max-w-[200px] sm:max-w-[240px] flex flex-col items-center p-4 sm:p-7 rounded-lg bg-[#facc15] text-[#1a1a1a] border-4 border-[#1a1a1a] shadow-[6px_6px_0px_0px_#1a1a1a] sm:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] text-center scale-105 z-10 font-mono">
          <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-[#1a1a1a] text-[#facc15] flex items-center justify-center mb-1.5 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
            <Crown class="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <img :src="leaders[0]?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=rank1'" class="w-12 h-12 sm:w-16 sm:h-16 rounded-md border-3 border-[#1a1a1a] bg-white mb-1.5 sm:mb-2 shadow-[2px_2px_0px_0px_#1a1a1a] sm:shadow-[3px_3px_0px_0px_#1a1a1a] object-cover" />
          <div class="text-xs sm:text-base font-black text-[#1a1a1a] truncate max-w-[95px] sm:max-w-[130px]">{{ leaders[0]?.nickname }}</div>
          <div class="text-xs sm:text-sm font-black text-[#1a1a1a] mt-0.5 sm:mt-1 flex items-center justify-center gap-1">
            <CoinIcon customClass="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{{ formatChips(leaders[0]?.chips) }}</span>
          </div>
          <span class="mt-2 text-[10px] sm:text-[11px] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-md bg-[#1a1a1a] text-[#facc15] font-black uppercase border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">状元 · 赌神 #1</span>
        </div>

        <!-- Rank 3: Red Panel (Shown if at least 3 players) -->
        <div
          v-if="leaders.length >= 3"
          class="order-3 flex-1 min-w-[100px] max-w-[180px] sm:max-w-[220px] flex flex-col items-center p-3 sm:p-5 rounded-lg bg-[#ef4444] text-white border-3 sm:border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] sm:shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] text-center font-mono"
        >
          <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-[#1a1a1a] text-[#ef4444] flex items-center justify-center mb-1 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
            <Award class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <img :src="leaders[2]?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=rank3'" class="w-10 h-10 sm:w-12 sm:h-12 rounded-md border-2 sm:border-3 border-[#1a1a1a] bg-white mb-1.5 shadow-[2px_2px_0px_0px_#1a1a1a] object-cover" />
          <div class="text-xs sm:text-sm font-black text-white truncate max-w-[80px] sm:max-w-[110px]">{{ leaders[2]?.nickname }}</div>
          <div class="text-[11px] sm:text-xs font-black text-white mt-0.5 flex items-center justify-center gap-1">
            <CoinIcon customClass="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{{ formatChips(leaders[2]?.chips) }}</span>
          </div>
          <span class="mt-2 text-[9px] sm:text-[10px] px-2 sm:px-2.5 py-0.5 rounded-md bg-[#1a1a1a] text-white font-black uppercase border border-[#1a1a1a] shadow-[1px_1px_0px_0px_#1a1a1a]">探花 #3</span>
        </div>
      </div>

      <!-- Rest of the Leaderboard Table (Only rendered when there are more than 3 players) -->
      <div
        v-if="leaders.length > 3"
        class="rounded-lg bg-white border-3 sm:border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] sm:shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] overflow-hidden"
      >
        <div class="divide-y-2 sm:divide-y-3 divide-[#1a1a1a]">
          <div
            v-for="(user, idx) in leaders.slice(3)"
            :key="user.id"
            class="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 hover:bg-[#fffef0] transition-colors"
          >
            <div class="flex items-center space-x-2.5 sm:space-x-4">
              <span class="w-6 sm:w-7 text-center font-mono font-black text-[#1a1a1a] text-sm sm:text-base">#{{ idx + 4 }}</span>
              <img :src="user.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.id" class="w-8 h-8 sm:w-9 sm:h-9 rounded-md border-2 border-[#1a1a1a] bg-white object-cover" />
              <span class="text-xs sm:text-sm font-black text-[#1a1a1a] font-mono truncate max-w-[110px] sm:max-w-[200px]">{{ user.nickname }}</span>
            </div>
            <div class="text-xs sm:text-sm font-mono font-black text-[#1a1a1a] flex items-center gap-1 sm:gap-1.5">
              <CoinIcon customClass="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{{ formatChips(user.chips) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Trophy, Medal, Crown, Award, Gamepad2, Gift } from 'lucide-vue-next'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import CoinIcon from '@/components/common/CoinIcon.vue'
import type { Profile } from '@/types/database'

const leaders = ref<Profile[]>([])
const loading = ref<boolean>(true)

function formatChips(val?: number): string {
  return new Intl.NumberFormat('en-US').format(val ?? 0)
}

onMounted(async () => {
  loading.value = true
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('chips', { ascending: false })
        .limit(20)

      if (!error && data) {
        leaders.value = data as Profile[]
        loading.value = false
        return
      }
    } catch (e) {
      console.error('Fetch leaderboard error:', e)
    } finally {
      loading.value = false
    }
  } else {
    // 纯离线/本地环境：检查是否有本地存储或展示初始列表
    loading.value = false
    leaders.value = [
      { id: '1', email: 'king@lucky7.game', nickname: '亚洲赌王高进', avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=king', chips: 1888000, is_admin: false },
      { id: '2', email: 'star@lucky7.game', nickname: '特异功能阿星', avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=star', chips: 990000, is_admin: false },
      { id: '3', email: 'knife@lucky7.game', nickname: '赌侠陈小刀', avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=knife', chips: 650000, is_admin: false },
      { id: '4', email: 'poker1@lucky7.game', nickname: '德扑老法师', avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=p1', chips: 320000, is_admin: false },
      { id: '5', email: 'dice_master@lucky7.game', nickname: '骰子大魔王', avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=p2', chips: 210000, is_admin: false },
      { id: '6', email: 'luckylady@lucky7.game', nickname: '六合彩锦鲤', avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=p3', chips: 154000, is_admin: false }
    ]
  }
})
</script>
