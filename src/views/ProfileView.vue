<template>
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-8 font-mono">
    <!-- Profile Card -->
    <div class="rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] space-y-6 text-[#1a1a1a]">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b-3 border-[#1a1a1a]">
        <div class="flex items-center space-x-4">
          <img
            :src="avatarUrl"
            class="w-16 h-16 rounded-md bg-white border-3 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a]"
            alt="avatar"
          />
          <div>
            <div class="flex items-center space-x-2">
              <h2 class="text-2xl font-black text-[#1a1a1a] uppercase">{{ authStore.profile?.nickname }}</h2>
              <span v-if="authStore.isAdmin" class="px-2.5 py-0.5 rounded-md text-xs font-black bg-[#ef4444] text-white border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
                管理员 · ADMIN
              </span>
            </div>
            <p class="text-xs text-[#4a4a4a] font-bold mt-1">{{ authStore.profile?.email }}</p>
          </div>
        </div>

        <!-- Chips Box & Sign Out -->
        <div class="flex items-center space-x-3">
          <div class="px-5 py-2.5 rounded-lg bg-[#facc15] border-3 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a] flex items-center space-x-3">
            <CoinIcon customClass="w-6 h-6" />
            <div>
              <div class="text-[10px] text-[#1a1a1a] font-black uppercase">当前持有筹码</div>
              <div class="text-xl font-black text-[#1a1a1a]">{{ formattedChips }}</div>
            </div>
          </div>

          <button
            v-prevent-reclick
            :disabled="isSigningOut"
            @click="handleSignOut"
            class="comic-btn-red px-4 py-2.5 text-xs disabled:opacity-50"
          >
            <LogOut class="w-3.5 h-3.5 mr-1" />
            <span>{{ isSigningOut ? '退出中...' : '退出登录' }}</span>
          </button>
        </div>
      </div>

      <!-- Edit Nickname Form -->
      <form @submit.prevent="handleSaveProfile" class="flex flex-col sm:flex-row items-end gap-3">
        <div class="w-full sm:w-72">
          <label class="block text-xs font-black text-[#1a1a1a] uppercase mb-1">修改昵称</label>
          <input
            v-model="editNickname"
            type="text"
            required
            class="comic-input w-full px-3.5 py-2 text-xs font-bold"
          />
        </div>
        <button
          v-prevent-reclick
          type="submit"
          :disabled="isSaving || !editNickname.trim()"
          class="comic-btn-yellow px-5 py-2 text-xs font-black disabled:opacity-50"
        >
          {{ isSaving ? '保存中...' : '保存修改' }}
        </button>
      </form>
    </div>

    <!-- Chip Transactions History -->
    <div class="rounded-lg bg-white border-4 border-[#1a1a1a] p-6 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] space-y-4 text-[#1a1a1a]">
      <div class="flex items-center justify-between border-b-3 border-[#1a1a1a] pb-3">
        <h3 class="text-base font-black text-[#1a1a1a] uppercase flex items-center gap-2">
          <CreditCard class="w-5 h-5 text-[#1a1a1a]" />
          <span>筹码流水明细 · TRANSACTIONS</span>
        </h3>
        <button
          v-prevent-reclick
          :disabled="isRefreshing || walletStore.loading"
          @click="handleRefreshTransactions"
          class="comic-btn-white px-3 py-1 text-xs disabled:opacity-50"
        >
          <RotateCw class="w-3 h-3 mr-1" :class="isRefreshing ? 'animate-spin' : ''" />
          <span>{{ isRefreshing ? '刷新中...' : '刷新流水' }}</span>
        </button>
      </div>

      <div class="divide-y-2 divide-[#1a1a1a] max-h-96 overflow-y-auto pr-1">
        <div v-if="walletStore.transactions.length === 0" class="py-8 text-center text-[#1a1a1a] font-bold text-xs">
          暂无筹码流水记录
        </div>
        <div
          v-for="tx in walletStore.transactions"
          :key="tx.id"
          class="py-3.5 flex items-center justify-between hover:bg-[#fffef0] transition-colors"
        >
          <div>
            <div class="text-xs font-black text-[#1a1a1a]">{{ tx.note || getTypeName(tx.type) }}</div>
            <div class="text-[10px] text-[#4a4a4a] font-mono mt-0.5">{{ tx.created_at || '刚刚' }}</div>
          </div>
          <div class="text-right">
            <div
              class="text-xs font-mono font-black flex items-center justify-end gap-1"
              :class="tx.amount >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'"
            >
              <span>{{ tx.amount >= 0 ? '+' : '' }}{{ tx.amount }}</span>
              <CoinIcon customClass="w-3.5 h-3.5" />
            </div>
            <div class="text-[10px] text-[#1a1a1a] font-bold">余额: {{ tx.balance_after }}</div>
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

const isSaving = ref(false)
const isSigningOut = ref(false)
const isRefreshing = ref(false)

async function handleSaveProfile() {
  if (isSaving.value || !editNickname.value.trim()) return
  isSaving.value = true
  try {
    const ok = await authStore.updateProfile(editNickname.value.trim(), avatarUrl.value)
    if (ok) {
      alert('昵称已更新！')
    }
  } finally {
    isSaving.value = false
  }
}

async function handleSignOut() {
  if (isSigningOut.value) return
  isSigningOut.value = true
  try {
    await authStore.signOut()
    router.push('/auth')
  } finally {
    isSigningOut.value = false
  }
}

async function handleRefreshTransactions() {
  if (isRefreshing.value || walletStore.loading) return
  isRefreshing.value = true
  try {
    await walletStore.fetchTransactions()
  } finally {
    isRefreshing.value = false
  }
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
