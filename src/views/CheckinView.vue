<template>
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-8">
    <!-- Header -->
    <div class="text-center space-y-2">
      <h1 class="text-3xl font-extrabold text-white flex items-center justify-center gap-2">
        <CalendarCheck class="w-8 h-8 text-emerald-400" />
        <span>每日签到领好礼</span>
      </h1>
      <p class="text-sm text-slate-400 flex items-center justify-center gap-1">
        <span>连续签到天数越多，奖励越丰厚！最高可领 4,000</span>
        <CoinIcon customClass="w-3.5 h-3.5" />
        <span>奖励。</span>
      </p>
    </div>

    <!-- Streak Status Pill -->
    <div class="flex items-center justify-center">
      <div class="px-5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 shadow flex items-center space-x-3">
        <div class="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
          <Flame class="w-5 h-5" />
        </div>
        <div class="text-left">
          <div class="text-xs text-slate-400 font-semibold">当前连续签到</div>
          <div class="text-lg font-black text-amber-400 font-mono">{{ walletStore.currentStreak }} 天</div>
        </div>
      </div>
    </div>

    <!-- 7-Day Rewards Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
      <div
        v-for="day in 7"
        :key="day"
        class="relative rounded-2xl p-4 border flex flex-col items-center justify-between text-center transition-all select-none"
        :class="[
          day < currentStreakIndex
            ? 'bg-slate-900/60 border-emerald-900/60 text-slate-400'
            : day === currentStreakIndex
            ? 'bg-gradient-to-b from-amber-950/60 to-slate-900 border-amber-500/80 shadow-lg shadow-amber-950/50 scale-105 z-10'
            : 'bg-slate-900/80 border-slate-800 text-slate-300'
        ]"
      >
        <!-- Checked stamp -->
        <div
          v-if="day < currentStreakIndex || (day === currentStreakIndex && walletStore.isCheckedInToday)"
          class="absolute top-2 right-2 text-emerald-400"
        >
          <Check class="w-4 h-4" />
        </div>

        <span class="text-xs font-bold text-slate-400">第 {{ day }} 天</span>

        <div class="my-3 flex items-center justify-center">
          <Gift v-if="day === 7" class="w-7 h-7 text-amber-400 animate-bounce" />
          <CoinIcon v-else customClass="w-7 h-7" />
        </div>

        <div class="font-mono font-black text-sm flex items-center justify-center gap-0.5" :class="day === currentStreakIndex ? 'text-amber-300' : 'text-slate-200'">
          <span>+{{ 1000 + (day - 1) * 500 }}</span>
        </div>
      </div>
    </div>

    <!-- Claim Action Button -->
    <div class="flex flex-col items-center space-y-3 pt-4">
      <button
        @click="handleClaim"
        :disabled="walletStore.isCheckedInToday || walletStore.loading"
        class="w-full sm:w-80 py-3.5 rounded-2xl text-base font-black text-slate-950 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
        :class="walletStore.isCheckedInToday ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:scale-105 shadow-amber-500/20'"
      >
        <Check v-if="walletStore.isCheckedInToday" class="w-5 h-5" />
        <Gift v-else class="w-5 h-5" />
        <span>{{ walletStore.isCheckedInToday ? '今日已签到，明天再来！' : '立即领取今日奖励' }}</span>
        <CoinIcon v-if="!walletStore.isCheckedInToday" customClass="w-4 h-4" />
      </button>

      <span v-if="walletStore.isCheckedInToday" class="text-xs text-emerald-400 font-semibold flex items-center gap-1">
        <Check class="w-3.5 h-3.5" />
        <span>今日签到奖励已发放至您的账户余额！</span>
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
