<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
    <!-- Top Welcome & Quick Balance Banner -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-800 p-6 sm:p-8 shadow-2xl">
      <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div class="space-y-2 max-w-xl">
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 text-xs font-semibold">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Lucky 7 游戏大厅 · 现已开放 5 大热门玩法</span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            现代轻奢休闲竞技，<span class="bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-transparent">全端自适应畅玩</span>
          </h1>
          <p class="text-sm text-slate-400 leading-relaxed">
            涵盖炸金花、21点、德州扑克、猜大小与六合彩。支持 Supabase 数据库行驱动联机、智能 AI 陪练与全服排行榜。
          </p>
        </div>

        <!-- Quick Status & Action Card -->
        <div class="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
          <div class="flex items-center space-x-3 pr-4 sm:border-r border-slate-800">
            <div class="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl">
              🪙
            </div>
            <div>
              <div class="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">我的筹码余额</div>
              <div class="text-xl font-black font-mono text-amber-300">{{ formattedChips }}</div>
            </div>
          </div>
          <router-link
            to="/checkin"
            class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm text-center shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-1.5"
          >
            <span>📅 每日签到领币</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Games Grid Section -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>🎮 热门游戏大厅</span>
            <span class="text-xs font-mono font-normal text-slate-400">SELECT GAME</span>
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">选择心仪的经典游戏，即刻开始智勇对决</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- 1. 炸金花 -->
        <div class="group relative rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-600/60 transition-all duration-300 p-6 flex flex-col justify-between shadow-lg hover:shadow-emerald-900/20 hover:-translate-y-1">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🎴
              </div>
              <span class="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[11px] font-bold">
                三张比拼 · 心理博弈
              </span>
            </div>
            <h3 class="text-xl font-extrabold text-slate-100 group-hover:text-emerald-400 transition-colors">
              炸金花 (Golden Flower)
            </h3>
            <p class="text-xs text-slate-400 mt-2 leading-relaxed">
              三张底牌见分晓！支持闷牌（暗注）、看牌翻倍、加注与激爽比牌PK。豹子通吃，235奇袭逆转。
            </p>
            <div class="flex items-center space-x-2 mt-4 text-[11px] font-mono text-slate-500">
              <span>底注: 50 🪙</span>
              <span>•</span>
              <span>单人AI / 联机开房</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <router-link
              to="/game/zhajinhua"
              class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs text-center shadow transition-all"
            >
              开始游戏
            </router-link>
          </div>
        </div>

        <!-- 2. 21点 (Blackjack) -->
        <div class="group relative rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-600/60 transition-all duration-300 p-6 flex flex-col justify-between shadow-lg hover:shadow-amber-900/20 hover:-translate-y-1">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-700/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🃏
              </div>
              <span class="px-2.5 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800 text-[11px] font-bold">
                3:2 天王赔率
              </span>
            </div>
            <h3 class="text-xl font-extrabold text-slate-100 group-hover:text-amber-400 transition-colors">
              21点 (Blackjack)
            </h3>
            <p class="text-xs text-slate-400 mt-2 leading-relaxed">
              经典娱乐场黑杰克对决！包含要牌、停牌、双倍下注。软17庄家规则，算点智取庄家高额筹码。
            </p>
            <div class="flex items-center space-x-2 mt-4 text-[11px] font-mono text-slate-500">
              <span>自由下注</span>
              <span>•</span>
              <span>智能 Ace 点数计算</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <router-link
              to="/game/blackjack"
              class="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs text-center shadow transition-all"
            >
              开始挑战
            </router-link>
          </div>
        </div>

        <!-- 3. 德州扑克 (Texas Hold'em) -->
        <div class="group relative rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-600/60 transition-all duration-300 p-6 flex flex-col justify-between shadow-lg hover:shadow-indigo-900/20 hover:-translate-y-1">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                ♠️
              </div>
              <span class="px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800 text-[11px] font-bold">
                7选5牌型评级
              </span>
            </div>
            <h3 class="text-xl font-extrabold text-slate-100 group-hover:text-indigo-400 transition-colors">
              德州扑克 (Texas Hold'em)
            </h3>
            <p class="text-xs text-slate-400 mt-2 leading-relaxed">
              国际风靡的智力竞技！翻牌前、翻牌、转牌、河牌四轮下注，过牌、跟注、加注与全下(All-in)。
            </p>
            <div class="flex items-center space-x-2 mt-4 text-[11px] font-mono text-slate-500">
              <span>盲注: 50/100 🪙</span>
              <span>•</span>
              <span>皇家同花顺至高牌</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <router-link
              to="/game/texas"
              class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs text-center shadow transition-all"
            >
              入席对决
            </router-link>
          </div>
        </div>

        <!-- 4. 猜大小 (Sic Bo) -->
        <div class="group relative rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-rose-600/60 transition-all duration-300 p-6 flex flex-col justify-between shadow-lg hover:shadow-rose-900/20 hover:-translate-y-1">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-700/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🎲
              </div>
              <span class="px-2.5 py-1 rounded-full bg-rose-950 text-rose-400 border border-rose-800 text-[11px] font-bold">
                最高 60 倍
              </span>
            </div>
            <h3 class="text-xl font-extrabold text-slate-100 group-hover:text-rose-400 transition-colors">
              猜大小 · 骰宝 (Sic Bo)
            </h3>
            <p class="text-xs text-slate-400 mt-2 leading-relaxed">
              3颗骰子摇盅开奖！涵盖大、小、单、双、全围豹子(1:30)及 4-17 点高倍赔率，即开即算。
            </p>
            <div class="flex items-center space-x-2 mt-4 text-[11px] font-mono text-slate-500">
              <span>近期走势图</span>
              <span>•</span>
              <span>物理骰盅摇动动效</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <router-link
              to="/game/sicbo"
              class="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs text-center shadow transition-all"
            >
              摇骰开盅
            </router-link>
          </div>
        </div>

        <!-- 5. 猜点数六合彩 (Mark Six) -->
        <div class="group relative rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-sky-600/60 transition-all duration-300 p-6 flex flex-col justify-between shadow-lg hover:shadow-sky-900/20 hover:-translate-y-1">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-sky-950/80 border border-sky-700/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🎱
              </div>
              <span class="px-2.5 py-1 rounded-full bg-sky-950 text-sky-400 border border-sky-800 text-[11px] font-bold">
                特码 47 倍
              </span>
            </div>
            <h3 class="text-xl font-extrabold text-slate-100 group-hover:text-sky-400 transition-colors">
              猜点数六合彩 (Mark Six)
            </h3>
            <p class="text-xs text-slate-400 mt-2 leading-relaxed">
              1-49特码摇奖机滚球！支持特码直选、大小单双、红蓝绿三色波及十二生肖多维下注。
            </p>
            <div class="flex items-center space-x-2 mt-4 text-[11px] font-mono text-slate-500">
              <span>即开型滚球</span>
              <span>•</span>
              <span>历史特码统计</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <router-link
              to="/game/marksix"
              class="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs text-center shadow transition-all"
            >
              即刻开奖
            </router-link>
          </div>
        </div>

        <!-- 6. 联机房间大厅入口 (Multiplayer Lobby) -->
        <div class="group relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-800/40 hover:border-emerald-500 transition-all duration-300 p-6 flex flex-col justify-between shadow-lg hover:-translate-y-1">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-2xl bg-emerald-900/60 border border-emerald-500/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🌐
              </div>
              <span class="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600 text-[11px] font-bold">
                Supabase 联机
              </span>
            </div>
            <h3 class="text-xl font-extrabold text-slate-100 group-hover:text-emerald-400 transition-colors">
              在线联机房间大厅
            </h3>
            <p class="text-xs text-slate-400 mt-2 leading-relaxed">
              全数据库行驱动（Database-driven）实时对战！创建房间、自定义底注、邀请好友实时落座同台较量。
            </p>
            <div class="flex items-center space-x-2 mt-4 text-[11px] font-mono text-emerald-400">
              <span>● Supabase Realtime 活跃</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-800/80">
            <button
              @click="openRoomLobby"
              class="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs text-center shadow transition-all"
            >
              浏览联机房间
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Multiplayer Lobby Modal -->
    <Modal v-model="showRoomModal" title="在线联机对战大厅">
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-400">选择房间即刻入座：</span>
          <button
            @click="showCreateModal = true"
            class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
          >
            + 创建新房间
          </button>
        </div>

        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div
            v-for="rm in roomStore.activeRooms"
            :key="rm.id"
            class="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
          >
            <div>
              <div class="text-sm font-bold text-slate-200">{{ rm.name }}</div>
              <div class="text-xs text-slate-400 font-mono mt-0.5">
                底注: {{ rm.min_bet }} 🪙 · 人数上限: {{ rm.max_players }}
              </div>
            </div>
            <button
              @click="joinRoomAndEnter(rm)"
              class="px-3.5 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold transition-all"
            >
              加入房间
            </button>
          </div>
        </div>
      </div>
    </Modal>

    <!-- Create Room Modal -->
    <Modal v-model="showCreateModal" title="创建联机房间">
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">房间名称</label>
          <input
            v-model="newRoomName"
            type="text"
            placeholder="例如: 谁与争锋好友桌"
            class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">游戏玩法</label>
          <select
            v-model="newRoomType"
            class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="zhajinhua">炸金花 (Golden Flower)</option>
            <option value="blackjack">21点 (Blackjack)</option>
            <option value="texas">德州扑克 (Texas Hold'em)</option>
            <option value="sicbo">猜大小 (Sic Bo)</option>
            <option value="marksix">猜点数六合彩 (Mark Six)</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">底注要求 (🪙)</label>
          <input
            v-model.number="newRoomMinBet"
            type="number"
            min="10"
            step="10"
            class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      </div>
      <template #footer>
        <button
          @click="submitCreateRoom"
          class="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all"
        >
          立即创建并进入
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRoomStore } from '@/stores/room'
import Modal from '@/components/common/Modal.vue'
import type { GameRoom } from '@/types/database'

const router = useRouter()
const authStore = useAuthStore()
const roomStore = useRoomStore()

const showRoomModal = ref(false)
const showCreateModal = ref(false)
const newRoomName = ref('')
const newRoomType = ref<GameRoom['game_type']>('zhajinhua')
const newRoomMinBet = ref(50)

const formattedChips = computed(() => {
  return new Intl.NumberFormat('en-US').format(authStore.userChips)
})

onMounted(() => {
  roomStore.fetchRooms()
})

function openRoomLobby() {
  roomStore.fetchRooms()
  showRoomModal.value = true
}

async function submitCreateRoom() {
  const room = await roomStore.createRoom(
    newRoomType.value,
    newRoomName.value,
    newRoomMinBet.value
  )
  if (room) {
    showCreateModal.value = false
    showRoomModal.value = false
    router.push(`/game/${room.game_type}`)
  }
}

function joinRoomAndEnter(room: GameRoom) {
  showRoomModal.value = false
  router.push(`/game/${room.game_type}`)
}
</script>
