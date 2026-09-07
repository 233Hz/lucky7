<template>
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-8">
    <!-- Header -->
    <div class="text-center space-y-2">
      <h1 class="text-3xl font-extrabold text-white flex items-center justify-center gap-2">
        <Trophy class="w-8 h-8 text-amber-400" />
        <span>全服财富排行榜</span>
      </h1>
      <p class="text-sm text-slate-400">实时展示全平台顶级竞技高手的总资产排名</p>
    </div>

    <!-- Top 3 Podium Cards -->
    <div v-if="leaders.length >= 3" class="grid grid-cols-3 gap-3 sm:gap-6 items-end pt-6">
      <!-- Rank 2: Silver -->
      <div class="order-1 flex flex-col items-center p-4 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-lg text-center">
        <div class="w-8 h-8 rounded-full bg-slate-700/60 border border-slate-400 text-slate-300 flex items-center justify-center mb-1">
          <Medal class="w-4 h-4" />
        </div>
        <img :src="leaders[1]?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=rank2'" class="w-12 h-12 rounded-full border-2 border-slate-400 mb-2" />
        <div class="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-[90px]">{{ leaders[1]?.nickname }}</div>
        <div class="text-xs font-mono font-bold text-amber-300 mt-1 flex items-center justify-center gap-1">
          <CoinIcon customClass="w-3.5 h-3.5" />
          <span>{{ formatChips(leaders[1]?.chips) }}</span>
        </div>
        <span class="mt-2 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold">榜眼</span>
      </div>

      <!-- Rank 1: Gold (Center & Taller) -->
      <div class="order-2 flex flex-col items-center p-5 rounded-3xl bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-900 border-2 border-amber-500 shadow-xl shadow-amber-950/40 text-center scale-105 z-10">
        <div class="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center mb-1">
          <Crown class="w-5 h-5" />
        </div>
        <img :src="leaders[0]?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=rank1'" class="w-16 h-16 rounded-full border-2 border-amber-400 mb-2 shadow" />
        <div class="text-sm sm:text-base font-black text-amber-300 truncate max-w-[120px]">{{ leaders[0]?.nickname }}</div>
        <div class="text-sm font-mono font-black text-amber-400 mt-1 flex items-center justify-center gap-1">
          <CoinIcon customClass="w-4 h-4" />
          <span>{{ formatChips(leaders[0]?.chips) }}</span>
        </div>
        <span class="mt-2 text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-black">状元 · 赌神</span>
      </div>

      <!-- Rank 3: Bronze -->
      <div class="order-3 flex flex-col items-center p-4 rounded-2xl bg-slate-900 border border-amber-800/60 shadow-lg text-center">
        <div class="w-8 h-8 rounded-full bg-amber-950/60 border border-amber-700 text-amber-500 flex items-center justify-center mb-1">
          <Award class="w-4 h-4" />
        </div>
        <img :src="leaders[2]?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=rank3'" class="w-12 h-12 rounded-full border-2 border-amber-700 mb-2" />
        <div class="text-xs sm:text-sm font-bold text-slate-200 truncate max-w-[90px]">{{ leaders[2]?.nickname }}</div>
        <div class="text-xs font-mono font-bold text-amber-300 mt-1 flex items-center justify-center gap-1">
          <CoinIcon customClass="w-3.5 h-3.5" />
          <span>{{ formatChips(leaders[2]?.chips) }}</span>
        </div>
        <span class="mt-2 text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-600 font-semibold">探花</span>
      </div>
    </div>

    <!-- Rest of the Leaderboard Table -->
    <div class="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
      <div class="divide-y divide-slate-800">
        <div
          v-for="(user, idx) in leaders.slice(3)"
          :key="user.id"
          class="flex items-center justify-between px-6 py-3.5 hover:bg-slate-800/50 transition-colors"
        >
          <div class="flex items-center space-x-4">
            <span class="w-6 text-center font-mono font-bold text-slate-400 text-sm">{{ idx + 4 }}</span>
            <img :src="user.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.id" class="w-8 h-8 rounded-full border border-slate-700" />
            <span class="text-sm font-semibold text-slate-200">{{ user.nickname }}</span>
          </div>
          <div class="text-sm font-mono font-bold text-amber-300 flex items-center gap-1">
            <CoinIcon customClass="w-3.5 h-3.5" />
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
