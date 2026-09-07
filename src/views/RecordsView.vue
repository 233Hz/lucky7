<template>
  <div class="max-w-5xl mx-auto px-4 py-8 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-extrabold text-white flex items-center gap-2">
          <History class="w-6 h-6 text-emerald-400" />
          <span>对局战绩历史</span>
        </h1>
        <p class="text-xs text-slate-400 mt-1">查看您在各游戏中的下注明细与盈亏记录</p>
      </div>

      <!-- Filter by Game -->
      <select
        v-model="selectedGameFilter"
        class="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
      >
        <option value="all">全部玩法</option>
        <option value="zhajinhua">炸金花</option>
        <option value="blackjack">21点</option>
        <option value="texas">德州扑克</option>
        <option value="sicbo">猜大小</option>
        <option value="marksix">六合彩</option>
      </select>
    </div>

    <!-- Summary Stats Bar -->
    <div class="grid grid-cols-3 gap-4">
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
        <div class="text-xs text-slate-400">累计局数</div>
        <div class="text-xl font-black font-mono text-slate-100 mt-1">{{ filteredRecords.length }}</div>
      </div>
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
        <div class="text-xs text-slate-400">总胜率</div>
        <div class="text-xl font-black font-mono text-emerald-400 mt-1">{{ winRate }}%</div>
      </div>
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
        <div class="text-xs text-slate-400">净盈亏汇总</div>
        <div class="text-xl font-black font-mono mt-1 flex items-center justify-center gap-1" :class="totalNetProfit >= 0 ? 'text-amber-300' : 'text-rose-400'">
          <span>{{ totalNetProfit >= 0 ? '+' : '' }}{{ totalNetProfit }}</span>
          <CoinIcon customClass="w-4 h-4" />
        </div>
      </div>
    </div>

    <!-- Records Table -->
    <div class="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
      <div v-if="filteredRecords.length === 0" class="py-16 text-center text-slate-500 text-sm">
        暂无对局战绩，快去游戏大厅挑战一局吧！
      </div>

      <div v-else class="divide-y divide-slate-800">
        <div
          v-for="rec in filteredRecords"
          :key="rec.id"
          class="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
        >
          <div class="flex items-center space-x-3">
            <span class="px-2.5 py-1 rounded-lg text-xs font-bold" :class="getGameTagClass(rec.game_type)">
              {{ getGameName(rec.game_type) }}
            </span>
            <div class="text-xs text-slate-400">
              {{ formatDate(rec.created_at) }}
            </div>
          </div>

          <div class="flex items-center space-x-6 text-xs font-mono">
            <div class="text-slate-400 flex items-center gap-1">
              <span>下注:</span>
              <span class="text-slate-200 font-bold">{{ rec.bet_amount }}</span>
              <CoinIcon customClass="w-3.5 h-3.5" />
            </div>
            <div class="text-slate-400 flex items-center gap-1">
              <span>派彩:</span>
              <span class="text-slate-200 font-bold">{{ rec.payout }}</span>
              <CoinIcon customClass="w-3.5 h-3.5" />
            </div>
            <div
              class="font-black text-sm px-3 py-1 rounded-full flex items-center gap-1"
              :class="rec.net_profit > 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : rec.net_profit < 0 ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-slate-800 text-slate-300'"
            >
              <span>{{ rec.net_profit >= 0 ? '+' : '' }}{{ rec.net_profit }}</span>
              <CoinIcon customClass="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { History } from 'lucide-vue-next'
import { useWalletStore } from '@/stores/wallet'
import CoinIcon from '@/components/common/CoinIcon.vue'

const walletStore = useWalletStore()
const selectedGameFilter = ref('all')

onMounted(() => {
  walletStore.fetchGameRecords()
})

const filteredRecords = computed(() => {
  if (selectedGameFilter.value === 'all') {
    return walletStore.gameRecords
  }
  return walletStore.gameRecords.filter(r => r.game_type === selectedGameFilter.value)
})

const totalNetProfit = computed(() => {
  return filteredRecords.value.reduce((acc, r) => acc + r.net_profit, 0)
})

const winRate = computed(() => {
  if (filteredRecords.value.length === 0) return 0
  const winCount = filteredRecords.value.filter(r => r.net_profit > 0).length
  return Math.round((winCount / filteredRecords.value.length) * 100)
})

function getGameName(type: string): string {
  switch (type) {
    case 'zhajinhua': return '炸金花'
    case 'blackjack': return '21点'
    case 'texas': return '德州扑克'
    case 'sicbo': return '猜大小'
    case 'marksix': return '六合彩'
    default: return type
  }
}

function getGameTagClass(type: string): string {
  switch (type) {
    case 'zhajinhua': return 'bg-emerald-950 text-emerald-400 border border-emerald-800'
    case 'blackjack': return 'bg-amber-950 text-amber-400 border border-amber-800'
    case 'texas': return 'bg-indigo-950 text-indigo-400 border border-indigo-800'
    case 'sicbo': return 'bg-rose-950 text-rose-400 border border-rose-800'
    case 'marksix': return 'bg-sky-950 text-sky-400 border border-sky-800'
    default: return 'bg-slate-800 text-slate-300'
  }
}

function formatDate(iso?: string): string {
  if (!iso) return '刚刚'
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>
