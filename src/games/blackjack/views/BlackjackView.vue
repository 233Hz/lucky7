<template>
  <div class="max-w-5xl mx-auto px-2.5 sm:px-4 py-2.5 sm:py-6 font-mono">
    <!-- Header Controls -->
    <!-- 1. Multiplayer Room Mode Header -->
    <div v-if="isInRoom" class="mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b-4 border-[#1a1a1a] flex flex-col gap-2.5">
      <!-- Row 1: Back + Actions -->
      <div class="flex items-center justify-between gap-2 flex-wrap">
        <button
          @click="handleLeaveRoom"
          :disabled="isLeaving"
          class="comic-btn-white px-2.5 sm:px-3 py-1.5 text-xs inline-flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>返回大厅</span>
        </button>

        <div class="flex items-center space-x-1.5 sm:space-x-2 flex-wrap justify-end">
          <button
            @click="isChatOpen = !isChatOpen"
            class="brutal-btn px-2.5 sm:px-3 py-1.5 text-xs font-black flex items-center gap-1 transition-all"
            :class="isChatOpen ? 'brutal-btn-yellow shadow-brutal-sm' : 'brutal-btn-white'"
          >
            <MessageSquare class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">{{ isChatOpen ? '收起聊天' : '房间聊天' }}</span>
            <span class="sm:hidden">聊天</span>
          </button>

          <button
            @click="showMembersModal = true"
            class="brutal-btn px-2.5 sm:px-3 py-1.5 text-xs font-black flex items-center gap-1 transition-all bg-[#fffef0] hover:bg-[#facc15]"
            :class="roomStore.isHost ? 'border-[#ef4444]' : ''"
            title="查看所有在桌成员并进行踢人管理"
          >
            <Users class="w-3.5 h-3.5" />
            <span>成员 ({{ roomStore.roomPlayers.length }}/{{ roomStore.currentRoom?.max_players || 6 }})</span>
          </button>

          <button
            v-prevent-reclick
            :disabled="isLeaving"
            @click="handleLeaveRoom"
            class="comic-btn-white px-2.5 sm:px-3.5 py-1.5 text-xs font-bold flex items-center gap-1 hover:bg-[#ef4444] hover:text-white disabled:opacity-50 flex-shrink-0"
          >
            <LogOut class="w-3.5 h-3.5" />
            <span>{{ isLeaving ? '退出中...' : '退出' }}</span>
          </button>
        </div>
      </div>

      <!-- Row 2: Room Info Card -->
      <div class="flex flex-wrap items-center justify-between gap-2 p-2 sm:p-2.5 rounded-lg bg-[#fffef0] border-3 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
        <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <h1 class="text-sm sm:text-lg font-black text-[#1a1a1a] flex items-center gap-1.5 tracking-tight font-mono">
            <Crown class="w-4 h-4 sm:w-5 sm:h-5 text-[#1a1a1a] flex-shrink-0" />
            <span class="truncate max-w-[140px] sm:max-w-xs">{{ roomStore.currentRoom?.name || '21点联机桌' }}</span>
          </h1>
          <span class="comic-badge font-black text-[10px] sm:text-xs py-0.5 px-2 bg-[#22c55e] text-[#1a1a1a]">
            联机房间
          </span>
          <span v-if="roomStore.isHost" class="comic-badge bg-[#facc15] text-[#1a1a1a] text-[10px] sm:text-xs py-0.5 px-2">
            您是房主
          </span>
        </div>

        <div class="text-[11px] sm:text-xs font-mono font-bold text-[#1a1a1a]/80 flex flex-wrap items-center gap-1.5">
          <span class="bg-white px-2 py-0.5 rounded border border-[#1a1a1a] flex items-center gap-1 shadow-[1px_1px_0px_0px_#1a1a1a]">
            底注: {{ roomStore.currentRoom?.min_bet || 50 }}
            <CoinIcon customClass="w-3 h-3" />
          </span>
          <span class="bg-[#1a1a1a] text-[#facc15] px-2 py-0.5 rounded border border-[#1a1a1a] font-black">
            3:2 天王赔率
          </span>
        </div>
      </div>
    </div>

    <!-- 2. Single Player Mode Header -->
    <div v-else class="mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b-4 border-[#1a1a1a]">
      <!-- Row 1: Back to Lobby + Rule / Multiplier Badge -->
      <div class="flex items-center justify-between gap-2 mb-2 sm:mb-2.5">
        <router-link to="/" class="comic-btn-white px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs inline-flex items-center gap-1 flex-shrink-0">
          <ArrowLeft class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>返回大厅</span>
        </router-link>

        <span class="text-[10px] sm:text-xs px-2 py-0.5 rounded-md bg-[#1a1a1a] text-[#facc15] border-2 border-[#1a1a1a] font-black uppercase shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] flex-shrink-0">
          单人对决 · 3:2 天王赔率
        </span>
      </div>

      <!-- Row 2: Title and Dealer Rule -->
      <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5 sm:gap-2">
        <h1 class="text-lg sm:text-2xl font-black text-[#1a1a1a] uppercase flex items-center gap-1.5 sm:gap-2">
          <CreditCard class="w-5 h-5 sm:w-6 sm:h-6 text-[#1a1a1a] flex-shrink-0" />
          <span>21点 (Blackjack)</span>
        </h1>
        <p class="text-[11px] sm:text-xs text-[#1a1a1a]/80 font-bold">
          庄家必须在 16 点及以下补牌，17 点及以上停牌
        </p>
      </div>
    </div>

    <!-- Game Closed / Outside Open Time Notice -->
    <div
      v-if="!scheduleState.isOpen"
      class="mb-6 p-6 sm:p-8 rounded-lg bg-[#fffef0] border-3 sm:border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] sm:shadow-[6px_6px_0px_0px_#1a1a1a] text-center space-y-4 font-mono text-[#1a1a1a]"
    >
      <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#ef4444] text-white border-3 border-[#1a1a1a] flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#1a1a1a]">
        <Clock class="w-7 h-7 sm:w-8 sm:h-8" />
      </div>
      <h2 class="text-xl sm:text-2xl font-black uppercase">21点 (Blackjack) 暂停开放</h2>
      <p class="text-xs sm:text-sm text-[#4a4a4a] font-bold max-w-md mx-auto">
        {{ scheduleState.reason }}<br />
        开放时间：{{ scheduleState.timeDesc }}
      </p>
      <router-link to="/" class="comic-btn-yellow px-6 py-2.5 text-xs inline-block">
        返回游戏大厅 · HOME
      </router-link>
    </div>

    <!-- Main Content Grid (Table + In-Room Chat) -->
    <div v-else class="grid grid-cols-1 gap-4 sm:gap-6 items-start" :class="isChatOpen && isInRoom ? 'xl:grid-cols-12' : ''">
      <!-- Felt Table -->
      <div :class="isChatOpen && isInRoom ? 'xl:col-span-8' : 'w-full'">
        <div class="relative rounded-xl bg-[#fffef0] border-3 sm:border-4 border-[#1a1a1a] p-3.5 sm:p-6 min-h-[440px] sm:min-h-[540px] flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] sm:shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-hidden">
          <!-- Halftone Dots Texture -->
          <div class="absolute inset-0 bg-[radial-gradient(#1a1a1a_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-10 pointer-events-none"></div>

      <!-- Dealer Area (Top) -->
      <div class="flex flex-col items-center relative z-10">
        <div class="flex items-center space-x-2 mb-1.5 sm:mb-2">
          <span class="text-xs font-black text-[#1a1a1a] uppercase tracking-wider">庄家 (DEALER)</span>
          <span
            v-if="dealerScore.total > 0 && phase !== 'betting'"
            class="px-2 sm:px-2.5 py-0.5 rounded-md text-xs font-mono font-black border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] transition-all"
            :class="dealerScore.isBust ? 'bg-[#ef4444] text-white' : 'bg-[#facc15] text-[#1a1a1a]'"
          >
            {{ phase === 'player_turn' ? '?' : dealerScore.total + ' 点' }}
          </span>
        </div>

        <!-- Dealer Cards (Spaced cleanly with responsive cascade overlap) -->
        <div class="flex items-center justify-center min-h-[92px] sm:min-h-[116px] py-1">
          <template v-if="dealerCards.length > 0">
            <div class="flex items-center justify-center">
              <PlayingCard
                v-for="(c, idx) in dealerCards"
                :key="idx"
                :card="c"
                :faceDown="idx === 1 && phase === 'player_turn'"
                size="responsive"
                :class="[
                  idx > 0
                    ? dealerCards.length >= 4
                      ? '-ml-8 sm:-ml-5'
                      : dealerCards.length === 3
                      ? '-ml-5 sm:-ml-2'
                      : 'ml-2 sm:ml-3'
                    : ''
                ]"
                :style="{ zIndex: 10 + idx }"
              />
            </div>
          </template>
          <div v-else class="w-16 sm:w-20 md:w-22 aspect-[224/313] shrink-0 rounded-lg border-2 border-dashed border-[#1a1a1a] flex items-center justify-center text-[#1a1a1a] text-xs font-mono font-bold bg-[#fffef0]/80 shadow-[2px_2px_0px_0px_rgba(26,26,26,0.3)]">
            等待发牌
          </div>
        </div>
      </div>

      <!-- Center Status & Round Info -->
      <div class="flex flex-col items-center justify-center my-2 sm:my-4 relative z-10">
        <div v-if="phase === 'betting'" class="text-center space-y-1.5 sm:space-y-2">
          <span class="text-xs sm:text-sm font-black text-[#1a1a1a]">请选择下注筹码，点击「发牌」开始</span>
          <div>
            <div class="text-xs text-[#1a1a1a] font-black inline-flex items-center justify-center gap-1 bg-[#facc15] px-2.5 sm:px-3 py-1 border-2 border-[#1a1a1a] rounded-md shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
              <span>当前已下注: {{ currentBet }}</span>
              <CoinIcon customClass="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div v-else-if="roundResult" class="text-center space-y-1 py-2 sm:py-3 px-4 sm:px-6 rounded-xl bg-[#fffef0] border-3 sm:border-4 border-[#1a1a1a] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] sm:shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <div class="text-base sm:text-lg font-black uppercase" :class="roundResult.netProfit > 0 ? 'text-[#22c55e]' : roundResult.netProfit < 0 ? 'text-[#ef4444]' : 'text-[#1a1a1a]'">
            {{ roundResult.description }}
          </div>
          <div class="text-xs font-mono font-black flex items-center justify-center gap-1" :class="roundResult.netProfit >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'">
            <span>{{ roundResult.netProfit >= 0 ? '+' : '' }}{{ roundResult.netProfit }}</span>
            <CoinIcon customClass="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      <!-- Player Area (Bottom) -->
      <div class="flex flex-col items-center relative z-10 w-full">
        <!-- Player Cards (Spaced cleanly with responsive cascade overlap) -->
        <div class="flex items-center justify-center min-h-[92px] sm:min-h-[116px] mb-2 py-1">
          <template v-if="playerCards.length > 0">
            <div class="flex items-center justify-center">
              <PlayingCard
                v-for="(c, idx) in playerCards"
                :key="idx"
                :card="c"
                size="responsive"
                :highlight="playerScore.isBlackjack"
                :class="[
                  idx > 0
                    ? playerCards.length >= 4
                      ? '-ml-8 sm:-ml-5'
                      : playerCards.length === 3
                      ? '-ml-5 sm:-ml-2'
                      : 'ml-2 sm:ml-3'
                    : ''
                ]"
                :style="{ zIndex: 10 + idx }"
              />
            </div>
          </template>
          <div v-else class="w-16 sm:w-20 md:w-22 aspect-[224/313] shrink-0 rounded-lg border-2 border-dashed border-[#1a1a1a] flex items-center justify-center text-[#1a1a1a] text-xs font-mono font-bold bg-[#fffef0]/80 shadow-[2px_2px_0px_0px_rgba(26,26,26,0.3)]">
            等待下注
          </div>
        </div>

        <!-- Player Points Pill -->
        <div class="flex items-center justify-center flex-wrap gap-2 mb-3 sm:mb-4">
          <div class="px-2.5 sm:px-3.5 py-1 rounded-md bg-[#fffef0] border-2 border-[#1a1a1a] text-xs font-mono font-black text-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] flex items-center gap-1.5">
            <span>闲家点数:</span>
            <span :class="playerScore.isBust ? 'text-[#ef4444]' : playerScore.isBlackjack ? 'text-[#ef4444] font-black' : 'text-[#22c55e]'">
              {{ playerScore.total }} 点
              <span v-if="playerScore.isSoft && !playerScore.isBust && playerScore.total !== 21">(软)</span>
              <span v-if="playerScore.isBlackjack" class="inline-flex items-center gap-1 ml-1 text-[#ef4444]">
                <Sparkles class="w-3.5 h-3.5" />
                <span>BLACKJACK!</span>
              </span>
              <span v-if="playerScore.isBust" class="inline-flex items-center gap-1 ml-1 text-[#ef4444]">
                <AlertTriangle class="w-3.5 h-3.5" />
                <span>爆牌</span>
              </span>
            </span>
          </div>

          <div v-if="currentBet > 0" class="px-2.5 sm:px-3.5 py-1 rounded-md bg-[#facc15] border-2 border-[#1a1a1a] text-xs font-mono font-black text-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] flex items-center gap-1">
            <span>下注: {{ currentBet }}</span>
            <CoinIcon customClass="w-3.5 h-3.5" />
          </div>
        </div>

        <!-- Controls Area -->
        <!-- 1. Betting Stage -->
        <div v-if="phase === 'betting'" class="w-full flex flex-col items-center space-y-3 sm:space-y-4">
          <ChipSelector v-model="selectedChip" @change="addBet" />

          <div class="flex items-center justify-center gap-2 sm:gap-3 w-full max-w-xs">
            <button
              @click="clearBet"
              :disabled="currentBet === 0"
              class="comic-btn-white flex-1 py-2 sm:py-2.5 text-xs font-black disabled:opacity-40 shadow-[3px_3px_0px_0px_#1a1a1a] sm:shadow-[4px_4px_0px_0px_#1a1a1a]"
            >
              清空下注
            </button>
            <button
              v-prevent-reclick
              @click="dealHands"
              :disabled="currentBet === 0 || authStore.userChips < currentBet || isDealing"
              class="comic-btn-green flex-[1.4] py-2 sm:py-2.5 text-xs sm:text-sm font-black disabled:opacity-50 flex items-center justify-center gap-1 shadow-[3px_3px_0px_0px_#1a1a1a] sm:shadow-[4px_4px_0px_0px_#1a1a1a]"
            >
              <Play class="w-4 h-4 mr-0.5 flex-shrink-0" />
              <span>{{ isDealing ? '正在发牌...' : '确认发牌' }}</span>
            </button>
          </div>
        </div>

        <!-- 2. Playing Stage -->
        <div v-else-if="phase === 'player_turn'" class="w-full max-w-sm sm:max-w-md flex items-center justify-center gap-2 sm:gap-3 px-1">
          <!-- 要牌 (Hit) -->
          <button
            v-prevent-reclick
            :disabled="isActionBusy"
            @click="handleHit"
            class="comic-btn-yellow flex-1 py-2 sm:py-2.5 px-2 sm:px-4 text-xs sm:text-sm disabled:opacity-50 flex items-center justify-center gap-1 shadow-[3px_3px_0px_0px_#1a1a1a] sm:shadow-[4px_4px_0px_0px_#1a1a1a]"
          >
            <Plus class="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span class="font-black whitespace-nowrap">要牌</span>
            <span class="hidden sm:inline text-[11px] sm:text-xs font-bold opacity-80">(Hit)</span>
          </button>

          <!-- 停牌 (Stand) -->
          <button
            v-prevent-reclick
            :disabled="isActionBusy"
            @click="handleStand"
            class="comic-btn-red flex-1 py-2 sm:py-2.5 px-2 sm:px-4 text-xs sm:text-sm disabled:opacity-50 flex items-center justify-center gap-1 shadow-[3px_3px_0px_0px_#1a1a1a] sm:shadow-[4px_4px_0px_0px_#1a1a1a]"
          >
            <Hand class="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span class="font-black whitespace-nowrap">停牌</span>
            <span class="hidden sm:inline text-[11px] sm:text-xs font-bold opacity-80">(Stand)</span>
          </button>

          <!-- 加倍 (Double) -->
          <button
            v-if="playerCards.length === 2 && authStore.userChips >= currentBet * 2"
            v-prevent-reclick
            :disabled="isActionBusy"
            @click="handleDouble"
            class="comic-btn-blue flex-1 py-2 sm:py-2.5 px-2 sm:px-4 text-xs sm:text-sm disabled:opacity-50 flex items-center justify-center gap-1 shadow-[3px_3px_0px_0px_#1a1a1a] sm:shadow-[4px_4px_0px_0px_#1a1a1a]"
          >
            <Zap class="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <span class="font-black whitespace-nowrap">加倍</span>
            <span class="hidden sm:inline text-[11px] sm:text-xs font-bold opacity-80">(Double)</span>
          </button>
        </div>

        <!-- 3. Settled Stage -->
        <div v-else-if="phase === 'settled'" class="w-full flex items-center justify-center">
          <button
            v-prevent-reclick
            @click="resetToBetting"
            class="comic-btn-green w-full max-w-xs py-2.5 sm:py-3 text-sm font-black flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_0px_#1a1a1a] sm:shadow-[4px_4px_0px_0px_#1a1a1a]"
          >
            <RotateCw class="w-4 h-4 flex-shrink-0" />
            <span>再来一局</span>
          </button>
        </div>
      </div>
    </div>
  </div>

      <!-- Right: In-Room Chat Channel -->
      <div v-if="isInRoom && isChatOpen" class="xl:col-span-4 h-[540px] sticky top-20">
        <ChatPanel
          :channel="roomChannel"
          :title="`${roomStore.currentRoom?.name || '21点'} · 房间聊天`"
          subtitle="在桌玩家专属畅聊"
          channelType="room"
          :isHost="roomStore.isHost"
          :allowClose="true"
          @close="isChatOpen = false"
        />
      </div>
    </div>

    <!-- 👥 房间在桌成员与踢人管理弹窗 -->
    <Modal v-if="isInRoom" v-model="showMembersModal" title="房间在桌成员管理">
      <div class="space-y-3 font-mono">
        <div class="flex items-center justify-between text-xs text-[#1a1a1a] font-black pb-2 border-b-2 border-[#1a1a1a]">
          <span>当前在桌人数: {{ roomStore.roomPlayers.length }} / {{ roomStore.currentRoom?.max_players || 6 }} 人</span>
          <span v-if="roomStore.isHost" class="text-[#ef4444] text-[11px]">您具有房主管理权限</span>
        </div>

        <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
          <div
            v-for="(p, idx) in roomStore.roomPlayers"
            :key="p.id || p.user_id"
            class="flex items-center justify-between p-2.5 rounded-lg border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] transition-colors"
            :class="p.user_id === authStore.profile?.id ? 'bg-[#fffef0] border-[#facc15]' : 'bg-white'"
          >
            <div class="flex items-center space-x-2.5">
              <span class="w-5 text-center text-xs font-black text-[#1a1a1a]">{{ idx + 1 }}</span>
              <img
                :src="p.profile?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + p.user_id"
                class="w-8 h-8 rounded-md border-2 border-[#1a1a1a] bg-white object-cover"
              />
              <div>
                <div class="text-xs font-black text-[#1a1a1a] flex items-center gap-1.5">
                  <span>{{ p.profile?.nickname || `玩家_${p.seat + 1}` }}</span>
                  <span v-if="p.user_id === authStore.profile?.id" class="text-[10px] px-1 bg-[#facc15] border border-[#1a1a1a] rounded font-black">
                    您
                  </span>
                  <span v-if="p.user_id === roomStore.currentRoom?.host_id" class="text-[10px] px-1 bg-[#ef4444] text-white border border-[#1a1a1a] rounded font-black">
                    房主
                  </span>
                </div>
                <div class="text-[11px] font-bold text-[#1a1a1a]/70 flex items-center gap-1">
                  <span>筹码: {{ p.chips || p.profile?.chips || 0 }}</span>
                  <CoinIcon customClass="w-3 h-3" />
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                v-if="roomStore.isHost && p.user_id !== authStore.profile?.id"
                v-prevent-reclick
                :disabled="kickingUserId === p.user_id"
                @click="handleKickPlayer(p.user_id, p.profile?.nickname || '玩家')"
                class="comic-btn-red px-2.5 py-1 text-[11px] font-black flex items-center gap-1 disabled:opacity-50"
                title="将该玩家移出房间"
              >
                <UserX class="w-3.5 h-3.5" />
                <span>{{ kickingUserId === p.user_id ? '移出中...' : '移出' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button
          @click="showMembersModal = false"
          class="comic-btn-white w-full py-2 text-xs font-black"
        >
          关闭列表
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import confetti from 'canvas-confetti'
import {
  CreditCard,
  ArrowLeft,
  Play,
  RotateCw,
  Plus,
  Hand,
  Zap,
  Sparkles,
  AlertTriangle,
  Clock,
  Crown,
  Users,
  MessageSquare,
  LogOut,
  UserX
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { useRoomStore } from '@/stores/room'
import { useChatStore } from '@/stores/chat'
import { useGameScheduleStore } from '@/stores/gameSchedule'
import { sound } from '@/lib/sound'
import { dialog } from '@/lib/dialog'
import PlayingCard from '@/components/game/PlayingCard.vue'
import ChipSelector from '@/components/game/ChipSelector.vue'
import CoinIcon from '@/components/common/CoinIcon.vue'
import Modal from '@/components/common/Modal.vue'
import ChatPanel from '@/components/chat/ChatPanel.vue'
import { createBlackjackDeck, calculateHandScore, determineBlackjackOutcome } from '../engine'
import type { Card } from '@/types/game'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const walletStore = useWalletStore()
const roomStore = useRoomStore()
const chatStore = useChatStore()
const gameScheduleStore = useGameScheduleStore()

const isInRoom = computed(() => {
  return (
    route.query.mode === 'multiplayer' ||
    roomStore.currentRoom?.game_type === 'blackjack'
  )
})

const isChatOpen = ref<boolean>(true)
const showMembersModal = ref<boolean>(false)
const isLeaving = ref<boolean>(false)
const kickingUserId = ref<string | null>(null)

const roomChannel = computed(() => 'room_' + (roomStore.currentRoom?.id || 'blackjack'))

const scheduleState = computed(() => gameScheduleStore.checkGameOpen('blackjack'))

type GamePhase = 'betting' | 'player_turn' | 'dealer_turn' | 'settled'
const phase = ref<GamePhase>('betting')

const deck = ref<Card[]>([])
const playerCards = ref<Card[]>([])
const dealerCards = ref<Card[]>([])
const selectedChip = ref<number>(100)
const currentBet = ref<number>(100)

const roundResult = ref<{ outcome: string; netProfit: number; description: string } | null>(null)

const playerScore = computed(() => calculateHandScore(playerCards.value))
const dealerScore = computed(() => calculateHandScore(dealerCards.value))

const isDealing = ref(false)
const isActionBusy = ref(false)

function onWindowBeforeUnload() {
  if (isInRoom.value) {
    roomStore.leaveRoom()
  }
}

onMounted(async () => {
  window.addEventListener('beforeunload', onWindowBeforeUnload)

  if (isInRoom.value) {
    if (!roomStore.currentRoom && route.query.mode === 'multiplayer') {
      await roomStore.createRoom(
        'blackjack',
        `${authStore.profile?.nickname || '玩家'}的21点房间`,
        50,
        6
      )
    }

    if (roomStore.currentRoom?.min_bet) {
      currentBet.value = roomStore.currentRoom.min_bet
    }

    chatStore.initChannel(roomChannel.value)
    chatStore.sendSystemAnnouncement(
      roomChannel.value,
      `【${authStore.profile?.nickname || '玩家'}】进入了21点房间。`
    )
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', onWindowBeforeUnload)
  if (isInRoom.value) {
    roomStore.leaveRoom()
  }
})

async function handleLeaveRoom() {
  if (isLeaving.value) return
  isLeaving.value = true
  try {
    if (isInRoom.value) {
      chatStore.sendSystemAnnouncement(
        roomChannel.value,
        `【${authStore.profile?.nickname || '玩家'}】离开了房间。`
      )
      await roomStore.leaveRoom()
    }
    router.push('/')
  } finally {
    isLeaving.value = false
  }
}

async function handleKickPlayer(userId: string, nickname: string) {
  if (!roomStore.isHost || kickingUserId.value) return
  const confirmed = await dialog.confirm(`确定要将玩家【${nickname}】移出房间吗？`, {
    title: '移出房间确认'
  })
  if (!confirmed) return

  kickingUserId.value = userId
  try {
    const ok = await roomStore.kickPlayer(userId)
    if (ok) {
      sound.playClick()
      chatStore.sendSystemAnnouncement(
        roomChannel.value,
        `【房主】已将玩家【${nickname}】移出房间。`
      )
    }
  } finally {
    kickingUserId.value = null
  }
}

function addBet(val: number) {
  if (phase.value !== 'betting') return
  currentBet.value += val
}

function clearBet() {
  currentBet.value = 0
}

// 发牌
async function dealHands() {
  if (isDealing.value || currentBet.value <= 0 || authStore.userChips < currentBet.value) return
  isDealing.value = true
  try {
    // 扣除下注并初始化牌局
    roundResult.value = null
    deck.value = createBlackjackDeck(4)
    playerCards.value = []
    dealerCards.value = []

    sound.playDealCard()

    // 双方各发 2 张牌
    playerCards.value.push(deck.value.pop()!)
    dealerCards.value.push(deck.value.pop()!)
    playerCards.value.push(deck.value.pop()!)
    dealerCards.value.push(deck.value.pop()!)

    phase.value = 'player_turn'

    // 检查玩家是否起手 Blackjack
    if (playerScore.value.isBlackjack) {
      handleStand()
    }
  } finally {
    isDealing.value = false
  }
}

// 玩家要牌
function handleHit() {
  if (isActionBusy.value || phase.value !== 'player_turn') return
  isActionBusy.value = true
  try {
    playerCards.value.push(deck.value.pop()!)
    sound.playDealCard()

    if (playerScore.value.isBust) {
      sound.playLose()
      finishRound()
    } else if (playerScore.value.total === 21) {
      handleStand()
    }
  } finally {
    setTimeout(() => { isActionBusy.value = false }, 300)
  }
}

// 玩家停牌
function handleStand() {
  if (isActionBusy.value || phase.value !== 'player_turn') return
  isActionBusy.value = true
  phase.value = 'dealer_turn'

  // 庄家暗牌翻开，如果点数小于 17 则连续要牌
  const runDealer = () => {
    sound.playDealCard()
    if (dealerScore.value.total < 17) {
      setTimeout(() => {
        dealerCards.value.push(deck.value.pop()!)
        runDealer()
      }, 600)
    } else {
      finishRound()
      isActionBusy.value = false
    }
  }

  setTimeout(runDealer, 400)
}

// 玩家加倍
function handleDouble() {
  if (isActionBusy.value || phase.value !== 'player_turn' || playerCards.value.length !== 2) return
  isActionBusy.value = true
  try {
    currentBet.value *= 2
    playerCards.value.push(deck.value.pop()!)
    sound.playDealCard()

    if (playerScore.value.isBust) {
      sound.playLose()
      finishRound()
      isActionBusy.value = false
    } else {
      isActionBusy.value = false
      handleStand()
    }
  } catch {
    isActionBusy.value = false
  }
}

// 结算一局
async function finishRound() {
  phase.value = 'settled'

  const { outcome, multiplier, description } = determineBlackjackOutcome(
    playerScore.value,
    dealerScore.value
  )

  const payout = Math.floor(currentBet.value * multiplier)
  const netProfit = payout - currentBet.value

  roundResult.value = {
    outcome,
    netProfit,
    description
  }

  if (netProfit > 0) {
    sound.playWin()
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } })
  } else if (netProfit < 0) {
    sound.playLose()
  }

  // 若处于联机房间，向房间聊天频道广播战况
  if (isInRoom.value) {
    if (playerScore.value.isBlackjack) {
      chatStore.sendSystemAnnouncement(
        roomChannel.value,
        `🎉 恭喜【${authStore.profile?.nickname || '玩家'}】拿到天王 BLACKJACK，赢得 +${netProfit} 筹码！`
      )
    } else if (netProfit > 0) {
      chatStore.sendSystemAnnouncement(
        roomChannel.value,
        `【${authStore.profile?.nickname || '玩家'}】${description}，赢得 +${netProfit} 筹码！`
      )
    }
  }

  // 同步至 Supabase / 钱包
  await walletStore.recordGameSettlement(
    'blackjack',
    currentBet.value,
    payout,
    {
      playerTotal: playerScore.value.total,
      dealerTotal: dealerScore.value.total,
      outcome,
      playerCards: playerCards.value,
      dealerCards: dealerCards.value
    }
  )
}

function resetToBetting() {
  playerCards.value = []
  dealerCards.value = []
  roundResult.value = null
  phase.value = 'betting'
}
</script>
