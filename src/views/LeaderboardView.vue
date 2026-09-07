<template>
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-8">
    <!-- Header -->
    <div class="text-center space-y-2">
      <h1 class="text-3xl sm:text-4xl font-black text-black uppercase font-mono flex items-center justify-center gap-2">
        <Trophy class="w-9 h-9 text-black" />
        <span>全服财富排行榜</span>
      </h1>
      <p class="text-xs sm:text-sm text-black font-mono font-bold">实时展示全平台顶级竞技高手的总资产排名</p>
    </div>

    <!-- Top 3 Podium Cards -->
    <div v-if="leaders.length >= 3" class="grid grid-cols-3 gap-3 sm:gap-6 items-end pt-6">
      <!-- Rank 2: Silver -->
      <div class="order-1 flex flex-col items-center p-4 sm:p-5 rounded-none bg-white border-4 border-black shadow-brutal-lg text-center font-mono">
        <div class="w-8 h-8 rounded-none bg-black text-white flex items-center justify-center mb-1.5 border border-black shadow-brutal-sm">
          <Medal class="w-4 h-4" />
        </div>
        <img :src="leaders[1]?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=rank2'" class="w-12 h-12 rounded-none border-2 border-black mb-2 shadow-brutal-sm" />
        <div class="text-xs sm:text-sm font-black text-black truncate max-w-[90px]">{{ leaders[1]?.nickname }}</div>
        <div class="text-xs font-black text-black mt-1 flex items-center justify-center gap-1">
          <CoinIcon customClass="w-3.5 h-3.5" />
          <span>{{ formatChips(leaders[1]?.chips) }}</span>
        </div>
        <span class="mt-2 text-[10px] px-2 py-0.5 rounded-none bg-black text-white font-black uppercase border border-black shadow-brutal-sm">榜眼</span>
      </div>

      <!-- Rank 1: Gold (Center & Taller) -->
      <div class="order-2 flex flex-col items-center p-5 sm:p-7 rounded-none bg-[#ffff00] border-4 border-black shadow-brutal-xl text-center scale-105 z-10 font-mono">
        <div class="w-10 h-10 rounded-none bg-black text-[#ffff00] flex items-center justify-center mb-2 border-2 border-black shadow-brutal-sm">
          <Crown class="w-6 h-6" />
        </div>
        <img :src="leaders[0]?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=rank1'" class="w-16 h-16 rounded-none border-3 border-black mb-2 shadow-brutal" />
        <div class="text-sm sm:text-base font-black text-black truncate max-w-[120px]">{{ leaders[0]?.nickname }}</div>
        <div class="text-sm font-black text-black mt-1 flex items-center justify-center gap-1">
          <CoinIcon customClass="w-4 h-4" />
          <span>{{ formatChips(leaders[0]?.chips) }}</span>
        </div>
        <span class="mt-2 text-[11px] px-3 py-1 rounded-none bg-black text-[#ffff00] font-black uppercase border-2 border-black shadow-brutal-sm">状元 · 赌神</span>
      </div>

      <!-- Rank 3: Bronze -->
      <div class="order-3 flex flex-col items-center p-4 sm:p-5 rounded-none bg-[#ff9500] border-4 border-black shadow-brutal-lg text-center font-mono">
        <div class="w-8 h-8 rounded-none bg-black text-[#ff9500] flex items-center justify-center mb-1.5 border border-black shadow-brutal-sm">
          <Award class="w-4 h-4" />
        </div>
        <img :src="leaders[2]?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=rank3'" class="w-12 h-12 rounded-none border-2 border-black mb-2 shadow-brutal-sm" />
        <div class="text-xs sm:text-sm font-black text-black truncate max-w-[90px]">{{ leaders[2]?.nickname }}</div>
        <div class="text-xs font-black text-black mt-1 flex items-center justify-center gap-1">
          <CoinIcon customClass="w-3.5 h-3.5" />
          <span>{{ formatChips(leaders[2]?.chips) }}</span>
        </div>
        <span class="mt-2 text-[10px] px-2 py-0.5 rounded-none bg-black text-[#ff9500] font-black uppercase border border-black shadow-brutal-sm">探花</span>
      </div>
    </div>

    <!-- Rest of the Leaderboard Table -->
    <div class="rounded-none bg-white border-4 border-black shadow-brutal-lg overflow-hidden">
      <div class="divide-y-2 divide-black">
        <div
          v-for="(user, idx) in leaders.slice(3)"
          :key="user.id"
          class="flex items-center justify-between px-6 py-4 hover:bg-[#ffffea] transition-colors"
        >
          <div class="flex items-center space-x-4">
            <span class="w-7 text-center font-mono font-black text-black text-base">{{ idx + 4 }}</span>
            <img :src="user.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + user.id" class="w-9 h-9 rounded-none border-2 border-black bg-slate-100" />
            <span class="text-sm font-black text-black font-mono">{{ user.nickname }}</span>
          </div>
          <div class="text-sm font-mono font-black text-black flex items-center gap-1.5">
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
