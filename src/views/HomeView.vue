<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
    <!-- Top Welcome & Quick Balance Banner -->
    <div class="relative rounded-none bg-[#ccff00] border-4 border-black p-6 sm:p-10 shadow-brutal-lg">
      <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div class="space-y-3 max-w-xl">
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-none bg-black text-[#ccff00] border-2 border-black text-xs font-black uppercase font-mono shadow-brutal-sm">
            <span class="w-2 h-2 rounded-none bg-[#ccff00] animate-ping"></span>
            <span>LUCKY 7 ARCADE · 现已开放 5 大热门玩法</span>
          </div>
          <h1 class="text-3xl sm:text-5xl font-black tracking-tight text-black uppercase">
            经典街机棋牌，<span class="bg-black text-[#ccff00] px-2 py-0.5 inline-block -rotate-1">畅享即刻开局</span>
          </h1>
          <p class="text-xs sm:text-sm text-black font-mono font-bold leading-relaxed">
            涵盖炸金花、21点、德州扑克、猜大小与六合彩。支持多人实时联机对决、智能 AI 陪练与全服财富排行榜。
          </p>
        </div>

        <!-- Quick Status & Action Card -->
        <div class="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white p-5 rounded-none border-4 border-black shadow-brutal">
          <div class="flex items-center space-x-3.5 pr-4 sm:border-r-2 border-black">
            <div class="w-12 h-12 rounded-none bg-[#ffff00] border-2 border-black flex items-center justify-center shadow-brutal-sm">
              <CoinIcon customClass="w-7 h-7" />
            </div>
            <div>
              <div class="text-[10px] text-black font-black uppercase tracking-wider font-mono">我的筹码余额</div>
              <div class="text-2xl font-black font-mono text-black">{{ formattedChips }}</div>
            </div>
          </div>
          <router-link
            to="/checkin"
            class="brutal-btn-pink px-5 py-3 text-xs sm:text-sm"
          >
            <CalendarCheck class="w-4 h-4 mr-1.5" />
            <span>每日签到领币</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Games Grid Section -->
    <div class="space-y-6">
      <div class="flex items-center justify-between border-b-4 border-black pb-3">
        <div>
          <h2 class="text-2xl font-black text-black uppercase flex items-center gap-2 font-mono">
            <Gamepad2 class="w-6 h-6 text-black" />
            <span>热门游戏大厅</span>
            <span class="text-xs font-mono font-bold px-2 py-0.5 bg-black text-[#ccff00]">SELECT GAME</span>
          </h2>
          <p class="text-xs text-black font-mono font-bold mt-1">选择经典游戏模式，开启精彩智勇博弈</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- 1. 炸金花 -->
        <div class="group relative rounded-none bg-white border-4 border-black p-6 flex flex-col justify-between shadow-brutal-lg hover:shadow-brutal-xl hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-none bg-[#ccff00] border-2 border-black flex items-center justify-center text-black shadow-brutal-sm">
                <Layers class="w-6 h-6" />
              </div>
              <span class="px-2.5 py-1 rounded-none bg-black text-[#ccff00] border-2 border-black text-[11px] font-black uppercase font-mono shadow-brutal-sm">
                三张比拼 · 心理博弈
              </span>
            </div>
            <h3 class="text-xl font-black text-black">
              炸金花 (Golden Flower)
            </h3>
            <p class="text-xs text-black font-mono mt-2 leading-relaxed font-medium">
              三张底牌见分晓！支持闷牌（暗注）、看牌翻倍、加注与激爽比牌PK。豹子通吃，235奇袭逆转。
            </p>
            <div class="flex items-center space-x-2 mt-4 text-[11px] font-mono font-bold text-black bg-[#f4f4f0] p-2 border border-black">
              <span class="flex items-center gap-1">底注: 50 <CoinIcon customClass="w-3 h-3" /></span>
              <span>•</span>
              <span>单人AI / 联机开房</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t-2 border-black">
            <router-link
              to="/game/zhajinhua"
              class="w-full py-3 rounded-none bg-[#ccff00] hover:bg-[#ffff00] text-black font-black text-xs uppercase border-3 border-black shadow-brutal transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none block text-center"
            >
              开始游戏
            </router-link>
          </div>
        </div>

        <!-- 2. 21点 (Blackjack) -->
        <div class="group relative rounded-none bg-white border-4 border-black p-6 flex flex-col justify-between shadow-brutal-lg hover:shadow-brutal-xl hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-none bg-[#ffff00] border-2 border-black flex items-center justify-center text-black shadow-brutal-sm">
                <Sparkles class="w-6 h-6" />
              </div>
              <span class="px-2.5 py-1 rounded-none bg-black text-[#ffff00] border-2 border-black text-[11px] font-black uppercase font-mono shadow-brutal-sm">
                3:2 天王赔率
              </span>
            </div>
            <h3 class="text-xl font-black text-black">
              21点 (Blackjack)
            </h3>
            <p class="text-xs text-black font-mono mt-2 leading-relaxed font-medium">
              经典娱乐场黑杰克对决！包含要牌、停牌、双倍下注。软17庄家规则，算点智取庄家高额筹码。
            </p>
            <div class="flex items-center space-x-2 mt-4 text-[11px] font-mono font-bold text-black bg-[#f4f4f0] p-2 border border-black">
              <span>自由下注</span>
              <span>•</span>
              <span>智能 Ace 点数计算</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t-2 border-black">
            <router-link
              to="/game/blackjack"
              class="w-full py-3 rounded-none bg-[#ffff00] hover:bg-[#ccff00] text-black font-black text-xs uppercase border-3 border-black shadow-brutal transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none block text-center"
            >
              开始挑战
            </router-link>
          </div>
        </div>

        <!-- 3. 德州扑克 (Texas Hold'em) -->
        <div class="group relative rounded-none bg-white border-4 border-black p-6 flex flex-col justify-between shadow-brutal-lg hover:shadow-brutal-xl hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-none bg-[#00d9ff] border-2 border-black flex items-center justify-center text-black shadow-brutal-sm">
                <Crown class="w-6 h-6" />
              </div>
              <span class="px-2.5 py-1 rounded-none bg-black text-[#00d9ff] border-2 border-black text-[11px] font-black uppercase font-mono shadow-brutal-sm">
                7选5牌型评级
              </span>
            </div>
            <h3 class="text-xl font-black text-black">
              德州扑克 (Texas Hold'em)
            </h3>
            <p class="text-xs text-black font-mono mt-2 leading-relaxed font-medium">
              国际风靡的智力竞技！翻牌前、翻牌、转牌、河牌四轮下注，过牌、跟注、加注与全下(All-in)。
            </p>
            <div class="flex items-center space-x-2 mt-4 text-[11px] font-mono font-bold text-black bg-[#f4f4f0] p-2 border border-black">
              <span class="flex items-center gap-1">盲注: 50/100 <CoinIcon customClass="w-3 h-3" /></span>
              <span>•</span>
              <span>皇家同花顺</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t-2 border-black">
            <router-link
              to="/game/texas"
              class="w-full py-3 rounded-none bg-[#00d9ff] hover:bg-[#ccff00] text-black font-black text-xs uppercase border-3 border-black shadow-brutal transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none block text-center"
            >
              入席对决
            </router-link>
          </div>
        </div>

        <!-- 4. 猜大小 (Sic Bo) -->
        <div class="group relative rounded-none bg-white border-4 border-black p-6 flex flex-col justify-between shadow-brutal-lg hover:shadow-brutal-xl hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-none bg-[#ff006e] border-2 border-black flex items-center justify-center text-white shadow-brutal-sm">
                <Dices class="w-6 h-6" />
              </div>
              <span class="px-2.5 py-1 rounded-none bg-black text-[#ff006e] border-2 border-black text-[11px] font-black uppercase font-mono shadow-brutal-sm">
                最高 60 倍
              </span>
            </div>
            <h3 class="text-xl font-black text-black">
              猜大小 · 骰宝 (Sic Bo)
            </h3>
            <p class="text-xs text-black font-mono mt-2 leading-relaxed font-medium">
              3颗骰子摇盅开奖！涵盖大、小、单、双、全围豹子(1:30)及 4-17 点高倍赔率，即开即算。
            </p>
            <div class="flex items-center space-x-2 mt-4 text-[11px] font-mono font-bold text-black bg-[#f4f4f0] p-2 border border-black">
              <span>近期走势图</span>
              <span>•</span>
              <span>物理骰盅动效</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t-2 border-black">
            <router-link
              to="/game/sicbo"
              class="w-full py-3 rounded-none bg-[#ff006e] hover:bg-[#ff9500] text-white hover:text-black font-black text-xs uppercase border-3 border-black shadow-brutal transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none block text-center"
            >
              摇骰开盅
            </router-link>
          </div>
        </div>

        <!-- 5. 猜点数六合彩 (Mark Six) -->
        <div class="group relative rounded-none bg-white border-4 border-black p-6 flex flex-col justify-between shadow-brutal-lg hover:shadow-brutal-xl hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-none bg-[#ff9500] border-2 border-black flex items-center justify-center text-black shadow-brutal-sm">
                <Disc class="w-6 h-6" />
              </div>
              <span class="px-2.5 py-1 rounded-none bg-black text-[#ff9500] border-2 border-black text-[11px] font-black uppercase font-mono shadow-brutal-sm">
                特码 47 倍
              </span>
            </div>
            <h3 class="text-xl font-black text-black">
              猜点数六合彩 (Mark Six)
            </h3>
            <p class="text-xs text-black font-mono mt-2 leading-relaxed font-medium">
              1-49特码摇奖机滚球！支持特码直选、大小单双、红蓝绿三色波及十二生肖多维下注。
            </p>
            <div class="flex items-center space-x-2 mt-4 text-[11px] font-mono font-bold text-black bg-[#f4f4f0] p-2 border border-black">
              <span>即开型滚球</span>
              <span>•</span>
              <span>历史特码统计</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t-2 border-black">
            <router-link
              to="/game/marksix"
              class="w-full py-3 rounded-none bg-[#ff9500] hover:bg-[#ffff00] text-black font-black text-xs uppercase border-3 border-black shadow-brutal transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none block text-center"
            >
              即刻开奖
            </router-link>
          </div>
        </div>

        <!-- 6. 联机房间大厅入口 (Multiplayer Lobby) -->
        <div class="group relative rounded-none bg-[#fdfaf5] border-4 border-black p-6 flex flex-col justify-between shadow-brutal-lg hover:shadow-brutal-xl hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-none bg-black border-2 border-black flex items-center justify-center text-[#ccff00] shadow-brutal-sm">
                <Globe class="w-6 h-6" />
              </div>
              <span class="px-2.5 py-1 rounded-none bg-[#ccff00] text-black border-2 border-black text-[11px] font-black uppercase font-mono shadow-brutal-sm">
                实时联机
              </span>
            </div>
            <h3 class="text-xl font-black text-black">
              在线联机房间大厅
            </h3>
            <p class="text-xs text-black font-mono mt-2 leading-relaxed font-medium">
              支持多人在线即时匹配！自由创建专属对战房间、自定义底注门槛，随时邀请好友入座同台较量。
            </p>
            <div class="flex items-center space-x-2 mt-4 text-[11px] font-mono font-black text-black bg-[#ccff00] p-2 border border-black">
              <span>■ 联机网络服务正常</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t-2 border-black">
            <button
              @click="openRoomLobby"
              class="w-full py-3 rounded-none bg-black hover:bg-[#ccff00] text-white hover:text-black font-black text-xs uppercase border-3 border-black shadow-brutal transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
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
          <span class="text-xs text-black font-mono font-bold">选择房间即刻入座：</span>
          <button
            @click="showCreateModal = true"
            class="brutal-btn-lime px-3 py-1.5 text-xs"
          >
            <Plus class="w-3.5 h-3.5 mr-1" />
            <span>创建新房间</span>
          </button>
        </div>

        <div class="space-y-3 max-h-64 overflow-y-auto pr-1">
          <div
            v-for="rm in roomStore.activeRooms"
            :key="rm.id"
            class="p-4 rounded-none bg-white border-2 border-black shadow-brutal-sm flex items-center justify-between hover:bg-[#ffffeb] transition-colors"
          >
            <div>
              <div class="text-sm font-black text-black font-mono">{{ rm.name }}</div>
              <div class="text-xs text-black font-mono font-bold mt-1 flex items-center gap-1.5">
                <span>底注: {{ rm.min_bet }}</span>
                <CoinIcon customClass="w-3.5 h-3.5" />
                <span>· 上限: {{ rm.max_players }}人</span>
              </div>
            </div>
            <button
              @click="joinRoomAndEnter(rm)"
              class="brutal-btn-cyan px-3.5 py-1.5 text-xs"
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
          <label class="block text-xs font-black text-black uppercase mb-1 font-mono">房间名称</label>
          <input
            v-model="newRoomName"
            type="text"
            placeholder="例如: 谁与争锋好友桌"
            class="brutal-input w-full text-sm py-2.5 px-3"
          />
        </div>
        <div>
          <label class="block text-xs font-black text-black uppercase mb-1 font-mono">游戏玩法</label>
          <select
            v-model="newRoomType"
            class="brutal-input w-full text-sm py-2.5 px-3 font-mono font-bold"
          >
            <option value="zhajinhua">炸金花 (Golden Flower)</option>
            <option value="texas">德州扑克 (Texas Hold'em)</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-black text-black uppercase mb-1 flex items-center gap-1 font-mono">
            <span>底注要求</span>
            <CoinIcon customClass="w-3.5 h-3.5" />
          </label>
          <input
            v-model.number="newRoomMinBet"
            type="number"
            min="10"
            step="10"
            class="brutal-input w-full text-sm py-2.5 px-3 font-mono font-bold"
          />
        </div>
      </div>
      <template #footer>
        <button
          @click="submitCreateRoom"
          class="brutal-btn-lime w-full py-2.5 text-sm"
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
import {
  CalendarCheck,
  Gamepad2,
  Layers,
  Sparkles,
  Crown,
  Dices,
  Disc,
  Globe,
  Plus
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useRoomStore } from '@/stores/room'
import Modal from '@/components/common/Modal.vue'
import CoinIcon from '@/components/common/CoinIcon.vue'
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

async function joinRoomAndEnter(room: GameRoom) {
  await roomStore.joinRoom(room)
  showRoomModal.value = false
  router.push(`/game/${room.game_type}`)
}
</script>
