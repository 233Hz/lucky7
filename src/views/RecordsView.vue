<template>
  <div class="max-w-5xl mx-auto px-4 py-8 space-y-6 font-mono">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-[#1a1a1a] pb-4">
      <div>
        <h1 class="text-3xl font-black text-[#1a1a1a] uppercase flex items-center gap-2">
          <History class="w-8 h-8 text-[#1a1a1a]" />
          <span>对局战绩历史 · HISTORY</span>
        </h1>
        <p class="text-xs text-[#4a4a4a] font-bold mt-1">查看您在各游戏中的下注明细与盈亏记录</p>
      </div>

      <!-- Filter by Game -->
      <ComicSelect
        v-model="selectedGameFilter"
        :options="gameFilterOptions"
        triggerClass="text-xs py-2 px-3.5 font-black min-w-[130px]"
      />
    </div>

    <!-- Summary Stats Bar -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="p-5 rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] text-center">
        <div class="text-xs text-[#1a1a1a] font-black uppercase">累计局数</div>
        <div class="text-2xl font-black text-[#1a1a1a] mt-1">{{ filteredRecords.length }} 局</div>
      </div>
      <div class="p-5 rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] text-center">
        <div class="text-xs text-[#1a1a1a] font-black uppercase">总胜率</div>
        <div class="text-2xl font-black text-[#1a1a1a] mt-1">{{ winRate }}%</div>
      </div>
      <div class="p-5 rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] text-center">
        <div class="text-xs text-[#1a1a1a] font-black uppercase">净盈亏汇总</div>
        <div class="text-2xl font-black mt-1 flex items-center justify-center gap-1" :class="totalNetProfit >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'">
          <span>{{ totalNetProfit >= 0 ? '+' : '' }}{{ totalNetProfit }}</span>
          <CoinIcon customClass="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- Records Table -->
    <div class="rounded-lg bg-white border-4 border-[#1a1a1a] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] overflow-hidden">
      <div v-if="filteredRecords.length === 0" class="py-16 text-center text-[#1a1a1a] font-bold text-sm">
        暂无对局战绩，快去游戏大厅挑战一局吧！
      </div>

      <div v-else class="divide-y-3 divide-[#1a1a1a]">
        <div
          v-for="rec in filteredRecords"
          :key="rec.id"
          class="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#fffef0] transition-colors"
        >
          <div class="flex items-center space-x-3">
            <span class="px-2.5 py-1 rounded-md text-xs font-black uppercase border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]" :class="getGameTagClass(rec.game_type)">
              {{ getGameName(rec.game_type) }}
            </span>
            <div class="text-xs text-[#4a4a4a] font-bold">
              {{ formatDate(rec.created_at) }}
            </div>
          </div>

          <div class="flex items-center space-x-6 text-xs">
            <div class="text-[#1a1a1a] font-bold flex items-center gap-1">
              <span>下注:</span>
              <span class="text-[#1a1a1a] font-black">{{ rec.bet_amount }}</span>
              <CoinIcon customClass="w-3.5 h-3.5" />
            </div>
            <div class="text-[#1a1a1a] font-bold flex items-center gap-1">
              <span>派彩:</span>
              <span class="text-[#1a1a1a] font-black">{{ rec.payout }}</span>
              <CoinIcon customClass="w-3.5 h-3.5" />
            </div>
            <div
              class="font-black text-sm px-3 py-1 rounded-md border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] flex items-center gap-1"
              :class="rec.net_profit > 0 ? 'bg-[#22c55e] text-white' : rec.net_profit < 0 ? 'bg-[#ef4444] text-white' : 'bg-white text-[#1a1a1a]'"
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
import ComicSelect from '@/components/common/ComicSelect.vue'

const walletStore = useWalletStore()
const selectedGameFilter = ref('all')

const gameFilterOptions = [
  { value: 'all', label: '全部玩法' },
  { value: 'zhajinhua', label: '炸金花' },
  { value: 'blackjack', label: '21点' },
  { value: 'texas', label: '德州扑克' },
  { value: 'sicbo', label: '猜大小' },
  { value: 'marksix', label: '六合彩' }
]

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
    case 'zhajinhua': return 'bg-[#facc15] text-[#1a1a1a]'
    case 'blackjack': return 'bg-[#ef4444] text-white'
    case 'texas': return 'bg-[#3b82f6] text-white'
    case 'sicbo': return 'bg-[#ef4444] text-white'
    case 'marksix': return 'bg-[#22c55e] text-white'
    default: return 'bg-white text-[#1a1a1a]'
  }
}

function formatDate(iso?: string): string {
  if (!iso) return '刚刚'
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>
