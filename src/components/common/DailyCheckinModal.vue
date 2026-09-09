<template>
  <Modal v-model="visible" :closeOnBackdrop="true" @close="handleClose">
    <template #title>
      <div class="flex items-center gap-2 font-mono">
        <CalendarCheck class="w-5 h-5 text-[#1a1a1a]" />
        <span>每日签到好礼 · DAILY BONUS</span>
      </div>
    </template>

    <div class="space-y-4 font-mono">
      <!-- Welcome & Today's Notice Banner -->
      <div class="p-3.5 rounded-lg bg-[#fef9c3] border-3 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a] flex items-center gap-3">
        <div class="w-10 h-10 rounded-md bg-[#facc15] border-2 border-[#1a1a1a] flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_#1a1a1a]">
          <Gift class="w-5 h-5 text-[#1a1a1a] animate-bounce" />
        </div>
        <div>
          <div class="text-xs font-black text-[#1a1a1a]">今日首次登录！</div>
          <div class="text-[11px] text-[#4a4a4a] font-bold mt-0.5">连续签到可获阶梯加成，最高每日可领 {{ walletStore.maxReward.toLocaleString() }} 虚拟筹码！</div>
        </div>
      </div>

      <!-- Streak Status Cards -->
      <div class="grid grid-cols-2 gap-3">
        <div class="p-3 rounded-lg bg-white border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] flex items-center space-x-3">
          <div class="w-8 h-8 rounded-md bg-[#ef4444] text-white flex items-center justify-center border border-[#1a1a1a]">
            <Flame class="w-4 h-4" />
          </div>
          <div>
            <div class="text-[10px] text-[#4a4a4a] font-bold uppercase">当前连续签到</div>
            <div class="text-base font-black text-[#1a1a1a]">{{ walletStore.currentStreak }} 天</div>
          </div>
        </div>

        <div class="p-3 rounded-lg bg-white border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] flex items-center space-x-3">
          <div class="w-8 h-8 rounded-md bg-[#facc15] text-[#1a1a1a] flex items-center justify-center border border-[#1a1a1a]">
            <CoinIcon customClass="w-4 h-4" />
          </div>
          <div>
            <div class="text-[10px] text-[#4a4a4a] font-bold uppercase">今日预计可领</div>
            <div class="text-base font-black text-[#22c55e]">+{{ todayReward.toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <!-- 7-Day Rewards Progress Grid -->
      <div class="space-y-2 pt-0.5">
        <div class="text-[11px] font-black text-[#1a1a1a] uppercase flex items-center justify-between">
          <span>7 天连续签到奖励梯度</span>
          <span class="text-[10px] text-[#4a4a4a] font-bold">连签越多 奖励越高</span>
        </div>
        <div class="grid grid-cols-7 gap-1 sm:gap-1.5">
          <div
            v-for="day in 7"
            :key="day"
            :title="`第 ${day} 天：+${(walletStore.dayRewards[day - 1] || (1000 + (day - 1) * 500)).toLocaleString()} 筹码`"
            class="h-[52px] sm:h-[58px] rounded border-2 border-[#1a1a1a] text-center font-mono select-none flex flex-col justify-between items-center py-1.5 px-0.5 sm:px-1 transition-all min-w-0 overflow-hidden"
            :class="[
              day < currentStreakIndex || (day === currentStreakIndex && walletStore.isCheckedInToday)
                ? 'bg-[#22c55e] text-white shadow-[1px_1px_0px_0px_#1a1a1a]'
                : day === currentStreakIndex
                ? 'bg-[#facc15] text-[#1a1a1a] font-black shadow-[2px_2px_0px_0px_#1a1a1a]'
                : 'bg-white text-[#4a4a4a] hover:bg-[#fffef0]'
            ]"
          >
            <!-- Day title / Status inside card -->
            <!-- Claimed status -->
            <div
              v-if="day < currentStreakIndex || (day === currentStreakIndex && walletStore.isCheckedInToday)"
              class="text-[8px] sm:text-[10px] font-black leading-none flex items-center justify-center gap-0.5 w-full truncate"
            >
              <Check class="w-2.5 h-2.5 stroke-[3] shrink-0 text-white" />
              <span>D{{ day }}</span>
            </div>
            <!-- Today (unclaimed) status: clean red badge INSIDE card -->
            <div
              v-else-if="day === currentStreakIndex"
              class="w-full flex items-center justify-center"
            >
              <span class="px-1.5 py-0.5 rounded bg-[#ef4444] text-white text-[7.5px] sm:text-[8.5px] font-black tracking-tighter leading-none shadow-[1px_1px_0px_0px_#1a1a1a]">
                今日
              </span>
            </div>
            <!-- Future day status -->
            <div
              v-else
              class="text-[8px] sm:text-[10px] font-black leading-none w-full truncate flex items-center justify-center gap-0.5"
            >
              <span>第{{ day }}天</span>
              <Gift v-if="day === 7" class="w-2.5 h-2.5 text-[#eab308] shrink-0" />
            </div>

            <!-- Amount display -->
            <div
              class="text-[9px] sm:text-[11px] font-black leading-tight tracking-tighter w-full truncate"
              :class="day < currentStreakIndex || (day === currentStreakIndex && walletStore.isCheckedInToday) ? 'text-white' : 'text-[#1a1a1a]'"
            >
              <span class="sm:hidden">+{{ formatCompact(walletStore.dayRewards[day - 1] || (1000 + (day - 1) * 500)) }}</span>
              <span class="hidden sm:inline">+{{ (walletStore.dayRewards[day - 1] || (1000 + (day - 1) * 500)).toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Badge (when claimed) -->
      <div v-if="claimedSuccess" class="p-3 rounded-lg bg-[#dcfce7] border-2 border-[#1a1a1a] text-center font-mono space-y-1 shadow-[2px_2px_0px_0px_#1a1a1a]">
        <div class="text-sm font-black text-[#15803d] flex items-center justify-center gap-1">
          <Check class="w-4 h-4 stroke-[3]" />
          <span>领取成功！+{{ earnedReward.toLocaleString() }} 筹码已入账</span>
        </div>
        <div class="text-xs font-bold text-[#166534]">
          最新筹码余额: {{ authStore.profile?.chips?.toLocaleString() }}
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <template #footer>
      <div class="w-full flex flex-col sm:flex-row items-center justify-between gap-2.5 font-mono">
        <button
          type="button"
          @click="goToFullCheckin"
          class="text-xs font-black text-[#4a4a4a] hover:text-[#1a1a1a] underline cursor-pointer self-start sm:self-auto"
        >
          前往完整签到页
        </button>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            @click="handleClose"
            class="comic-btn-white px-4 py-2 text-xs flex-1 sm:flex-none cursor-pointer"
          >
            {{ claimedSuccess ? '关闭' : '稍后再领' }}
          </button>

          <button
            v-if="!claimedSuccess"
            v-prevent-reclick
            type="button"
            :disabled="isClaiming || walletStore.isCheckedInToday"
            @click="handleClaim"
            class="comic-btn-yellow px-5 py-2 text-xs flex items-center justify-center gap-1.5 flex-1 sm:flex-none cursor-pointer disabled:opacity-50"
          >
            <Gift class="w-4 h-4" />
            <span>{{ isClaiming ? '领取中...' : `立即一键领取 (+${todayReward.toLocaleString()})` }}</span>
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import confetti from 'canvas-confetti'
import { CalendarCheck, Flame, Gift, Check } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { sound } from '@/lib/sound'
import { dialog } from '@/lib/dialog'
import Modal from '@/components/common/Modal.vue'
import CoinIcon from '@/components/common/CoinIcon.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const walletStore = useWalletStore()

const visible = ref(false)
const isClaiming = ref(false)
const claimedSuccess = ref(false)
const earnedReward = ref(0)

const currentStreakIndex = computed(() => {
  return ((walletStore.currentStreak - 1) % 7) + 1
})

const todayReward = computed(() => {
  return walletStore.getRewardForDay(currentStreakIndex.value - 1)
})

function formatCompact(val: number): string {
  if (!val) return '0'
  if (val >= 1000) {
    const k = val / 1000
    return `${Number(k.toFixed(1))}k`
  }
  return `${val}`
}

function getTodayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function checkAndPrompt() {
  // 1. 未登录则不提示
  if (!authStore.profile) return
  // 2. 在登录页或签到主页不弹窗拦截
  if (route.path === '/auth' || route.path === '/checkin') return

  const todayStr = getTodayKey()
  const promptKey = `lucky7_checkin_prompt_${authStore.profile.id}`
  const lastPromptedDate = localStorage.getItem(promptKey)

  // 3. 今日已提示过则不再重复打扰
  if (lastPromptedDate === todayStr) return

  // 4. 刷新今日签到状态与签到配置
  await Promise.all([
    walletStore.checkTodayStatus(),
    walletStore.fetchCheckinConfig()
  ])

  // 5. 今日已签到则记录并返回
  if (walletStore.isCheckedInToday) {
    localStorage.setItem(promptKey, todayStr)
    return
  }

  // 6. 今日未签到且今日首次登录：记录并延时平滑弹窗
  localStorage.setItem(promptKey, todayStr)
  setTimeout(() => {
    if (!walletStore.isCheckedInToday && route.path !== '/checkin' && route.path !== '/auth') {
      sound.playClick()
      visible.value = true
    }
  }, 700)
}

// 监听登录状态与路由变化
watch(
  () => [authStore.profile?.id, route.path],
  ([newId, newPath]) => {
    if (newId && newPath !== '/auth' && newPath !== '/checkin') {
      checkAndPrompt()
    }
  },
  { immediate: true }
)

async function handleClaim() {
  if (isClaiming.value || walletStore.loading || walletStore.isCheckedInToday) return
  isClaiming.value = true
  try {
    const res = await walletStore.claimDailyBonus()
    if (res.success) {
      claimedSuccess.value = true
      earnedReward.value = res.reward || todayReward.value
      sound.playWin()
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } })
      setTimeout(() => {
        visible.value = false
      }, 2200)
    } else {
      dialog.error(res.message || '签到失败')
    }
  } catch (err: unknown) {
    const e = err as { message?: string }
    dialog.error(e.message || '签到异常')
  } finally {
    isClaiming.value = false
  }
}

function goToFullCheckin() {
  visible.value = false
  router.push('/checkin')
}

function handleClose() {
  visible.value = false
}
</script>
