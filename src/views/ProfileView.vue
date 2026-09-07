<template>
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-8">
    <!-- Profile Card -->
    <div class="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div class="flex items-center space-x-4">
          <img
            :src="avatarUrl"
            class="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-emerald-500 shadow-md"
            alt="avatar"
          />
          <div>
            <div class="flex items-center space-x-2">
              <h2 class="text-xl font-black text-white">{{ authStore.profile?.nickname }}</h2>
              <span v-if="authStore.isAdmin" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                管理员
              </span>
            </div>
            <p class="text-xs text-slate-400 font-mono mt-1">{{ authStore.profile?.email }}</p>
          </div>
        </div>

        <!-- Chips Pill & Sign Out -->
        <div class="flex items-center space-x-3">
          <div class="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 flex items-center space-x-2">
            <CoinIcon customClass="w-5 h-5" />
            <div>
              <div class="text-[10px] text-slate-400 font-semibold uppercase">当前持有</div>
              <div class="text-base font-black font-mono text-amber-300">{{ formattedChips }}</div>
            </div>
          </div>

          <button
            @click="handleSignOut"
            class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 hover:text-rose-400 hover:border-rose-800 text-xs font-bold text-slate-300 border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <LogOut class="w-3.5 h-3.5" />
            <span>退出登录</span>
          </button>
        </div>
      </div>

      <!-- Edit Nickname Form -->
      <form @submit.prevent="handleSaveProfile" class="flex flex-col sm:flex-row items-end gap-3">
        <div class="w-full sm:w-72">
          <label class="block text-xs font-semibold text-slate-400 mb-1">修改昵称</label>
          <input
            v-model="editNickname"
            type="text"
            required
            class="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <button
          type="submit"
          class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow"
        >
          保存修改
        </button>
      </form>
    </div>

    <!-- Chip Transactions History -->
    <div class="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold text-slate-200 flex items-center gap-2">
          <CreditCard class="w-4 h-4 text-emerald-400" />
          <span>筹码流水明细</span>
        </h3>
        <button
          @click="() => walletStore.fetchTransactions()"
          class="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
        >
          <RotateCw class="w-3 h-3" />
          <span>刷新流水</span>
        </button>
      </div>

      <div class="divide-y divide-slate-800 max-h-96 overflow-y-auto">
        <div v-if="walletStore.transactions.length === 0" class="py-8 text-center text-slate-500 text-xs">
          暂无筹码流水记录
        </div>
        <div
          v-for="tx in walletStore.transactions"
          :key="tx.id"
          class="py-3 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
        >
          <div>
            <div class="text-xs font-semibold text-slate-200">{{ tx.note || getTypeName(tx.type) }}</div>
            <div class="text-[10px] text-slate-500 font-mono mt-0.5">{{ tx.created_at || '刚刚' }}</div>
          </div>
          <div class="text-right">
            <div
              class="text-xs font-mono font-black flex items-center justify-end gap-1"
              :class="tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'"
            >
              <span>{{ tx.amount >= 0 ? '+' : '' }}{{ tx.amount }}</span>
              <CoinIcon customClass="w-3 h-3" />
            </div>
            <div class="text-[10px] text-slate-400 font-mono">余额: {{ tx.balance_after }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CreditCard, RotateCw, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import CoinIcon from '@/components/common/CoinIcon.vue'

const router = useRouter()
const authStore = useAuthStore()
const walletStore = useWalletStore()

const editNickname = ref(authStore.profile?.nickname || '')

const formattedChips = computed(() => {
  return new Intl.NumberFormat('en-US').format(authStore.userChips)
})

const avatarUrl = computed(() => {
  return authStore.profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${authStore.profile?.id || 'guest'}`
})

onMounted(() => {
  walletStore.fetchTransactions()
})

async function handleSaveProfile() {
  if (!editNickname.value.trim()) return
  const ok = await authStore.updateProfile(editNickname.value.trim(), avatarUrl.value)
  if (ok) {
    alert('昵称已更新！')
  }
}

async function handleSignOut() {
  await authStore.signOut()
  router.push('/auth')
}

function getTypeName(type: string): string {
  switch (type) {
    case 'register_bonus': return '新用户注册奖励'
    case 'daily_checkin': return '每日签到奖励'
    case 'game_win': return '游戏胜利收益'
    case 'game_loss': return '游戏扣除结算'
    case 'admin_grant': return '管理员后台赠送'
    default: return type
  }
}
</script>
