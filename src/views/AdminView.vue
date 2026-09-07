<template>
  <div class="max-w-6xl mx-auto px-4 py-8 space-y-8">
    <!-- Non-admin protection alert -->
    <div v-if="!authStore.isAdmin" class="rounded-3xl bg-rose-950/80 border border-rose-800 p-8 text-center space-y-4">
      <div class="w-16 h-16 rounded-full bg-rose-900/40 border border-rose-700/60 text-rose-400 mx-auto flex items-center justify-center">
        <ShieldX class="w-8 h-8" />
      </div>
      <h2 class="text-2xl font-black text-rose-300">无权访问管理后台</h2>
      <p class="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
        当前账号未设置管理员权限。如需成为管理员，请在 Supabase SQL Editor 中执行如下命令：
      </p>
      <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 max-w-md mx-auto overflow-x-auto">
        update public.profiles set is_admin = true where email = '{{ authStore.user?.email || '你的邮箱' }}';
      </div>
      <router-link to="/" class="inline-block px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all">
        返回大厅首页
      </router-link>
    </div>

    <!-- Admin Panel -->
    <div v-else class="space-y-6">
      <!-- Admin Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-white flex items-center gap-2">
            <Shield class="w-7 h-7 text-amber-400" />
            <span>系统管理控制台</span>
            <span class="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-xs font-bold">
              SUPER ADMIN
            </span>
          </h1>
          <p class="text-xs text-slate-400 mt-1">支持全服玩家资产调账、赠送筹码与账户管理</p>
        </div>

        <!-- Search Input -->
        <div class="w-full sm:w-72">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索玩家昵称或邮箱..."
            class="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <!-- Quick Metrics Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div class="text-xs text-slate-400 font-semibold">注册玩家总数</div>
          <div class="text-2xl font-black font-mono text-slate-100 mt-1">{{ playersList.length }} 位</div>
        </div>
        <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div class="text-xs text-slate-400 font-semibold">全服流通虚拟币</div>
          <div class="text-2xl font-black font-mono text-amber-400 mt-1 flex items-center gap-1.5">
            <CoinIcon customClass="w-6 h-6" />
            <span>{{ totalCirculatingChips }}</span>
          </div>
        </div>
        <div class="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div class="text-xs text-slate-400 font-semibold">管理操作模式</div>
          <div class="text-base font-bold text-emerald-400 mt-2 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>数据库原子 RPC 事务</span>
          </div>
        </div>
      </div>

      <!-- Players Management Table -->
      <div class="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <span class="text-xs font-bold text-slate-300 uppercase tracking-wider">玩家档案与资产列表</span>
          <button
            @click="fetchPlayers"
            class="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5"
          >
            <RotateCw class="w-3.5 h-3.5" />
            <span>刷新列表</span>
          </button>
        </div>

        <div class="divide-y divide-slate-800">
          <div
            v-for="p in filteredPlayers"
            :key="p.id"
            class="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
          >
            <div class="flex items-center space-x-3.5">
              <img
                :src="p.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + p.id"
                class="w-10 h-10 rounded-full border border-slate-700 bg-slate-800"
              />
              <div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-bold text-slate-200">{{ p.nickname }}</span>
                  <span v-if="p.is_admin" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                    管理员
                  </span>
                </div>
                <div class="text-xs text-slate-400 font-mono mt-0.5">{{ p.email }}</div>
              </div>
            </div>

            <div class="flex items-center space-x-4 sm:space-x-6 justify-between sm:justify-end">
              <div class="text-right">
                <div class="text-[10px] text-slate-400 font-semibold">当前筹码</div>
                <div class="text-sm font-black font-mono text-amber-300 flex items-center justify-end gap-1">
                  <CoinIcon customClass="w-3.5 h-3.5" />
                  <span>{{ formatChips(p.chips) }}</span>
                </div>
              </div>

              <button
                @click="openGrantModal(p)"
                class="px-4 py-2 rounded-xl bg-amber-600/90 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow transition-all flex items-center space-x-1.5"
              >
                <Gift class="w-3.5 h-3.5" />
                <span>赠送/调整筹码</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grant Chips Modal -->
    <Modal v-model="showGrantModal" title="后台赠送 / 调整筹码">
      <div v-if="selectedTarget" class="space-y-4">
        <div class="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-3">
          <img
            :src="selectedTarget.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + selectedTarget.id"
            class="w-8 h-8 rounded-full"
          />
          <div>
            <div class="text-xs font-bold text-slate-200">{{ selectedTarget.nickname }} ({{ selectedTarget.email }})</div>
            <div class="text-xs text-amber-400 font-mono font-bold flex items-center gap-1">
              <span>现存余额: {{ formatChips(selectedTarget.chips) }}</span>
              <CoinIcon customClass="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">调整额度 (正数为赠送，负数为划扣)</label>
          <input
            v-model.number="grantAmount"
            type="number"
            step="1000"
            class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-amber-300 font-black focus:outline-none focus:border-amber-500"
          />
        </div>

        <!-- Quick Amount Pills -->
        <div class="flex items-center space-x-2 flex-wrap gap-y-1.5">
          <button
            v-for="amt in [5000, 10000, 50000, 100000]"
            :key="amt"
            type="button"
            @click="grantAmount = amt"
            class="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            +{{ amt / 1000 }}k
          </button>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">赠送事由 / 备注说明</label>
          <input
            v-model="grantReason"
            type="text"
            placeholder="例如: VIP玩家专享体验金"
            class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <template #footer>
        <button
          @click="submitGrant"
          :disabled="isSubmitting || grantAmount === 0"
          class="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          <Gift class="w-4 h-4" />
          <span>{{ isSubmitting ? '正在写入数据库...' : '确认调账并记录流水' }}</span>
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Shield, ShieldX, RotateCw, Gift } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import Modal from '@/components/common/Modal.vue'
import CoinIcon from '@/components/common/CoinIcon.vue'
import type { Profile } from '@/types/database'

const authStore = useAuthStore()
const playersList = ref<Profile[]>([])
const searchQuery = ref('')

const showGrantModal = ref(false)
const selectedTarget = ref<Profile | null>(null)
const grantAmount = ref(10000)
const grantReason = ref('管理员后台赠送体验金')
const isSubmitting = ref(false)

onMounted(() => {
  fetchPlayers()
})

const filteredPlayers = computed(() => {
  if (!searchQuery.value.trim()) return playersList.value
  const q = searchQuery.value.toLowerCase()
  return playersList.value.filter(p =>
    (p.nickname || '').toLowerCase().includes(q) ||
    (p.email || '').toLowerCase().includes(q)
  )
})

const totalCirculatingChips = computed(() => {
  const sum = playersList.value.reduce((acc, p) => acc + (p.chips || 0), 0)
  return formatChips(sum)
})

function formatChips(val?: number): string {
  return new Intl.NumberFormat('en-US').format(val ?? 0)
}

async function fetchPlayers() {
  if (!isSupabaseConfigured()) {
    // 演示模式提供测试玩家列表
    playersList.value = [
      authStore.profile || { id: 'admin', email: 'admin@lucky7.game', nickname: '系统超级管理员', avatar_url: '', chips: 100000, is_admin: true },
      { id: 'usr_01', email: 'stephen@lucky7.game', nickname: '阿星', avatar_url: '', chips: 10000, is_admin: false },
      { id: 'usr_02', email: 'god@lucky7.game', nickname: '高进', avatar_url: '', chips: 88880, is_admin: false },
      { id: 'usr_03', email: 'knife@lucky7.game', nickname: '小刀', avatar_url: '', chips: 5000, is_admin: false }
    ]
    return
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      playersList.value = data as Profile[]
    }
  } catch (err) {
    console.error('Fetch players error:', err)
  }
}

function openGrantModal(p: Profile) {
  selectedTarget.value = p
  grantAmount.value = 10000
  grantReason.value = '管理员后台赠送体验金'
  showGrantModal.value = true
}

async function submitGrant() {
  if (!selectedTarget.value || grantAmount.value === 0) return
  isSubmitting.value = true

  if (!isSupabaseConfigured()) {
    selectedTarget.value.chips += grantAmount.value
    if (selectedTarget.value.id === authStore.profile?.id) {
      authStore.profile.chips = selectedTarget.value.chips
    }
    showGrantModal.value = false
    isSubmitting.value = false
    alert(`成功为 ${selectedTarget.value.nickname} 调整筹码 ${grantAmount.value}！`)
    return
  }

  try {
    const { data, error } = await supabase.rpc('admin_grant_chips', {
      p_target_user_id: selectedTarget.value.id,
      p_amount: grantAmount.value,
      p_reason: grantReason.value
    })

    if (error) throw error
    const res = data as { success: boolean; new_balance?: number; message?: string }

    if (res.success) {
      selectedTarget.value.chips = res.new_balance || (selectedTarget.value.chips + grantAmount.value)
      if (selectedTarget.value.id === authStore.profile?.id) {
        authStore.profile.chips = selectedTarget.value.chips
      }
      showGrantModal.value = false
      alert(`调账成功！目标玩家最新余额: ${selectedTarget.value.chips}`)
    } else {
      alert(res.message || '调账失败')
    }
  } catch (err: unknown) {
    const e = err as { message?: string }
    alert('操作异常: ' + (e.message || '请检查权限'))
  } finally {
    isSubmitting.value = false
  }
}
</script>
