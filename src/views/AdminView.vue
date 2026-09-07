<template>
  <div class="max-w-6xl mx-auto px-4 py-8 space-y-8 font-mono">
    <!-- Non-admin protection alert -->
    <div v-if="!authStore.isAdmin" class="rounded-none bg-white border-4 border-black p-8 text-center space-y-4 shadow-brutal-xl text-black">
      <div class="w-16 h-16 rounded-none bg-[#ff006e] border-3 border-black text-white mx-auto flex items-center justify-center shadow-brutal">
        <ShieldX class="w-9 h-9" />
      </div>
      <h2 class="text-3xl font-black text-black uppercase">无权访问管理后台</h2>
      <p class="text-xs sm:text-sm text-black max-w-lg mx-auto leading-relaxed font-bold">
        当前账号未具备管理员访问权限。如需开通后台权限，请在后台控制台中执行如下授权命令：
      </p>
      <div class="p-3 rounded-none bg-[#ffffea] border-2 border-black font-mono text-xs text-black font-black max-w-md mx-auto overflow-x-auto shadow-brutal-sm">
        update public.profiles set is_admin = true where email = '{{ authStore.user?.email || '你的邮箱' }}';
      </div>
      <router-link to="/" class="brutal-btn-lime px-6 py-2.5 text-xs inline-block">
        返回大厅首页
      </router-link>
    </div>

    <!-- Admin Panel -->
    <div v-else class="space-y-6">
      <!-- Admin Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <h1 class="text-3xl font-black text-black uppercase flex items-center gap-2">
            <Shield class="w-8 h-8 text-black" />
            <span>系统管理控制台</span>
            <span class="px-2.5 py-0.5 rounded-none bg-[#ff9500] text-black border-2 border-black text-xs font-black shadow-brutal-sm">
              SUPER ADMIN
            </span>
          </h1>
          <p class="text-xs text-black font-bold mt-1">支持全服玩家资产调账、赠送筹码与账户管理</p>
        </div>

        <!-- Search Input -->
        <div class="w-full sm:w-72">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索玩家昵称或邮箱..."
            class="brutal-input w-full px-3.5 py-2 text-xs"
          />
        </div>
      </div>

      <!-- Quick Metrics Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-5 rounded-none bg-white border-4 border-black shadow-brutal">
          <div class="text-xs text-black font-black uppercase">注册玩家总数</div>
          <div class="text-2xl font-black text-black mt-1">{{ playersList.length }} 位</div>
        </div>
        <div class="p-5 rounded-none bg-white border-4 border-black shadow-brutal">
          <div class="text-xs text-black font-black uppercase">全服流通虚拟币</div>
          <div class="text-2xl font-black text-black mt-1 flex items-center gap-1.5">
            <CoinIcon customClass="w-6 h-6" />
            <span>{{ totalCirculatingChips }}</span>
          </div>
        </div>
        <div class="p-5 rounded-none bg-white border-4 border-black shadow-brutal">
          <div class="text-xs text-black font-black uppercase">管理操作模式</div>
          <div class="text-base font-black text-[#059669] mt-2 flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-none bg-[#059669] border border-black"></span>
            <span>数据库原子 RPC 事务</span>
          </div>
        </div>
      </div>

      <!-- Lottery Draw Cycle Settings Card -->
      <div class="rounded-none bg-white border-4 border-black p-6 shadow-brutal-lg space-y-4">
        <div class="flex items-center justify-between border-b-2 border-black pb-3">
          <div class="flex items-center gap-2">
            <Timer class="w-5 h-5 text-black" />
            <h2 class="text-base font-black text-black uppercase">全服游戏开奖周期配置</h2>
          </div>
          <span class="px-2 py-0.5 rounded-none bg-[#ccff00] border border-black text-xs font-black">
            实时全服生效
          </span>
        </div>
        <p class="text-xs text-black font-bold">
          配置“猜大小”与“猜六合彩”全服定时开奖的循环周期。所有客户端将严格根据此配置同步倒计时与期号。
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <!-- 猜大小周期 -->
          <div class="p-4 rounded-none bg-[#f4f4f0] border-2 border-black shadow-brutal-sm space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-black">猜大小 · 骰宝 (Sic Bo)</span>
              <span class="text-xs font-mono font-black text-black bg-[#ffff00] px-2 py-0.5 border border-black">
                当前: {{ lotteryStore.sicboCycleSeconds }} 秒
              </span>
            </div>
            <div class="flex items-center gap-2">
              <input
                v-model.number="editSicboCycle"
                type="number"
                min="10"
                max="300"
                step="5"
                class="brutal-input flex-1 px-3 py-1.5 text-xs font-mono font-black"
              />
              <span class="text-xs font-black">秒</span>
            </div>
            <div class="flex items-center gap-1.5 pt-1">
              <button
                v-for="sec in [15, 30, 45, 60]"
                :key="sec"
                type="button"
                @click="editSicboCycle = sec"
                class="px-2 py-0.5 text-[11px] font-mono font-black border border-black bg-white hover:bg-[#ccff00]"
                :class="editSicboCycle === sec ? 'bg-[#ccff00]' : ''"
              >
                {{ sec }}s
              </button>
            </div>
          </div>

          <!-- 猜六合彩周期 -->
          <div class="p-4 rounded-none bg-[#f4f4f0] border-2 border-black shadow-brutal-sm space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-black">猜点数六合彩 (Mark Six)</span>
              <span class="text-xs font-mono font-black text-black bg-[#ffff00] px-2 py-0.5 border border-black">
                当前: {{ lotteryStore.marksixCycleSeconds }} 秒
              </span>
            </div>
            <div class="flex items-center gap-2">
              <input
                v-model.number="editMarksixCycle"
                type="number"
                min="15"
                max="600"
                step="10"
                class="brutal-input flex-1 px-3 py-1.5 text-xs font-mono font-black"
              />
              <span class="text-xs font-black">秒</span>
            </div>
            <div class="flex items-center gap-1.5 pt-1">
              <button
                v-for="sec in [30, 60, 90, 120]"
                :key="sec"
                type="button"
                @click="editMarksixCycle = sec"
                class="px-2 py-0.5 text-[11px] font-mono font-black border border-black bg-white hover:bg-[#ccff00]"
                :class="editMarksixCycle === sec ? 'bg-[#ccff00]' : ''"
              >
                {{ sec }}s
              </button>
            </div>
          </div>
        </div>
        <div class="flex items-center justify-between pt-2">
          <span v-if="cycleSaveSuccess" class="text-xs font-black text-[#059669] flex items-center gap-1">
            <Check class="w-4 h-4" />
            <span>开奖周期配置已成功更新并保存！</span>
          </span>
          <span v-else></span>
          <button
            @click="saveLotteryCycles"
            class="brutal-btn-lime px-6 py-2 text-xs flex items-center gap-1.5"
          >
            <Check class="w-4 h-4" />
            <span>保存开奖周期配置</span>
          </button>
        </div>
      </div>

      <!-- Players Management Table -->
      <div class="rounded-none bg-white border-4 border-black overflow-hidden shadow-brutal-lg">
        <div class="px-6 py-4 border-b-2 border-black bg-[#f4f4f0] flex items-center justify-between">
          <span class="text-xs font-black text-black uppercase tracking-wider">玩家档案与资产列表</span>
          <button
            @click="fetchPlayers"
            class="brutal-btn-lime px-3 py-1 text-xs"
          >
            <RotateCw class="w-3.5 h-3.5 mr-1" />
            <span>刷新列表</span>
          </button>
        </div>

        <div class="divide-y-2 divide-black">
          <div
            v-for="p in filteredPlayers"
            :key="p.id"
            class="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#ffffea] transition-colors"
          >
            <div class="flex items-center space-x-3.5">
              <img
                :src="p.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + p.id"
                class="w-10 h-10 rounded-none border-2 border-black bg-slate-100 shadow-brutal-sm"
              />
              <div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-black text-black">{{ p.nickname }}</span>
                  <span v-if="p.is_admin" class="px-1.5 py-0.5 rounded-none text-[10px] font-black bg-[#ff9500] text-black border border-black shadow-brutal-sm">
                    管理员
                  </span>
                </div>
                <div class="text-xs text-slate-600 font-bold mt-0.5">{{ p.email }}</div>
              </div>
            </div>

            <div class="flex items-center space-x-4 sm:space-x-6 justify-between sm:justify-end">
              <div class="text-right">
                <div class="text-[10px] text-black font-black uppercase">当前筹码</div>
                <div class="text-sm font-black text-black flex items-center justify-end gap-1">
                  <CoinIcon customClass="w-3.5 h-3.5" />
                  <span>{{ formatChips(p.chips) }}</span>
                </div>
              </div>

              <button
                @click="openGrantModal(p)"
                class="brutal-btn-orange px-4 py-2 text-xs"
              >
                <Gift class="w-3.5 h-3.5 mr-1.5" />
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
        <div class="p-3.5 rounded-none bg-[#ffffea] border-2 border-black flex items-center space-x-3 shadow-brutal-sm">
          <img
            :src="selectedTarget.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + selectedTarget.id"
            class="w-8 h-8 rounded-none border border-black bg-white"
          />
          <div>
            <div class="text-xs font-black text-black">{{ selectedTarget.nickname }} ({{ selectedTarget.email }})</div>
            <div class="text-xs text-black font-black flex items-center gap-1 mt-0.5">
              <span>现存余额: {{ formatChips(selectedTarget.chips) }}</span>
              <CoinIcon customClass="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-black text-black uppercase mb-1">调整额度 (正数为赠送，负数为划扣)</label>
          <input
            v-model.number="grantAmount"
            type="number"
            step="1000"
            class="brutal-input w-full px-3.5 py-2.5 text-sm font-black"
          />
        </div>

        <!-- Quick Amount Pills -->
        <div class="flex items-center space-x-2 flex-wrap gap-y-1.5">
          <button
            v-for="amt in [5000, 10000, 50000, 100000]"
            :key="amt"
            type="button"
            @click="grantAmount = amt"
            class="brutal-btn-white px-3 py-1 text-xs font-mono font-bold"
          >
            +{{ amt / 1000 }}k
          </button>
        </div>

        <div>
          <label class="block text-xs font-black text-black uppercase mb-1">赠送事由 / 备注说明</label>
          <input
            v-model="grantReason"
            type="text"
            placeholder="例如: VIP玩家专享体验金"
            class="brutal-input w-full px-3.5 py-2 text-xs"
          />
        </div>
      </div>

      <template #footer>
        <button
          @click="submitGrant"
          :disabled="isSubmitting || grantAmount === 0"
          class="brutal-btn-lime w-full py-2.5 text-sm"
        >
          <Gift class="w-4 h-4 mr-1.5" />
          <span>{{ isSubmitting ? '正在写入数据库...' : '确认调账并记录流水' }}</span>
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Shield, ShieldX, RotateCw, Gift, Timer, Check } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useLotteryStore } from '@/stores/lottery'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import Modal from '@/components/common/Modal.vue'
import CoinIcon from '@/components/common/CoinIcon.vue'
import type { Profile } from '@/types/database'

const authStore = useAuthStore()
const lotteryStore = useLotteryStore()
const playersList = ref<Profile[]>([])
const searchQuery = ref('')

// 开奖周期配置响应式编辑状态
const editSicboCycle = ref(lotteryStore.sicboCycleSeconds)
const editMarksixCycle = ref(lotteryStore.marksixCycleSeconds)
const cycleSaveSuccess = ref(false)

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

function saveLotteryCycles() {
  lotteryStore.updateCycles(editSicboCycle.value, editMarksixCycle.value)
  cycleSaveSuccess.value = true
  setTimeout(() => {
    cycleSaveSuccess.value = false
  }, 3000)
}
</script>
