<template>
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-8 font-mono">
    <!-- Profile Card -->
    <div class="rounded-none bg-white border-4 border-black p-6 sm:p-8 shadow-brutal-xl space-y-6 text-black">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b-2 border-black">
        <div class="flex items-center space-x-4">
          <img
            :src="avatarUrl"
            class="w-16 h-16 rounded-none bg-slate-100 border-3 border-black shadow-brutal-sm"
            alt="avatar"
          />
          <div>
            <div class="flex items-center space-x-2">
              <h2 class="text-2xl font-black text-black uppercase">{{ authStore.profile?.nickname }}</h2>
              <span v-if="authStore.isAdmin" class="px-2 py-0.5 rounded-none text-xs font-black bg-[#ff9500] text-black border border-black shadow-brutal-sm">
                管理员
              </span>
            </div>
            <p class="text-xs text-black font-bold mt-1">{{ authStore.profile?.email }}</p>
          </div>
        </div>

        <!-- Chips Box & Sign Out -->
        <div class="flex items-center space-x-3">
          <div class="px-5 py-2.5 rounded-none bg-[#ffff00] border-3 border-black shadow-brutal flex items-center space-x-3">
            <CoinIcon customClass="w-6 h-6" />
            <div>
              <div class="text-[10px] text-black font-black uppercase">当前持有筹码</div>
              <div class="text-xl font-black text-black">{{ formattedChips }}</div>
            </div>
          </div>

          <button
            @click="handleSignOut"
            class="brutal-btn-pink px-4 py-3 text-xs"
          >
            <LogOut class="w-3.5 h-3.5 mr-1" />
            <span>退出登录</span>
          </button>
        </div>
      </div>

      <!-- Edit Nickname Form -->
      <form @submit.prevent="handleSaveProfile" class="flex flex-col sm:flex-row items-end gap-3">
        <div class="w-full sm:w-72">
          <label class="block text-xs font-black text-black uppercase mb-1">修改昵称</label>
          <input
            v-model="editNickname"
            type="text"
            required
            class="brutal-input w-full px-3.5 py-2 text-xs font-bold"
          />
        </div>
        <button
          type="submit"
          class="brutal-btn-lime px-5 py-2 text-xs font-black"
        >
          保存修改
        </button>
      </form>
    </div>

    <!-- Chip Transactions History -->
    <div class="rounded-none bg-white border-4 border-black p-6 shadow-brutal-lg space-y-4 text-black">
      <div class="flex items-center justify-between border-b-2 border-black pb-3">
        <h3 class="text-base font-black text-black uppercase flex items-center gap-2">
          <CreditCard class="w-5 h-5 text-black" />
          <span>筹码流水明细</span>
        </h3>
        <button
          @click="() => walletStore.fetchTransactions()"
          class="brutal-btn-white px-3 py-1 text-xs"
        >
          <RotateCw class="w-3 h-3 mr-1" />
          <span>刷新流水</span>
        </button>
      </div>

      <div class="divide-y-2 divide-black max-h-96 overflow-y-auto pr-1">
        <div v-if="walletStore.transactions.length === 0" class="py-8 text-center text-black font-bold text-xs">
          暂无筹码流水记录
        </div>
        <div
          v-for="tx in walletStore.transactions"
          :key="tx.id"
          class="py-3.5 flex items-center justify-between hover:bg-[#ffffea] transition-colors"
        >
          <div>
            <div class="text-xs font-black text-black">{{ tx.note || getTypeName(tx.type) }}</div>
            <div class="text-[10px] text-slate-500 font-mono mt-0.5">{{ tx.created_at || '刚刚' }}</div>
          </div>
          <div class="text-right">
            <div
              class="text-xs font-mono font-black flex items-center justify-end gap-1"
              :class="tx.amount >= 0 ? 'text-[#059669]' : 'text-[#ff006e]'"
            >
              <span>{{ tx.amount >= 0 ? '+' : '' }}{{ tx.amount }}</span>
              <CoinIcon customClass="w-3.5 h-3.5" />
            </div>
            <div class="text-[10px] text-black font-bold">余额: {{ tx.balance_after }}</div>
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
