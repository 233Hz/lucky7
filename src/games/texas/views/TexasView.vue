<template>
  <div class="max-w-6xl mx-auto px-4 py-6">
    <!-- Header Controls (Mobile-first 2-row clean layout) -->
    <div class="mb-4 pb-3 border-b-4 border-[#1a1a1a] flex flex-col gap-2.5">
      <!-- Row 1: Back to Lobby + Quick Action Buttons -->
      <div class="flex items-center justify-between gap-2 flex-wrap">
        <router-link
          to="/"
          @click="handleLeaveRoom"
          class="comic-btn-white px-2.5 sm:px-3 py-1.5 text-xs inline-flex items-center gap-1.5 flex-shrink-0"
          :class="isLeaving ? 'opacity-50 pointer-events-none' : ''"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>返回大厅</span>
        </router-link>

        <!-- Quick Actions Row -->
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

          <!-- 👥 房间成员列表与踢人管理 -->
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
            v-if="isAiMode && roomStore.currentRoom?.status === 'waiting' && roomStore.roomPlayers.length < (roomStore.currentRoom?.max_players || 6)"
            v-prevent-reclick
            @click="handleAddTestPlayer"
            class="comic-btn-blue px-2.5 sm:px-3 py-1.5 text-xs font-bold flex items-center gap-1"
            title="添加更多电脑AI对手"
          >
            <UserPlus class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">+ 添加AI</span>
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

      <!-- Row 2: Room Info Card (Avoid text overlaps) -->
      <div class="flex flex-wrap items-center justify-between gap-2 p-2 sm:p-2.5 rounded-lg bg-[#fffef0] border-3 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
        <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <h1 class="text-sm sm:text-lg font-black text-[#1a1a1a] flex items-center gap-1.5 tracking-tight font-mono">
            <Crown class="w-4 h-4 sm:w-5 sm:h-5 text-[#1a1a1a] flex-shrink-0" />
            <span class="truncate max-w-[140px] sm:max-w-xs">{{ isAiMode ? '单机人机对战桌' : (roomStore.currentRoom?.name || '德州扑克对战桌') }}</span>
          </h1>
          <span
            class="comic-badge font-black text-[10px] sm:text-xs py-0.5 px-2"
            :class="isAiMode ? 'bg-[#facc15] text-[#1a1a1a]' : (roomStore.currentRoom?.status === 'playing' ? 'bg-[#ef4444] text-white' : 'bg-[#22c55e] text-[#1a1a1a]')"
          >
            {{ isAiMode ? '🤖 单机人机模式' : (roomStore.currentRoom?.status === 'playing' ? '对局中' : '等待准备中') }}
          </span>
          <span v-if="roomStore.isHost" class="comic-badge bg-[#facc15] text-[#1a1a1a] text-[10px] sm:text-xs py-0.5 px-2">
            您是房主
          </span>
        </div>

        <div class="text-[11px] sm:text-xs font-mono font-bold text-[#1a1a1a]/80 flex flex-wrap items-center gap-1.5">
          <span class="bg-white px-2 py-0.5 rounded border border-[#1a1a1a] flex items-center gap-1 shadow-[1px_1px_0px_0px_#1a1a1a]">
            大盲: {{ bigBlind }}
            <CoinIcon customClass="w-3 h-3" />
          </span>
          <span class="bg-white px-2 py-0.5 rounded border border-[#1a1a1a] flex items-center gap-1 shadow-[1px_1px_0px_0px_#1a1a1a]">
            小盲: {{ smallBlind }}
            <CoinIcon customClass="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>

    <!-- Game Closed / Outside Open Time Notice -->
    <div
      v-if="!scheduleState.isOpen"
      class="mb-6 p-8 rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[6px_6px_0px_0px_#1a1a1a] text-center space-y-4 font-mono text-[#1a1a1a]"
    >
      <div class="w-16 h-16 rounded-xl bg-[#ef4444] text-white border-3 border-[#1a1a1a] flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#1a1a1a]">
        <Clock class="w-8 h-8" />
      </div>
      <h2 class="text-2xl font-black uppercase">德州扑克 (Texas Hold'em) 暂停开放</h2>
      <p class="text-xs sm:text-sm text-[#4a4a4a] font-bold max-w-md mx-auto">
        {{ scheduleState.reason }}<br />
        开放时间：{{ scheduleState.timeDesc }}
      </p>
      <router-link to="/" class="comic-btn-yellow px-6 py-2.5 text-xs inline-block">
        返回游戏大厅 · HOME
      </router-link>
    </div>

    <!-- Main Content Grid (Table + In-Room Chat) -->
    <div v-else class="grid grid-cols-1 gap-6 items-start" :class="isChatOpen ? 'xl:grid-cols-12' : ''">
      <!-- Left: Felt Poker Table -->
      <div :class="isChatOpen ? 'xl:col-span-8' : 'w-full'">
        <div class="relative rounded-none bg-white border-4 border-black p-3 sm:p-6 min-h-[520px] sm:min-h-[580px] flex flex-col justify-between shadow-brutal-xl overflow-hidden">
          <!-- Halftone Dots Texture -->
          <div class="absolute inset-0 bg-[radial-gradient(#1a1a1a_1.5px,transparent_1.5px)] [background-size:20px_20px] opacity-10 pointer-events-none"></div>

      <!-- Top Opponents Area (Real players, zero auto-bots) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 justify-items-center relative z-20 pt-2 min-h-[140px]">
        <!-- Seated Opponents -->
        <div
          v-for="(opp, idx) in opponentPlayers"
          :key="opp.id"
          class="flex flex-col items-center relative"
        >
          <PlayerSeat
            :seat="{
              id: opp.id,
              nickname: opp.nickname,
              avatarUrl: opp.avatarUrl,
              chips: opp.chips,
              currentBet: opp.currentBet,
              status: opp.folded ? 'folded' : opp.isAllIn ? 'allin' : 'active',
              cards: opp.holeCards,
              handName: currentRound === 'showdown' && !opp.folded && opp.holeCards.length === 2 && communityCards.length >= 3
                ? evaluateTexas7Cards([...opp.holeCards, ...communityCards]).rankName
                : ''
            }"
            :isCurrentTurn="currentTurnIdx === idx + 1 && gameActive"
            :showCardsFaceDown="currentRound !== 'showdown'"
            :isHost="opp.isHost"
            :readyStatus="roomStore.currentRoom?.status === 'waiting' ? opp.readyStatus : undefined"
          />

          <!-- Controls for opponents: Simulated toggle ready for test players, and Kick Player for Host -->
          <div
            v-if="roomStore.currentRoom?.status === 'waiting' || roomStore.isHost"
            class="mt-3 flex items-center gap-1 z-30"
          >
            <button
              v-if="opp.id.startsWith('test_player_') && roomStore.currentRoom?.status === 'waiting'"
              v-prevent-reclick
              @click="handleToggleOpponentReady(opp.id)"
              class="px-2 py-0.5 text-[10px] font-black border-2 border-[#1a1a1a] rounded-md bg-[#fffef0] hover:bg-[#facc15]"
            >
              {{ opp.readyStatus === 'ready' ? '设为未准备' : '模拟准备' }}
            </button>
            <button
              v-if="roomStore.isHost"
              v-prevent-reclick
              @click="handleKickPlayer(opp.id, opp.nickname)"
              :disabled="kickingUserId === opp.id"
              class="px-2 py-0.5 text-[10px] font-black border-2 border-[#1a1a1a] rounded-md bg-[#ef4444] text-white hover:bg-[#dc2626] transition-colors flex items-center gap-1 shadow-[1px_1px_0px_0px_#1a1a1a] disabled:opacity-50"
              title="将该玩家移出房间"
            >
              <UserX class="w-3 h-3" />
              <span>{{ kickingUserId === opp.id ? '踢出中...' : '踢出' }}</span>
            </button>
          </div>
        </div>

        <!-- Empty Seats (Responsive width for 2-column mobile) -->
        <div
          v-for="idx in emptySeatsCount"
          :key="'empty_' + idx"
          class="w-28 xs:w-32 sm:w-36 h-28 xs:h-32 rounded-lg border-2 border-dashed border-[#1a1a1a]/40 flex flex-col items-center justify-center p-2 sm:p-3 text-center bg-[#fffef0]/60"
        >
          <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-md border border-[#1a1a1a]/30 bg-[#1a1a1a]/5 flex items-center justify-center mb-1 text-[#1a1a1a]/40">
            <Users class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span class="text-[11px] sm:text-xs font-mono font-bold text-[#1a1a1a]/50">等待玩家入座</span>
          <span class="text-[9px] sm:text-[10px] font-mono text-[#1a1a1a]/30 mt-0.5">空闲座位</span>
        </div>
      </div>

      <!-- Center Community Cards & Pot / Waiting Banner -->
      <div class="flex flex-col items-center justify-center my-6 relative z-10">
        <!-- In-game Pot Display -->
        <template v-if="gameActive || currentRound === 'showdown'">
          <div class="px-6 py-3 rounded-xl bg-[#facc15] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex items-center space-x-3 mb-4">
            <span class="text-xs font-black font-mono text-[#1a1a1a] uppercase tracking-wider">总彩池:</span>
            <div class="flex items-center gap-1 text-2xl font-black font-mono text-[#1a1a1a]">
              <CoinIcon customClass="w-6 h-6" />
              <span>{{ formattedPot }}</span>
            </div>
            <span class="text-xs px-2.5 py-0.5 rounded-md bg-[#1a1a1a] text-[#facc15] border-2 border-[#1a1a1a] font-mono font-bold uppercase shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
              {{ roundName }}
            </span>
          </div>

          <!-- 5 Community Cards Area -->
          <div class="flex items-center space-x-2.5 sm:space-x-3.5 min-h-[116px] p-3 rounded-xl bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            <template v-if="communityCards.length > 0">
              <PlayingCard
                v-for="(c, idx) in communityCards"
                :key="idx"
                :card="c"
                size="md"
              />
            </template>
            <div
              v-for="idx in (5 - communityCards.length)"
              :key="'ph_' + idx"
              class="w-20 h-28 sm:w-22 sm:h-32 rounded-lg border-2 border-dashed border-[#1a1a1a] bg-[#fffef0] flex items-center justify-center text-[#1a1a1a]/50 text-xs font-mono font-bold"
            >
              {{ idx === 1 && communityCards.length === 0 ? '翻牌' : idx === 4 ? '转牌' : '河牌' }}
            </div>
          </div>
        </template>

        <!-- Waiting Stage Center Banner -->
        <div v-else class="px-6 py-4 rounded-xl bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] text-center max-w-md">
          <div class="text-xs font-mono font-black text-[#1a1a1a] uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
            <Clock class="w-4 h-4 text-[#1a1a1a]" />
            <span>房间等待准备就绪</span>
          </div>
          <div class="text-sm font-black text-[#1a1a1a]">
            {{ waitingStatusText }}
          </div>
          <div class="text-[11px] font-mono font-bold text-[#1a1a1a]/70 mt-1">
            进入房间后须先准备；所有玩家准备完毕后，房主即可开启对局
          </div>
        </div>
      </div>

      <!-- Bottom Hero Area -->
      <div class="flex flex-col items-center relative z-20 pb-2">
        <!-- Hero Hole Cards & Hand Type -->
        <div class="flex flex-col items-center mb-3">
          <div class="flex items-center space-x-3 sm:space-x-4 mb-2">
            <template v-if="hero.holeCards.length > 0 && gameActive">
              <PlayingCard
                v-for="(c, idx) in hero.holeCards"
                :key="idx"
                :card="c"
                size="md"
              />
            </template>
            <div v-else class="w-20 h-28 rounded-lg border-2 border-dashed border-[#1a1a1a] bg-[#fffef0] flex items-center justify-center text-[#1a1a1a]/50 text-xs font-mono font-bold text-center px-2">
              {{ roomStore.currentRoom?.status === 'waiting' ? (roomStore.isCurrentUserReady ? '已准备就绪' : '等待准备') : '等待发底牌' }}
            </div>
          </div>

          <!-- Hero Hand Evaluation Rank -->
          <div v-if="heroEvaluation && gameActive" class="px-3.5 py-1 rounded-md bg-[#1a1a1a] text-[#facc15] border-2 border-[#1a1a1a] font-black font-mono text-xs shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            手牌等级: {{ heroEvaluation.rankName }}
          </div>
        </div>

        <!-- Hero Status Pill -->
        <div class="flex items-center space-x-4 mb-4">
          <div class="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-lg bg-[#fffef0] border-3 border-[#1a1a1a] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]">
            <img :src="hero.avatarUrl" class="w-6 h-6 rounded-md border-2 border-[#1a1a1a]" />
            <span class="text-sm font-black text-[#1a1a1a]">{{ hero.nickname }}</span>
            <div class="flex items-center space-x-1 ml-2 text-[#1a1a1a] font-mono font-black text-sm">
              <CoinIcon customClass="w-4 h-4" />
              <span>{{ formattedHeroChips }}</span>
            </div>
            <span
              v-if="roomStore.currentRoom?.status === 'waiting'"
              class="ml-2 px-2 py-0.5 text-[10px] font-black border-2 border-[#1a1a1a] rounded-md uppercase"
              :class="roomStore.isCurrentUserReady ? 'bg-[#22c55e] text-[#1a1a1a]' : 'bg-[#ef4444] text-white'"
            >
              {{ roomStore.isCurrentUserReady ? '已准备' : '未准备' }}
            </span>
          </div>

          <div v-if="hero.currentBet > 0 && gameActive" class="text-xs font-mono font-black text-[#1a1a1a] px-3 py-1 rounded-md bg-[#facc15] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] flex items-center gap-1">
            <span>本轮下注: {{ hero.currentBet }}</span>
            <CoinIcon customClass="w-3.5 h-3.5" />
          </div>
        </div>

        <!-- A. Waiting Stage Action Controls (Ready & Host Start) -->
        <div v-if="roomStore.currentRoom?.status === 'waiting'" class="flex items-center space-x-3 flex-wrap justify-center gap-y-2">
          <!-- 准备 / 取消准备 Button for current user -->
          <button
            v-prevent-reclick
            :disabled="isTogglingReady"
            @click="handleToggleReady"
            class="comic-btn px-6 py-2.5 text-sm font-black flex items-center gap-2 disabled:opacity-50"
            :class="roomStore.isCurrentUserReady ? 'comic-btn-white' : 'comic-btn-green'"
          >
            <CheckCircle v-if="!roomStore.isCurrentUserReady" class="w-4 h-4" />
            <XCircle v-else class="w-4 h-4" />
            <span>{{ isTogglingReady ? '更新中...' : (roomStore.isCurrentUserReady ? '取消准备' : '准备就绪') }}</span>
          </button>

          <!-- 房主开始游戏 Button (Only host can see/click, enabled when all ready) -->
          <button
            v-if="roomStore.isHost"
            v-prevent-reclick
            @click="handleStartGame"
            :disabled="!roomStore.canStartGame || isStarting"
            class="comic-btn px-7 py-2.5 text-sm font-black disabled:opacity-40 flex items-center gap-2"
            :class="roomStore.canStartGame && !isStarting ? 'comic-btn-green shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]' : 'comic-btn-white cursor-not-allowed'"
          >
            <Play class="w-4 h-4 fill-[#1a1a1a]" />
            <span>{{ isStarting ? '正在开局...' : hostStartButtonText }}</span>
          </button>

          <!-- Non-host Waiting status -->
          <div
            v-else
            class="px-4 py-2 bg-[#fffef0] border-2 border-[#1a1a1a] rounded-md font-mono text-xs font-bold shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] text-[#1a1a1a]"
          >
            {{ roomStore.isCurrentUserReady ? '已准备完毕，请等待房主开启对局...' : '请先点击【准备就绪】' }}
          </div>
        </div>

        <!-- B. In-Game Hero Actions -->
        <div
          v-else-if="gameActive && !hero.folded"
          class="flex items-center space-x-2 sm:space-x-4 flex-wrap justify-center gap-y-2"
        >
          <!-- 弃牌 (Fold) -->
          <button
            v-prevent-reclick
            @click="handleHeroFold"
            :disabled="currentTurnIdx !== 0 || isActionBusy"
            class="comic-btn-white px-5 py-2.5 text-sm font-bold disabled:opacity-40 flex items-center gap-1.5"
          >
            <Flag class="w-4 h-4" />
            <span>弃牌 (Fold)</span>
          </button>

          <!-- 过牌 (Check) 或 跟注 (Call) -->
          <button
            v-if="heroCallAmount === 0"
            v-prevent-reclick
            @click="handleHeroCheck"
            :disabled="currentTurnIdx !== 0 || isActionBusy"
            class="comic-btn-blue px-6 py-2.5 text-sm font-black disabled:opacity-40 flex items-center gap-1.5"
          >
            <Check class="w-4 h-4" />
            <span>过牌 (Check)</span>
          </button>
          <button
            v-else
            v-prevent-reclick
            @click="handleHeroCall"
            :disabled="currentTurnIdx !== 0 || hero.chips < heroCallAmount || isActionBusy"
            class="comic-btn-green px-6 py-2.5 text-sm font-black disabled:opacity-40 flex items-center gap-1.5"
          >
            <PlusCircle class="w-4 h-4" />
            <span>跟注 (Call: {{ heroCallAmount }})</span>
            <CoinIcon customClass="w-3.5 h-3.5" />
          </button>

          <!-- 加注 (Raise) -->
          <button
            v-prevent-reclick
            @click="handleHeroRaise"
            :disabled="currentTurnIdx !== 0 || hero.chips < highestBet + bigBlind || isActionBusy"
            class="comic-btn-yellow px-6 py-2.5 text-sm font-black disabled:opacity-40 flex items-center gap-1.5"
          >
            <ArrowUpCircle class="w-4 h-4" />
            <span>加注 (+{{ bigBlind }})</span>
            <CoinIcon customClass="w-3.5 h-3.5" />
          </button>

          <!-- 全下 (All-In) -->
          <button
            v-prevent-reclick
            @click="handleHeroAllIn"
            :disabled="currentTurnIdx !== 0 || hero.chips <= 0 || isActionBusy"
            class="comic-btn-red px-5 py-2.5 text-sm font-black disabled:opacity-40 flex items-center gap-1.5"
          >
            <Zap class="w-4 h-4" />
            <span>全下 (All-In)</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Right: In-Room Chat Channel -->
  <div v-if="isChatOpen" class="xl:col-span-4 h-[580px] sticky top-20">
    <ChatPanel
      :channel="roomChannel"
      :title="`${roomStore.currentRoom?.name || '德州'} · 房间聊天`"
      subtitle="在桌玩家私密畅聊"
      channelType="room"
      :isHost="roomStore.isHost"
      :allowClose="true"
      @close="isChatOpen = false"
    />
  </div>
</div>

    <!-- Settlement Modal -->
    <Modal v-model="showResultModal" title="德扑牌局结算">
      <div class="text-center py-4 space-y-4">
        <div class="flex justify-center">
          <div
            class="w-16 h-16 rounded-xl border-3 border-[#1a1a1a] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]"
            :class="gameResult?.isWin ? 'bg-[#22c55e] text-[#1a1a1a]' : 'bg-[#ef4444] text-white'"
          >
            <Trophy v-if="gameResult?.isWin" class="w-9 h-9" />
            <Frown v-else class="w-9 h-9" />
          </div>
        </div>
        <h2 class="text-2xl font-black text-[#1a1a1a]">
          {{ gameResult?.isWin ? '胜利赢得底池！' : '本局遗憾失利' }}
        </h2>
        <p class="text-[#1a1a1a] font-bold text-sm">
          最终胜者: <span class="bg-[#facc15] px-2 py-0.5 border-2 border-[#1a1a1a] rounded-md text-[#1a1a1a] font-black">{{ gameResult?.winnerName }}</span>
        </p>
        <div class="px-4 py-3 rounded-lg bg-[#fffef0] border-2 border-[#1a1a1a] text-sm font-mono font-bold flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
          <span class="text-[#1a1a1a]/70 uppercase">净盈亏筹码:</span>
          <span class="flex items-center gap-1 font-black" :class="gameResult?.netProfit && gameResult.netProfit >= 0 ? 'text-[#1a1a1a] bg-[#22c55e] px-2 py-0.5 border border-[#1a1a1a] rounded-md' : 'text-white bg-[#ef4444] px-2 py-0.5 border border-[#1a1a1a] rounded-md'">
            <span>{{ (gameResult?.netProfit ?? 0) >= 0 ? '+' : '' }}{{ gameResult?.netProfit }}</span>
            <CoinIcon customClass="w-4 h-4" />
          </span>
        </div>
      </div>
      <template #footer>
        <button
          @click="returnToPreparation"
          class="comic-btn-green w-full py-2.5 text-sm font-black flex items-center justify-center gap-1.5"
        >
          <RotateCw class="w-4 h-4" />
          <span>返回准备下一局</span>
        </button>
      </template>
    </Modal>

    <!-- Room Members Management Modal -->
    <Modal v-model="showMembersModal" title="在桌成员与管理">
      <div class="space-y-4 py-2 font-mono">
        <div class="flex items-center justify-between px-3 py-2 rounded-lg bg-[#fffef0] border-2 border-[#1a1a1a] text-xs">
          <div class="flex items-center gap-1.5 font-black">
            <Users class="w-4 h-4 text-[#1a1a1a]" />
            <span>在桌人数: {{ roomStore.roomPlayers.length }} / {{ roomStore.currentRoom?.max_players || 6 }}</span>
          </div>
          <div v-if="roomStore.isHost" class="text-[11px] font-black text-[#ef4444] bg-[#fee2e2] px-2 py-0.5 rounded border border-[#ef4444]">
            ★ 您拥有踢人管理权限
          </div>
        </div>

        <div class="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          <div
            v-for="p in roomStore.roomPlayers"
            :key="p.user_id"
            class="flex items-center justify-between p-2.5 rounded-lg border-2 border-[#1a1a1a] transition-colors"
            :class="p.user_id === authStore.profile?.id ? 'bg-[#fffef0]' : 'bg-white'"
          >
            <div class="flex items-center space-x-2.5">
              <img
                :src="p.profile?.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + p.user_id"
                class="w-8 h-8 rounded-md border-2 border-[#1a1a1a] bg-white object-cover"
              />
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-black text-[#1a1a1a] max-w-[100px] sm:max-w-[140px] truncate">
                    {{ p.profile?.nickname || `玩家_${p.seat + 1}` }}
                  </span>
                  <span v-if="p.user_id === roomStore.currentRoom?.host_id" class="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#facc15] border border-[#1a1a1a]">
                    房主
                  </span>
                  <span v-if="p.user_id === authStore.profile?.id" class="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#3b82f6] text-white border border-[#1a1a1a]">
                    我
                  </span>
                </div>
                <div class="flex items-center gap-2 mt-0.5 text-[10px] text-[#1a1a1a]/70">
                  <span class="flex items-center gap-0.5 font-bold">
                    <CoinIcon customClass="w-3 h-3" />
                    {{ new Intl.NumberFormat('en-US').format(p.chips) }}
                  </span>
                  <span>•</span>
                  <span :class="p.status === 'ready' ? 'text-[#22c55e] font-black' : 'text-[#f59e0b] font-bold'">
                    {{ p.status === 'ready' ? '已准备' : '未准备' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Action: Kick (for host only) -->
            <div class="flex items-center gap-1">
              <button
                v-if="roomStore.isHost && p.user_id !== authStore.profile?.id"
                v-prevent-reclick
                @click="handleKickPlayer(p.user_id, p.profile?.nickname || '玩家')"
                :disabled="kickingUserId === p.user_id"
                class="comic-btn-red px-2.5 py-1 text-[11px] font-black flex items-center gap-1 disabled:opacity-50"
                title="将该成员移出房间"
              >
                <UserX class="w-3 h-3" />
                <span>{{ kickingUserId === p.user_id ? '踢出中...' : '移出' }}</span>
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import confetti from 'canvas-confetti'
import {
  Crown,
  ArrowLeft,
  Play,
  RotateCw,
  Flag,
  Check,
  PlusCircle,
  ArrowUpCircle,
  Zap,
  Trophy,
  Frown,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  UserPlus,
  UserX,
  LogOut,
  MessageSquare
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { useRoomStore } from '@/stores/room'
import { useChatStore } from '@/stores/chat'
import { useGameScheduleStore } from '@/stores/gameSchedule'
import { sound } from '@/lib/sound'
import { dialog } from '@/lib/dialog'
import PlayingCard from '@/components/game/PlayingCard.vue'
import PlayerSeat from '@/components/game/PlayerSeat.vue'
import Modal from '@/components/common/Modal.vue'
import CoinIcon from '@/components/common/CoinIcon.vue'
import ChatPanel from '@/components/chat/ChatPanel.vue'
import { createTexasDeck, evaluateTexas7Cards, getAITexasAction } from '../engine'
import type { TexasPlayer, TexasBetRound, TexasEvaluation } from '../types'
import type { Card } from '@/types/game'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const walletStore = useWalletStore()
const roomStore = useRoomStore()
const chatStore = useChatStore()
const gameScheduleStore = useGameScheduleStore()

const isAiMode = computed(() => {
  return (
    route.query.mode === 'ai' ||
    roomStore.currentRoom?.round_state?.isAiMode === true ||
    (!roomStore.currentRoom && route.query.mode !== 'multiplayer')
  )
})
const scheduleState = computed(() => gameScheduleStore.checkGameOpen('texas'))

const isChatOpen = ref<boolean>(true)
const roomChannel = computed(() => 'room_' + (roomStore.currentRoom?.id || 'default'))

const smallBlind = computed(() => Math.floor((roomStore.currentRoom?.min_bet || 50) / 2) || 25)
const bigBlind = computed(() => roomStore.currentRoom?.min_bet || 50)
const pot = ref(0)
const currentRound = ref<TexasBetRound>('preflop')
const gameActive = ref(false)
const currentTurnIdx = ref(0) // 0 is Hero, 1..N are Opponents
const showResultModal = ref(false)
const showMembersModal = ref(false)
const gameResult = ref<{ isWin: boolean; winnerName: string; netProfit: number } | null>(null)

let deck: Card[] = []
const communityCards = ref<Card[]>([])

// Hero (Local User)
const hero = ref<TexasPlayer>({
  id: 'hero',
  nickname: '玩家',
  avatarUrl: '',
  chips: 10000,
  holeCards: [],
  currentBet: 0,
  folded: false,
  isAllIn: false,
  isAI: false
})

// Dynamic Opponents from roomPlayers (No hardcoded bots!)
interface InGameTexasOpponent extends TexasPlayer {
  readyStatus: 'ready' | 'waiting'
  isHost: boolean
}
const opponents = ref<InGameTexasOpponent[]>([])

// Synchronize opponents with roomPlayers
const opponentPlayers = computed<InGameTexasOpponent[]>(() => {
  if (!roomStore.currentRoom) return []
  const otherRoomPlayers = roomStore.roomPlayers.filter(
    p => p.user_id !== authStore.profile?.id
  )

  return otherRoomPlayers.map(p => {
    const existing = opponents.value.find(op => op.id === p.user_id)
    return {
      id: p.user_id,
      nickname: p.profile?.nickname || `玩家_${p.seat + 1}`,
      avatarUrl: p.profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${p.user_id}`,
      chips: existing ? existing.chips : p.chips,
      holeCards: existing ? existing.holeCards : [],
      folded: existing ? existing.folded : false,
      isAllIn: existing ? existing.isAllIn : false,
      currentBet: existing ? existing.currentBet : 0,
      isAI: p.user_id.startsWith('test_player_'),
      isHost: p.user_id === roomStore.currentRoom?.host_id,
      readyStatus: p.status === 'ready' ? 'ready' : 'waiting'
    }
  })
})

const maxSeats = computed(() => roomStore.currentRoom?.max_players || 6)
const emptySeatsCount = computed(() => {
  return Math.max(0, maxSeats.value - roomStore.roomPlayers.length)
})

const formattedPot = computed(() => new Intl.NumberFormat('en-US').format(pot.value))
const formattedHeroChips = computed(() => new Intl.NumberFormat('en-US').format(hero.value.chips))

const roundName = computed(() => {
  switch (currentRound.value) {
    case 'preflop': return '翻牌前 (Pre-Flop)'
    case 'flop': return '翻牌圈 (Flop)'
    case 'turn': return '转牌圈 (Turn)'
    case 'river': return '河牌圈 (River)'
    case 'showdown': return '摊牌结算 (Showdown)'
  }
})

const highestBet = computed(() => {
  const all = [hero.value, ...opponents.value]
  return Math.max(0, ...all.map(p => p.currentBet))
})

const heroCallAmount = computed(() => {
  return Math.max(0, highestBet.value - hero.value.currentBet)
})

const heroEvaluation = computed<TexasEvaluation | null>(() => {
  if (hero.value.holeCards.length === 2 && communityCards.value.length >= 3) {
    return evaluateTexas7Cards([...hero.value.holeCards, ...communityCards.value])
  }
  return null
})

const waitingStatusText = computed(() => {
  const total = roomStore.roomPlayers.length
  const ready = roomStore.readyCount
  if (total < 2) {
    return `当前在桌 1 人，至少需 2 名玩家就绪后由房主开局`
  }
  if (ready < total) {
    return `全员准备中 (${ready}/${total} 已准备)`
  }
  return `全员均已准备完毕，等待房主开启对局！`
})

const hostStartButtonText = computed(() => {
  const total = roomStore.roomPlayers.length
  const ready = roomStore.readyCount
  if (total < 2) {
    return '等待其他玩家加入 (至少2人)'
  }
  if (ready < total) {
    return `等待全员准备 (${ready}/${total})`
  }
  return '开始游戏 (全员已就绪)'
})

const isStarting = ref(false)
const isTogglingReady = ref(false)
const isLeaving = ref(false)
const isActionBusy = ref(false)
const kickingUserId = ref<string | null>(null)

// 关键 Bug 修复：监听房间对局状态，确保房主开局后所有玩家同步进入对局界面
watch(
  () => roomStore.currentRoom?.status,
  (newStatus) => {
    if (newStatus === 'playing' && !gameActive.value) {
      startNewRound()
    } else if (newStatus === 'waiting' && gameActive.value) {
      returnToPreparation()
    }
  },
  { immediate: true }
)

function onWindowBeforeUnload() {
  roomStore.leaveRoom()
}

onMounted(async () => {
  window.addEventListener('beforeunload', onWindowBeforeUnload)

  if (authStore.profile) {
    hero.value.id = authStore.profile.id
    hero.value.nickname = authStore.profile.nickname
    hero.value.avatarUrl = authStore.profile.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${authStore.profile.id}`
    hero.value.chips = authStore.profile.chips
  }

  // 直接点击默认进入单人人机模式，自动生成 3 名已准备就绪的 AI 陪玩
  if (isAiMode.value) {
    await roomStore.createAiRoom(
      'texas',
      `${authStore.profile?.nickname || '玩家'}的单机人机桌`,
      50,
      3
    )
  } else if (!roomStore.currentRoom) {
    // 真人联机模式
    await roomStore.createRoom(
      'texas',
      `${authStore.profile?.nickname || '玩家'}的德州扑克桌`,
      50,
      6
    )
  }

  // 初始化本房间专属聊天频道
  chatStore.initChannel(roomChannel.value)
  chatStore.sendSystemAnnouncement(
    roomChannel.value,
    isAiMode.value
      ? `【${authStore.profile?.nickname || '玩家'}】进入了单机人机对局。电脑对手已就绪！`
      : `【${authStore.profile?.nickname || '玩家'}】进入了房间。`
  )
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', onWindowBeforeUnload)
  roomStore.leaveRoom()
})

// Toggle player ready status
async function handleToggleReady() {
  if (isTogglingReady.value) return
  isTogglingReady.value = true
  try {
    await roomStore.toggleReady()
    sound.playClick()
    chatStore.sendSystemAnnouncement(
      roomChannel.value,
      `【${authStore.profile?.nickname || '玩家'}】${roomStore.isCurrentUserReady ? '已准备就绪！' : '取消了准备。'}`
    )
  } finally {
    isTogglingReady.value = false
  }
}

// 辅助本地测试：添加测试玩家
function handleAddTestPlayer() {
  roomStore.addTestPlayer()
  const lastPlayer = roomStore.roomPlayers[roomStore.roomPlayers.length - 1]
  chatStore.sendSystemAnnouncement(
    roomChannel.value,
    `【${lastPlayer?.profile?.nickname || '新玩家'}】加入入座。`
  )
}

// 房主踢出指定玩家
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
      opponents.value = opponents.value.filter(op => op.id !== userId)
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

// Toggle simulated test opponent ready
function handleToggleOpponentReady(userId: string) {
  roomStore.toggleReady(userId)
  const opp = roomStore.roomPlayers.find(p => p.user_id === userId)
  if (opp) {
    chatStore.sendSystemAnnouncement(
      roomChannel.value,
      `【${opp.profile?.nickname || '玩家'}】${opp.status === 'ready' ? '已准备就绪！' : '取消了准备。'}`
    )
  }
}

// Leave room
async function handleLeaveRoom() {
  if (isLeaving.value) return
  isLeaving.value = true
  try {
    chatStore.sendSystemAnnouncement(
      roomChannel.value,
      `【${authStore.profile?.nickname || '玩家'}】离开了房间。`
    )
    await roomStore.leaveRoom()
    router.push('/')
  } finally {
    isLeaving.value = false
  }
}

// Host starts game
async function handleStartGame() {
  if (!roomStore.canStartGame || isStarting.value) return
  isStarting.value = true
  try {
    const ok = await roomStore.startGame()
    if (!ok) return

    chatStore.sendSystemAnnouncement(
      roomChannel.value,
      `房主开启了对局，大小盲注已投入底池，正在发底牌...`
    )
    startNewRound()
  } finally {
    isStarting.value = false
  }
}

// Start deal & betting rounds
function startNewRound() {
  if (authStore.profile && authStore.profile.chips < bigBlind.value) {
    dialog.warning('筹码不足，请先前往签到获取筹码！', { title: '筹码不足' })
    return
  }

  showResultModal.value = false
  deck = createTexasDeck()
  communityCards.value = []
  pot.value = 0
  currentRound.value = 'preflop'

  // 同步 Hero
  if (authStore.profile) {
    hero.value.chips = authStore.profile.chips
  }
  hero.value.holeCards = [deck.pop()!, deck.pop()!]
  hero.value.folded = false
  hero.value.isAllIn = false
  hero.value.currentBet = 0

  // 同步 Opponents
  opponents.value = opponentPlayers.value.map(opp => {
    return {
      ...opp,
      holeCards: [deck.pop()!, deck.pop()!],
      folded: false,
      isAllIn: false,
      currentBet: 0
    }
  })

  // 盲注投入：小盲 (Hero) + 大盲 (Opponent 1)
  const sbAmt = Math.min(smallBlind.value, hero.value.chips)
  hero.value.chips -= sbAmt
  hero.value.currentBet = sbAmt
  pot.value += sbAmt

  if (opponents.value.length > 0) {
    const bbOpp = opponents.value[0]
    const bbAmt = Math.min(bigBlind.value, bbOpp.chips)
    bbOpp.chips -= bbAmt
    bbOpp.currentBet = bbAmt
    pot.value += bbAmt
  }

  sound.playDealCard()
  gameActive.value = true
  currentTurnIdx.value = 0
}

function returnToPreparation() {
  showResultModal.value = false
  gameActive.value = false
  currentRound.value = 'preflop'
  communityCards.value = []
  hero.value.holeCards = []
  hero.value.folded = false
  hero.value.isAllIn = false
  hero.value.currentBet = 0
  opponents.value = []
  if (roomStore.currentRoom?.status === 'playing') {
    roomStore.resetRoomToWaiting()
  }
}

function handleHeroFold() {
  if (isActionBusy.value || currentTurnIdx.value !== 0) return
  isActionBusy.value = true
  hero.value.folded = true
  sound.playLose()
  checkRoundAdvancement()
  setTimeout(() => { isActionBusy.value = false }, 300)
}

function handleHeroCheck() {
  if (isActionBusy.value || currentTurnIdx.value !== 0) return
  isActionBusy.value = true
  sound.playClick()
  advanceTurn()
  setTimeout(() => { isActionBusy.value = false }, 300)
}

function handleHeroCall() {
  if (isActionBusy.value || currentTurnIdx.value !== 0 || hero.value.chips < heroCallAmount.value) return
  isActionBusy.value = true
  const callAmt = heroCallAmount.value
  hero.value.chips -= callAmt
  hero.value.currentBet += callAmt
  pot.value += callAmt
  sound.playChip()
  advanceTurn()
  setTimeout(() => { isActionBusy.value = false }, 300)
}

function handleHeroRaise() {
  const raiseAmt = heroCallAmount.value + bigBlind.value
  if (isActionBusy.value || currentTurnIdx.value !== 0 || hero.value.chips < raiseAmt) return
  isActionBusy.value = true
  hero.value.chips -= raiseAmt
  hero.value.currentBet += raiseAmt
  pot.value += raiseAmt
  sound.playChip()
  advanceTurn()
  setTimeout(() => { isActionBusy.value = false }, 300)
}

function handleHeroAllIn() {
  if (isActionBusy.value || currentTurnIdx.value !== 0 || hero.value.chips <= 0) return
  isActionBusy.value = true
  const allInAmt = hero.value.chips
  hero.value.chips = 0
  hero.value.currentBet += allInAmt
  hero.value.isAllIn = true
  pot.value += allInAmt
  sound.playChip()
  advanceTurn()
  setTimeout(() => { isActionBusy.value = false }, 300)
}

function advanceTurn() {
  if (checkRoundAdvancement()) return

  currentTurnIdx.value = (currentTurnIdx.value + 1) % (opponents.value.length + 1)

  if (currentTurnIdx.value === 0 && hero.value.folded) {
    advanceTurn()
    return
  }

  if (currentTurnIdx.value > 0) {
    const opp = opponents.value[currentTurnIdx.value - 1]
    if (opp.folded || opp.isAllIn) {
      advanceTurn()
      return
    }

    if (opp.isAI || opp.id.startsWith('test_player_')) {
      setTimeout(() => {
        runOpponentTurn(opp)
      }, 600)
    }
  }
}

function runOpponentTurn(opp: InGameTexasOpponent) {
  if (!gameActive.value || opp.folded) return

  const callAmt = Math.max(0, highestBet.value - opp.currentBet)
  const action = getAITexasAction(opp.holeCards, communityCards.value, callAmt, opp.chips)

  if (action === 'fold') {
    opp.folded = true
  } else if (action === 'raise' && opp.chips >= callAmt + bigBlind.value) {
    const raiseCost = callAmt + bigBlind.value
    opp.chips -= raiseCost
    opp.currentBet += raiseCost
    pot.value += raiseCost
    sound.playChip()
  } else if (callAmt > 0) {
    const actualCall = Math.min(callAmt, opp.chips)
    opp.chips -= actualCall
    opp.currentBet += actualCall
    pot.value += actualCall
    sound.playChip()
  } else {
    sound.playClick()
  }

  advanceTurn()
}

// 检查下注轮次推进或是否只剩 1 人
function checkRoundAdvancement(): boolean {
  const activePlayers = [hero.value, ...opponents.value].filter(p => !p.folded)

  if (activePlayers.length === 1) {
    showdownAndSettle(activePlayers[0])
    return true
  }

  // 检查本轮各玩家下注是否持平
  const allBetsEqual = activePlayers.every(p => p.currentBet === highestBet.value || p.isAllIn)

  if (allBetsEqual && currentTurnIdx.value === opponents.value.length) {
    nextStreet()
    return true
  }

  return false
}

// 发下一街公共牌
function nextStreet() {
  sound.playDealCard()

  if (currentRound.value === 'preflop') {
    currentRound.value = 'flop'
    communityCards.value.push(deck.pop()!, deck.pop()!, deck.pop()!)
  } else if (currentRound.value === 'flop') {
    currentRound.value = 'turn'
    communityCards.value.push(deck.pop()!)
  } else if (currentRound.value === 'turn') {
    currentRound.value = 'river'
    communityCards.value.push(deck.pop()!)
  } else if (currentRound.value === 'river') {
    currentRound.value = 'showdown'
    showdownAndSettle()
    return
  }

  currentTurnIdx.value = 0
}

// 摊牌与结算
async function showdownAndSettle(singleWinner?: TexasPlayer) {
  gameActive.value = false
  currentRound.value = 'showdown'

  let winner = singleWinner

  if (!winner) {
    const active = [hero.value, ...opponents.value].filter(p => !p.folded)
    active.sort((a, b) => {
      const evA = evaluateTexas7Cards([...a.holeCards, ...communityCards.value])
      const evB = evaluateTexas7Cards([...b.holeCards, ...communityCards.value])
      return evB.score - evA.score
    })
    winner = active[0]
  }

  const isHeroWin = winner?.id === hero.value.id
  let netProfit = 0

  if (isHeroWin) {
    netProfit = pot.value - hero.value.currentBet
    hero.value.chips += pot.value
    sound.playWin()
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
  } else if (winner) {
    netProfit = -hero.value.currentBet
    winner.chips += pot.value
    sound.playLose()
  }

  gameResult.value = {
    isWin: isHeroWin,
    winnerName: winner?.nickname || '无人获胜',
    netProfit
  }
  showResultModal.value = true

  chatStore.sendSystemAnnouncement(
    roomChannel.value,
    `牌局结算完毕！最终胜者为【${winner?.nickname || '无人'}】，赢得彩金 ${pot.value} 筹码！`
  )

  await walletStore.recordGameSettlement(
    'texas',
    hero.value.currentBet,
    isHeroWin ? pot.value : 0,
    {
      communityCards: communityCards.value,
      heroHoleCards: hero.value.holeCards,
      heroHand: heroEvaluation.value?.rankName,
      winner: winner?.nickname
    }
  )
}
</script>
