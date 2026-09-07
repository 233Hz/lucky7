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

    <!-- Top 3 Podium Cards -->
    <div v-if="leaders.length >= 3" class="grid grid-cols-3 gap-3 sm:gap-6 items-end pt-6">
      <!-- Rank 2: Silver / Blue Panel -->
      <div class="order-1 flex flex-col items-center p-4 sm:p-5 rounded-lg bg-[#3b82f6] text-white border-4 border-[#1a1a1a] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] text-center font-mono">
        <div class="w-8 h-8 rounded-md bg-[#1a1a1a] text-[#3b82f6] flex items-center justify-center mb-1.5 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
          <Medal class="w-4 h-4" />
        </div>
        <img :src="leaders[1]?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=rank2'" class="w-12 h-12 rounded-md border-3 border-[#1a1a1a] bg-white mb-2 shadow-[2px_2px_0px_0px_#1a1a1a]" />
        <div class="text-xs sm:text-sm font-black text-white truncate max-w-[90px]">{{ leaders[1]?.nickname }}</div>
        <div class="text-xs font-black text-white mt-1 flex items-center justify-center gap-1">
          <CoinIcon customClass="w-3.5 h-3.5" />
          <span>{{ formatChips(leaders[1]?.chips) }}</span>
        </div>
        <span class="mt-2 text-[10px] px-2.5 py-0.5 rounded-md bg-[#1a1a1a] text-white font-black uppercase border border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">榜眼 #2</span>
      </div>

      <!-- Rank 1: Gold / Yellow Comic Cover Panel (Center & Taller) -->
      <div class="order-2 flex flex-col items-center p-5 sm:p-7 rounded-lg bg-[#facc15] text-[#1a1a1a] border-4 border-[#1a1a1a] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] text-center scale-105 z-10 font-mono">
        <div class="w-10 h-10 rounded-md bg-[#1a1a1a] text-[#facc15] flex items-center justify-center mb-2 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
          <Crown class="w-6 h-6" />
        </div>
        <img :src="leaders[0]?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=rank1'" class="w-16 h-16 rounded-md border-3 border-[#1a1a1a] bg-white mb-2 shadow-[3px_3px_0px_0px_#1a1a1a]" />
        <div class="text-sm sm:text-base font-black text-[#1a1a1a] truncate max-w-[120px]">{{ leaders[0]?.nickname }}</div>
        <div class="text-sm font-black text-[#1a1a1a] mt-1 flex items-center justify-center gap-1">
          <CoinIcon customClass="w-4 h-4" />
          <span>{{ formatChips(leaders[0]?.chips) }}</span>
        </div>
        <span class="mt-2 text-[11px] px-3 py-1 rounded-md bg-[#1a1a1a] text-[#facc15] font-black uppercase border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">状元 · 赌神 #1</span>
      </div>

      <!-- Rank 3: Red Panel -->
      <div class="order-3 flex flex-col items-center p-4 sm:p-5 rounded-lg bg-[#ef4444] text-white border-4 border-[#1a1a1a] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] text-center font-mono">
        <div class="w-8 h-8 rounded-md bg-[#1a1a1a] text-[#ef4444] flex items-center justify-center mb-1.5 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
          <Award class="w-4 h-4" />
        </div>
        <img :src="leaders[2]?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=rank3'" class="w-12 h-12 rounded-md border-3 border-[#1a1a1a] bg-white mb-2 shadow-[2px_2px_0px_0px_#1a1a1a]" />
        <div class="text-xs sm:text-sm font-black text-white truncate max-w-[90px]">{{ leaders[2]?.nickname }}</div>
        <div class="text-xs font-black text-white mt-1 flex items-center justify-center gap-1">
          <CoinIcon customClass="w-3.5 h-3.5" />
          <span>{{ formatChips(leaders[2]?.chips) }}</span>
        </div>
        <span class="mt-2 text-[10px] px-2.5 py-0.5 rounded-md bg-[#1a1a1a] text-white font-black uppercase border border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">探花 #3</span>
      </div>
    </div>

    <!-- Rest of the Leaderboard Table -->
    <div class="rounded-lg bg-white border-4 border-[#1a1a1a] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] overflow-hidden">
      <div class="divide-y-3 divide-[#1a1a1a]">
        <div
          v-for="(user, idx) in leaders.slice(3)"
          :key="user.id"
          class="flex items-center justify-between px-6 py-4 hover:bg-[#fffef0] transition-colors"
        >
          <div class="flex items-center space-x-4">
            <span class="w-7 text-center font-mono font-black text-[#1a1a1a] text-base">#{{ idx + 4 }}</span>
            <img :src="user.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.id" class="w-9 h-9 rounded-md border-2 border-[#1a1a1a] bg-white" />
            <span class="text-sm font-black text-[#1a1a1a] font-mono">{{ user.nickname }}</span>
          </div>
          <div class="text-sm font-mono font-black text-[#1a1a1a] flex items-center gap-1.5">
            <CoinIcon customClass="w-4 h-4" />
            <span>{{ formatChips(user.chips) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Trophy, Medal, Crown, Award } from 'lucide-vue-next'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import CoinIcon from '@/components/common/CoinIcon.vue'
import type { Profile } from '@/types/database'

const leaders = ref<Profile[]>([])

function formatChips(val?: number): string {
  return new Intl.NumberFormat('en-US').format(val ?? 0)
}

onMounted(async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('chips', { ascending: false })
        .limit(20)

      if (data && data.length > 0) {
        leaders.value = data as Profile[]
        return
      }
    } catch (e) {
      console.error('Fetch leaderboard error:', e)
    }
  }

  // 模拟初始榜单展示
  leaders.value = [
    { id: '1', email: 'king@lucky7.game', nickname: '亚洲赌王高进', avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=king', chips: 1888000, is_admin: false },
    { id: '2', email: 'star@lucky7.game', nickname: '特异功能阿星', avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=star', chips: 990000, is_admin: false },
    { id: '3', email: 'knife@lucky7.game', nickname: '赌侠陈小刀', avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=knife', chips: 650000, is_admin: false },
    { id: '4', email: 'poker1@lucky7.game', nickname: '德扑老法师', avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=p1', chips: 320000, is_admin: false },
    { id: '5', email: 'dice_master@lucky7.game', nickname: '骰子大魔王', avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=p2', chips: 210000, is_admin: false },
    { id: '6', email: 'luckylady@lucky7.game', nickname: '六合彩锦鲤', avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=p3', chips: 154000, is_admin: false }
  ]
})
</script>
