<template>
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-8">
    <!-- Header -->
    <div class="text-center space-y-2">
      <h1 class="text-3xl sm:text-4xl font-black text-black uppercase font-mono flex items-center justify-center gap-2">
        <CalendarCheck class="w-9 h-9 text-black" />
        <span>每日签到领好礼</span>
      </h1>
      <p class="text-xs sm:text-sm text-black font-mono font-bold flex items-center justify-center gap-1">
        <span>连续签到天数越多，奖励越丰厚！最高可领 4,000</span>
        <CoinIcon customClass="w-4 h-4" />
        <span>虚拟筹码。</span>
      </p>
    </div>

    <!-- Streak Status Box -->
    <div class="flex items-center justify-center">
      <div class="px-6 py-3 rounded-none bg-white border-4 border-black shadow-brutal flex items-center space-x-4">
        <div class="w-10 h-10 rounded-none bg-[#ff9500] text-black flex items-center justify-center border-2 border-black shadow-brutal-sm">
          <Flame class="w-6 h-6" />
        </div>
        <div class="text-left font-mono">
          <div class="text-[10px] text-black font-black uppercase">当前连续签到</div>
          <div class="text-2xl font-black text-black">{{ walletStore.currentStreak }} 天</div>
        </div>
      </div>
    </div>

    <!-- 7-Day Rewards Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
      <div
        v-for="day in 7"
        :key="day"
        class="relative rounded-none p-4 border-3 border-black flex flex-col items-center justify-between text-center transition-all select-none font-mono"
        :class="[
          day < currentStreakIndex || (day === currentStreakIndex && walletStore.isCheckedInToday)
            ? 'bg-[#ccff00] text-black shadow-brutal-sm'
            : day === currentStreakIndex
            ? 'bg-[#ffff00] border-4 border-black shadow-brutal-hover -translate-y-1 scale-105 z-10 text-black'
            : 'bg-white text-black shadow-brutal-sm'
        ]"
      >
        <!-- Checked stamp -->
        <div
          v-if="day < currentStreakIndex || (day === currentStreakIndex && walletStore.isCheckedInToday)"
          class="absolute top-1.5 right-1.5 w-5 h-5 rounded-none bg-black text-[#ccff00] flex items-center justify-center border border-black shadow-brutal-sm"
        >
          <Check class="w-3.5 h-3.5 stroke-[3]" />
        </div>

        <span class="text-xs font-black uppercase">第 {{ day }} 天</span>

        <div class="my-3 flex items-center justify-center">
          <Gift v-if="day === 7" class="w-8 h-8 text-black animate-bounce" />
          <CoinIcon v-else customClass="w-8 h-8" />
        </div>

        <div class="font-mono font-black text-sm flex items-center justify-center gap-0.5 text-black">
          <span>+{{ 1000 + (day - 1) * 500 }}</span>
        </div>
      </div>
    </div>

    <!-- Claim Action Button -->
    <div class="flex flex-col items-center space-y-3 pt-4">
      <button
        @click="handleClaim"
        :disabled="walletStore.isCheckedInToday || walletStore.loading"
        class="w-full sm:w-80 py-4 rounded-none font-mono font-black uppercase text-base transition-all disabled:opacity-40 flex items-center justify-center gap-2"
        :class="[
          walletStore.isCheckedInToday
            ? 'bg-slate-200 text-slate-700 border-3 border-black shadow-brutal-sm cursor-not-allowed'
            : 'bg-[#ff006e] text-white border-4 border-black shadow-brutal-lg hover:shadow-brutal-xl hover:bg-[#ccff00] hover:text-black hover:-translate-x-1 hover:-translate-y-1 active:translate-x-[8px] active:translate-y-[8px] active:shadow-none'
        ]"
      >
        <Check v-if="walletStore.isCheckedInToday" class="w-5 h-5" />
        <Gift v-else class="w-5 h-5" />
        <span>{{ walletStore.isCheckedInToday ? '今日已签到，明日再来！' : '立即领取今日奖励' }}</span>
        <CoinIcon v-if="!walletStore.isCheckedInToday" customClass="w-5 h-5" />
      </button>

      <span v-if="walletStore.isCheckedInToday" class="px-4 py-1.5 rounded-none border-2 border-black bg-[#ccff00] text-black font-mono font-black text-xs shadow-brutal-sm flex items-center gap-1.5">
        <Check class="w-4 h-4 stroke-[3]" />
        <span>今日签到奖励已成功入账！</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import confetti from 'canvas-confetti'
import { CalendarCheck, Flame, Gift, Check } from 'lucide-vue-next'
import { useWalletStore } from '@/stores/wallet'
import { sound } from '@/lib/sound'
import CoinIcon from '@/components/common/CoinIcon.vue'

const walletStore = useWalletStore()

const currentStreakIndex = computed(() => {
  return ((walletStore.currentStreak - 1) % 7) + 1
})

onMounted(() => {
  walletStore.checkTodayStatus()
})

async function handleClaim() {
  const res = await walletStore.claimDailyBonus()
  if (res.success) {
    sound.playWin()
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
  } else {
    alert(res.message || '签到失败')
  }
}
</script>
