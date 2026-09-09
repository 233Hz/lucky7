<template>
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-8">
    <!-- Header -->
    <div class="text-center space-y-2">
      <h1 class="text-3xl sm:text-4xl font-black text-[#1a1a1a] uppercase font-mono flex items-center justify-center gap-2">
        <CalendarCheck class="w-9 h-9 text-[#1a1a1a]" />
        <span>每日签到领好礼 · BONUS</span>
      </h1>
      <p class="text-xs sm:text-sm text-[#4a4a4a] font-mono font-bold flex items-center justify-center gap-1">
        <span>连续签到天数越多，奖励越丰厚！最高可领 {{ walletStore.maxReward.toLocaleString() }}</span>
        <CoinIcon customClass="w-4 h-4" />
        <span>虚拟筹码。</span>
      </p>
    </div>

    <!-- Streak Status Box -->
    <div class="flex items-center justify-center">
      <div class="px-6 py-3 rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex items-center space-x-4">
        <div class="w-10 h-10 rounded-md bg-[#ef4444] text-white flex items-center justify-center border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
          <Flame class="w-6 h-6" />
        </div>
        <div class="text-left font-mono">
          <div class="text-[10px] text-[#1a1a1a] font-black uppercase">当前连续签到</div>
          <div class="text-2xl font-black text-[#1a1a1a]">{{ walletStore.currentStreak }} 天</div>
        </div>
      </div>
    </div>

    <!-- 7-Day Rewards Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
      <div
        v-for="day in 7"
        :key="day"
        class="relative rounded-lg p-4 border-3 border-[#1a1a1a] flex flex-col items-center justify-between text-center transition-all select-none font-mono"
        :class="[
          day < currentStreakIndex || (day === currentStreakIndex && walletStore.isCheckedInToday)
            ? 'bg-[#22c55e] text-white shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]'
            : day === currentStreakIndex
            ? 'bg-[#facc15] border-4 border-[#1a1a1a] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] -translate-y-1 scale-105 z-10 text-[#1a1a1a]'
            : 'bg-white text-[#1a1a1a] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]'
        ]"
      >
        <!-- Checked stamp -->
        <div
          v-if="day < currentStreakIndex || (day === currentStreakIndex && walletStore.isCheckedInToday)"
          class="absolute top-1.5 right-1.5 w-5 h-5 rounded-md bg-[#1a1a1a] text-[#facc15] flex items-center justify-center border border-[#1a1a1a] shadow-[1px_1px_0px_0px_#1a1a1a]"
        >
          <Check class="w-3.5 h-3.5 stroke-[3]" />
        </div>

        <span class="text-xs font-black uppercase">第 {{ day }} 天</span>

        <div class="my-3 flex items-center justify-center">
          <Gift v-if="day === 7" class="w-8 h-8 text-[#1a1a1a] animate-bounce" />
          <CoinIcon v-else customClass="w-8 h-8" />
        </div>

        <div class="font-mono font-black text-sm flex items-center justify-center gap-0.5" :class="day < currentStreakIndex || (day === currentStreakIndex && walletStore.isCheckedInToday) ? 'text-white' : 'text-[#1a1a1a]'">
          <span>+{{ (walletStore.dayRewards[day - 1] || (1000 + (day - 1) * 500)).toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- Claim Action Button -->
    <div class="flex flex-col items-center space-y-3 pt-2">
      <button
        v-prevent-reclick
        @click="handleClaim"
        :disabled="walletStore.isCheckedInToday || walletStore.loading || isClaiming"
        class="w-full sm:w-80 py-4 rounded-lg font-mono font-black uppercase text-base transition-all disabled:opacity-50 flex items-center justify-center gap-2 border-4 border-[#1a1a1a]"
        :class="[
          walletStore.isCheckedInToday
            ? 'bg-white text-[#4a4a4a] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] cursor-not-allowed'
            : 'comic-btn-red shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
        ]"
      >
        <Check v-if="walletStore.isCheckedInToday" class="w-5 h-5" />
        <Gift v-else class="w-5 h-5" />
        <span>{{ isClaiming ? '正在领取中...' : (walletStore.isCheckedInToday ? '今日已签到，明日再来！' : '立即领取今日奖励 · CLAIM!') }}</span>
        <CoinIcon v-if="!walletStore.isCheckedInToday && !isClaiming" customClass="w-5 h-5" />
      </button>

      <span v-if="walletStore.isCheckedInToday" class="px-4 py-1.5 rounded-md border-2 border-[#1a1a1a] bg-[#22c55e] text-white font-mono font-black text-xs shadow-[2px_2px_0px_0px_#1a1a1a] flex items-center gap-1.5">
        <Check class="w-4 h-4 stroke-[3]" />
        <span>今日签到奖励已成功入账！</span>
      </span>
    </div>

    <!-- Consecutive Check-in Milestone Tasks -->
    <div v-if="walletStore.milestones.length > 0" class="pt-4 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-3 border-[#1a1a1a] pb-2 font-mono">
        <div class="flex items-center gap-2">
          <Trophy class="w-5 h-5 text-[#f59e0b]" />
          <h2 class="text-base font-black text-[#1a1a1a] uppercase">连续签到里程碑任务 · MILESTONE TASKS</h2>
        </div>
        <span class="text-xs text-[#4a4a4a] font-bold">达标签到当天自动叠加高额额外礼包</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div
          v-for="m in walletStore.milestones"
          :key="m.days"
          class="rounded-lg border-3 border-[#1a1a1a] p-4 flex flex-col justify-between space-y-3 transition-all"
          :class="[
            walletStore.currentStreak >= m.days
              ? 'bg-[#fffef0] shadow-[4px_4px_0px_0px_#22c55e]'
              : 'bg-white shadow-[4px_4px_0px_0px_#1a1a1a]'
          ]"
        >
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-[#1a1a1a] flex items-center gap-1">
                <Flame class="w-3.5 h-3.5 text-[#ef4444]" />
                <span>{{ m.title || `连签 ${m.days} 天` }}</span>
              </span>
              <span
                class="px-2 py-0.5 rounded text-[10px] font-black border"
                :class="[
                  walletStore.currentStreak >= m.days
                    ? 'bg-[#22c55e] text-white border-[#1a1a1a]'
                    : 'bg-[#f3f4f6] text-[#4a4a4a] border-[#d1d5db]'
                ]"
              >
                {{ walletStore.currentStreak >= m.days ? '已达成' : `目标 ${m.days}天` }}
              </span>
            </div>

            <div class="flex items-baseline justify-between pt-1">
              <span class="text-[11px] text-[#4a4a4a] font-bold">额外礼包</span>
              <div class="flex items-center gap-1 font-black text-sm text-[#ef4444]">
                <span>+{{ m.reward.toLocaleString() }}</span>
                <CoinIcon customClass="w-4 h-4" />
              </div>
            </div>

            <!-- Progress bar -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] font-black text-[#4a4a4a]">
                <span>进度</span>
                <span>{{ Math.min(walletStore.currentStreak, m.days) }} / {{ m.days }} 天</span>
              </div>
              <div class="h-2 w-full bg-[#f3f4f6] rounded-full border border-[#1a1a1a] overflow-hidden">
                <div
                  class="h-full transition-all duration-500 rounded-full"
                  :class="walletStore.currentStreak >= m.days ? 'bg-[#22c55e]' : 'bg-[#facc15]'"
                  :style="{ width: `${Math.min(100, Math.round((walletStore.currentStreak / m.days) * 100))}%` }"
                ></div>
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-dashed border-[#d1d5db] text-center">
            <span
              v-if="walletStore.currentStreak >= m.days"
              class="text-[11px] font-black text-[#22c55e] flex items-center justify-center gap-1"
            >
              <Check class="w-3.5 h-3.5 stroke-[3]" />
              <span>里程碑已达成</span>
            </span>
            <span v-else class="text-[11px] font-bold text-[#4a4a4a]">
              还差 <strong class="text-[#1a1a1a]">{{ m.days - walletStore.currentStreak }}</strong> 天达标
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import confetti from 'canvas-confetti'
import { CalendarCheck, Flame, Gift, Check, Trophy } from 'lucide-vue-next'
import { useWalletStore } from '@/stores/wallet'
import { sound } from '@/lib/sound'
import { dialog } from '@/lib/dialog'
import CoinIcon from '@/components/common/CoinIcon.vue'

const walletStore = useWalletStore()
const isClaiming = ref(false)

const currentStreakIndex = computed(() => {
  return ((walletStore.currentStreak - 1) % 7) + 1
})

onMounted(() => {
  walletStore.checkTodayStatus()
  walletStore.fetchCheckinConfig()
})

async function handleClaim() {
  if (isClaiming.value || walletStore.loading || walletStore.isCheckedInToday) return
  isClaiming.value = true
  try {
    const res = await walletStore.claimDailyBonus()
    if (res.success) {
      sound.playWin()
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
      dialog.success(res.message || `签到成功！获得 ${res.reward} 筹码！`, {
        title: '签到成功'
      })
    } else {
      dialog.error(res.message || '签到失败')
    }
  } finally {
    isClaiming.value = false
  }
}
</script>
