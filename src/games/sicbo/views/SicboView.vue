<template>
  <div class="max-w-7xl mx-auto px-4 py-6 font-mono">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b-4 border-[#1a1a1a] pb-3">
      <div class="flex items-center space-x-3">
        <router-link to="/" class="comic-btn-white px-3 py-1.5 text-xs">
          <ArrowLeft class="w-4 h-4 mr-1" />
          <span>返回大厅</span>
        </router-link>
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-[#1a1a1a] uppercase flex items-center gap-2">
            <Dices class="w-6 h-6 text-[#1a1a1a]" />
            <span>猜大小 · 骰宝 (Sic Bo)</span>
            <span class="text-xs px-2.5 py-0.5 rounded-md bg-[#1a1a1a] text-[#ef4444] border-2 border-[#1a1a1a] font-black uppercase shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
              全服定时开奖
            </span>
          </h1>
          <p class="text-xs text-[#1a1a1a] font-bold mt-0.5">大(11-17) · 小(4-10) · 全围(三同号通吃) · 指定点数</p>
        </div>
      </div>

      <!-- Synchronized Period & Countdown Timer -->
      <div class="flex items-center gap-3">
        <div class="text-right">
          <div class="text-[10px] text-[#1a1a1a] font-black uppercase">当前开奖期号</div>
          <div class="text-sm font-black font-mono text-[#1a1a1a] bg-[#facc15] px-2.5 py-0.5 rounded-md border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            {{ lotteryStore.sicboPeriod }}
          </div>
        </div>
        <div class="flex flex-col items-center">
          <div
            class="px-4 py-1.5 rounded-md border-2 border-[#1a1a1a] font-mono font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
            :class="lotteryStore.isSicboDrawing ? 'bg-[#ef4444] text-white animate-pulse' : 'bg-[#22c55e] text-[#1a1a1a]'"
          >
            <Clock class="w-4 h-4" />
            <span>{{ lotteryStore.isSicboDrawing ? '封盘·开奖摇骰中' : `开奖倒计时 ${lotteryStore.sicboRemainingSeconds}s` }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Closing / Closed Status Notice Banner -->
    <div
      v-if="scheduleState.status === 'closing'"
      class="mb-4 p-3 rounded-lg bg-[#facc15] border-3 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a] flex items-center gap-2 font-mono text-xs font-black text-[#1a1a1a]"
    >
      <AlertTriangle class="w-4 h-4 text-[#ef4444] animate-bounce flex-shrink-0" />
      <span>【关停过渡】管理员已发起关闭指令：当期（第 {{ lotteryStore.sicboPeriod }} 期）摇骰结算后将正式关闭活动，已停止接收新下注。</span>
    </div>

    <div
      v-else-if="!scheduleState.isOpen"
      class="mb-4 p-6 rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[6px_6px_0px_0px_#1a1a1a] text-center space-y-3 font-mono"
    >
      <div class="w-12 h-12 rounded-lg bg-[#ef4444] text-white border-2 border-[#1a1a1a] flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_#1a1a1a]">
        <Clock class="w-6 h-6" />
      </div>
      <h2 class="text-xl font-black text-[#1a1a1a]">猜大小 · 骰宝 (Sic Bo) 暂停营业中</h2>
      <p class="text-xs text-[#4a4a4a] font-bold">
        {{ scheduleState.reason }} ({{ scheduleState.timeDesc }})
      </p>
      <router-link to="/" class="comic-btn-yellow px-5 py-2 text-xs inline-block">
        返回游戏大厅 · HOME
      </router-link>
    </div>

    <!-- Main Layout Grid (Left: Game Table, Right: Public Chat Room) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Main Shaker & Dice Table -->
      <div class="lg:col-span-8 rounded-none bg-[#fffef0] border-4 border-[#1a1a1a] p-6 shadow-brutal-xl space-y-6 text-[#1a1a1a]">
      <!-- Top Shaker Stage & History (3-Column Layout: History | Center Shaker | Bet Status) -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-6 lg:gap-8 pb-6 border-b-4 border-[#1a1a1a]">
        <!-- 1. Left: Single Previous Round Result (只显示上一期结果) -->
        <div class="w-full md:w-[260px] lg:w-[270px] shrink-0 flex flex-col items-center md:items-start min-w-0 space-y-2 p-3 bg-white rounded-xl border-3 border-[#1a1a1a] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]">
          <div class="flex items-center justify-between w-full">
            <span class="text-xs font-black text-[#1a1a1a] uppercase tracking-wider flex items-center gap-1.5">
              <span>上一期开奖结果</span>
            </span>
            <span class="text-[10px] font-bold font-mono px-2 py-0.5 bg-[#facc15] border border-[#1a1a1a] rounded text-[#1a1a1a]">
              第 {{ lotteryStore.sicboLastDrawnPeriod }} 期
            </span>
          </div>

          <!-- 上一期骰子与属性展示 -->
          <div class="flex items-center justify-between w-full pt-0.5">
            <!-- 3 颗骰子 -->
            <div class="flex items-center space-x-1.5">
              <div
                v-for="(d, dIdx) in lotteryStore.sicboLastResult.dice"
                :key="dIdx"
                class="w-8 h-8 rounded-lg bg-[#fffef0] border-2 border-[#1a1a1a] flex items-center justify-center font-mono font-black text-sm text-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
              >
                {{ d }}
              </div>
            </div>

            <!-- 点数与大/小/全围标签 -->
            <div class="flex items-center space-x-1 text-xs font-mono font-black">
              <span class="text-sm font-black text-[#1a1a1a]">{{ lotteryStore.sicboLastResult.sum }}点</span>
              <span
                class="px-1.5 py-0.5 rounded border border-[#1a1a1a] text-[10px]"
                :class="lotteryStore.sicboLastResult.isTriple ? 'bg-[#facc15] text-[#1a1a1a]' : lotteryStore.sicboLastResult.isBig ? 'bg-[#ef4444] text-white' : 'bg-[#3b82f6] text-white'"
              >
                {{ lotteryStore.sicboLastResult.isTriple ? '全围' : lotteryStore.sicboLastResult.isBig ? '大' : '小' }}
              </span>
              <span class="px-1.5 py-0.5 rounded border border-[#1a1a1a] text-[10px] bg-[#1a1a1a] text-white">
                {{ lotteryStore.sicboLastResult.isOdd ? '单' : '双' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 2. Middle: Shaker Center Dome -->
        <div class="flex-1 flex flex-col items-center justify-center min-w-0 px-2">
          <div class="p-3 sm:p-4 rounded-xl bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex flex-col items-center">
            <DiceBox :dice="currentResult.dice" :rolling="isRolling" />
            <div class="mt-2 flex items-center space-x-1.5 text-xs font-mono font-black">
              <span class="text-[#1a1a1a]">结果点数:</span>
              <span class="text-[#1a1a1a] text-sm sm:text-base font-black">{{ currentResult.sum }} 点</span>
              <span
                class="px-1.5 py-0.5 rounded-md border-2 border-[#1a1a1a] text-[11px] shadow-[1px_1px_0px_0px_rgba(26,26,26,1)]"
                :class="currentResult.isTriple ? 'bg-[#facc15] text-[#1a1a1a]' : currentResult.isBig ? 'bg-[#ef4444] text-white' : 'bg-[#3b82f6] text-white'"
              >
                {{ currentResult.isTriple ? '全围(豹子)' : currentResult.isBig ? '大' : '小' }}
              </span>
              <span>·</span>
              <span class="text-[#1a1a1a]">{{ currentResult.isOdd ? '单' : '双' }}</span>
            </div>
          </div>
        </div>

        <!-- 3. Right: Current Total Bet & Profit -->
        <div class="w-full md:w-[150px] lg:w-[170px] shrink-0 flex flex-col items-center md:items-end justify-center space-y-1">
          <div class="text-xs text-[#1a1a1a] font-black uppercase">本局累计下注</div>
          <div class="text-xl sm:text-2xl font-black font-mono text-[#1a1a1a] flex items-center gap-1.5 bg-[#facc15] px-2.5 py-1 rounded-lg border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            <CoinIcon customClass="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{{ formattedTotalBet }}</span>
          </div>
          <div v-if="lastProfit !== null" class="text-xs font-mono font-black flex items-center gap-1 px-2 py-0.5 rounded border-2 border-[#1a1a1a] shadow-[1px_1px_0px_0px_rgba(26,26,26,1)]" :class="lastProfit >= 0 ? 'bg-[#22c55e] text-[#1a1a1a]' : 'bg-[#ef4444] text-white'">
            <span>上一局: {{ lastProfit >= 0 ? '+' : '' }}{{ lastProfit }}</span>
            <CoinIcon customClass="w-3 h-3" />
          </div>
        </div>
      </div>

      <!-- Betting Table Felt Areas -->
      <div class="space-y-4">
        <!-- 1. Primary Bets (Small, Triple, Big, Odd, Even) -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
          <!-- 小 (Small) -->
          <div
            @click="requestPlaceBet('small', undefined, '小 (4-10)', 1)"
            class="p-2.5 sm:p-3 rounded-xl border-3 sm:border-4 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-between select-none relative text-center min-h-[96px]"
            :class="getBetAmount('small') > 0 ? 'bg-[#3b82f6] text-white shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'bg-[#fffef0] text-[#1a1a1a] hover:bg-[#e0f2fe] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'"
          >
            <div class="flex flex-col items-center">
              <span class="text-xl sm:text-2xl font-black">小</span>
              <span class="text-[11px] sm:text-xs font-bold font-mono">4 - 10 点</span>
            </div>
            <span class="text-[10px] sm:text-xs font-bold mt-1 opacity-80 whitespace-nowrap">1 赔 1 (全围吃)</span>
            <div v-if="getBetAmount('small') > 0" class="mt-1.5 px-2 py-0.5 rounded-md bg-[#1a1a1a] text-[#fffef0] text-xs font-mono font-black flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
              <CoinIcon customClass="w-3 h-3" />
              <span>{{ getBetAmount('small') }}</span>
            </div>
          </div>

          <!-- 全围 (Any Triple) -->
          <div
            @click="requestPlaceBet('any_triple', undefined, '全围 (任意豹子)', 30)"
            class="p-2.5 sm:p-3 rounded-xl border-3 sm:border-4 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-between select-none relative col-span-2 sm:col-span-1 text-center min-h-[96px]"
            :class="getBetAmount('any_triple') > 0 ? 'bg-[#facc15] text-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'bg-[#fffef0] text-[#1a1a1a] hover:bg-[#fef9c3] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'"
          >
            <div class="flex flex-col items-center">
              <span class="text-xl sm:text-2xl font-black flex items-center gap-1">
                <Crown class="w-4 h-4 text-[#1a1a1a]" />
                <span>全 围</span>
              </span>
              <span class="text-[11px] sm:text-xs font-bold font-mono">任意三同号</span>
            </div>
            <span class="text-[10px] sm:text-xs font-bold mt-1 opacity-80 whitespace-nowrap">1 赔 30 (高彩)</span>
            <div v-if="getBetAmount('any_triple') > 0" class="mt-1.5 px-2 py-0.5 rounded-md bg-[#1a1a1a] text-[#facc15] text-xs font-mono font-black flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
              <CoinIcon customClass="w-3 h-3" />
              <span>{{ getBetAmount('any_triple') }}</span>
            </div>
          </div>

          <!-- 大 (Big) -->
          <div
            @click="requestPlaceBet('big', undefined, '大 (11-17)', 1)"
            class="p-2.5 sm:p-3 rounded-xl border-3 sm:border-4 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-between select-none relative text-center min-h-[96px]"
            :class="getBetAmount('big') > 0 ? 'bg-[#ef4444] text-white shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'bg-[#fffef0] text-[#1a1a1a] hover:bg-[#fee2e2] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'"
          >
            <div class="flex flex-col items-center">
              <span class="text-xl sm:text-2xl font-black">大</span>
              <span class="text-[11px] sm:text-xs font-bold font-mono">11 - 17 点</span>
            </div>
            <span class="text-[10px] sm:text-xs font-bold mt-1 opacity-80 whitespace-nowrap">1 赔 1 (全围吃)</span>
            <div v-if="getBetAmount('big') > 0" class="mt-1.5 px-2 py-0.5 rounded-md bg-[#1a1a1a] text-white text-xs font-mono font-black flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
              <CoinIcon customClass="w-3 h-3" />
              <span>{{ getBetAmount('big') }}</span>
            </div>
          </div>

          <!-- 单 (Odd) -->
          <div
            @click="requestPlaceBet('odd', undefined, '单 (Odd)', 1)"
            class="p-2.5 sm:p-3 rounded-xl border-3 sm:border-4 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-between select-none relative text-center min-h-[96px]"
            :class="getBetAmount('odd') > 0 ? 'bg-[#22c55e] text-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'bg-[#fffef0] text-[#1a1a1a] hover:bg-[#dcfce7] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'"
          >
            <div class="flex flex-col items-center">
              <span class="text-xl sm:text-2xl font-black">单</span>
              <span class="text-[11px] sm:text-xs font-bold font-mono">Odd</span>
            </div>
            <span class="text-[10px] sm:text-xs font-bold mt-1 opacity-80 whitespace-nowrap">1 赔 1</span>
            <div v-if="getBetAmount('odd') > 0" class="mt-1.5 px-2 py-0.5 rounded-md bg-[#1a1a1a] text-[#22c55e] text-xs font-mono font-black flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
              <CoinIcon customClass="w-3 h-3" />
              <span>{{ getBetAmount('odd') }}</span>
            </div>
          </div>

          <!-- 双 (Even) -->
          <div
            @click="requestPlaceBet('even', undefined, '双 (Even)', 1)"
            class="p-2.5 sm:p-3 rounded-xl border-3 sm:border-4 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-between select-none relative text-center min-h-[96px]"
            :class="getBetAmount('even') > 0 ? 'bg-[#facc15] text-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'bg-[#fffef0] text-[#1a1a1a] hover:bg-[#fef08a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'"
          >
            <div class="flex flex-col items-center">
              <span class="text-xl sm:text-2xl font-black">双</span>
              <span class="text-[11px] sm:text-xs font-bold font-mono">Even</span>
            </div>
            <span class="text-[10px] sm:text-xs font-bold mt-1 opacity-80 whitespace-nowrap">1 赔 1</span>
            <div v-if="getBetAmount('even') > 0" class="mt-1.5 px-2 py-0.5 rounded-md bg-[#1a1a1a] text-[#facc15] text-xs font-mono font-black flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
              <CoinIcon customClass="w-3 h-3" />
              <span>{{ getBetAmount('even') }}</span>
            </div>
          </div>
        </div>

        <!-- 2. Points Bets (4-17) -->
        <div class="p-4 rounded-xl bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] space-y-2">
          <div class="text-xs font-black text-[#1a1a1a] uppercase tracking-wider">指定总点数 (POINTS 4 - 17)</div>
          <div class="grid grid-cols-7 gap-2">
            <div
              v-for="pt in 14"
              :key="pt + 3"
              @click="requestPlaceBet('point', pt + 3, `${pt + 3}点`, pointOdds[pt + 3])"
              class="p-2 rounded-lg border-2 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-center select-none"
              :class="getBetAmount('point', pt + 3) > 0 ? 'bg-[#facc15] text-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] -translate-y-0.5' : 'bg-white hover:bg-[#fffef0]'"
            >
              <span class="text-sm font-black">{{ pt + 3 }}</span>
              <span class="text-[10px] font-mono text-[#1a1a1a] font-bold">1:{{ pointOdds[pt + 3] }}</span>
              <span v-if="getBetAmount('point', pt + 3) > 0" class="mt-1 text-[9px] font-mono font-black bg-[#1a1a1a] text-[#facc15] px-1 rounded-sm flex items-center gap-0.5">
                <CoinIcon customClass="w-2 h-2" />
                <span>{{ getBetAmount('point', pt + 3) }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- 3. Single Die Bets (1-6) -->
        <div class="p-4 rounded-xl bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] space-y-2">
          <div class="text-xs font-black text-[#1a1a1a] uppercase tracking-wider">单骰出现 (出现1/2/3次赔1/2/3倍)</div>
          <div class="grid grid-cols-6 gap-2">
            <div
              v-for="d in 6"
              :key="d"
              @click="requestPlaceBet('single_die', d, `单骰${d}`, 1)"
              class="p-2.5 rounded-lg border-2 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-center select-none"
              :class="getBetAmount('single_die', d) > 0 ? 'bg-[#3b82f6] text-white shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] -translate-y-0.5' : 'bg-white hover:bg-[#fffef0]'"
            >
              <div class="w-7 h-7 rounded-md border-2 border-[#1a1a1a] flex items-center justify-center font-mono font-black text-sm bg-[#fffef0] text-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                {{ d }}
              </div>
              <span v-if="getBetAmount('single_die', d) > 0" class="mt-1 text-[10px] font-mono font-black text-[#1a1a1a] flex items-center gap-0.5">
                <CoinIcon customClass="w-2.5 h-2.5" />
                <span>{{ getBetAmount('single_die', d) }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Controls: Chips + Scheduled Status -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-4 border-[#1a1a1a]">
        <ChipSelector v-model="selectedChip" :disabled="lotteryStore.isSicboDrawing" />

        <div class="flex items-center space-x-3 w-full sm:w-auto">
          <button
            v-prevent-reclick
            @click="clearAllBets"
            :disabled="totalBetAmount === 0 || lotteryStore.isSicboDrawing"
            class="comic-btn-white px-4 py-2.5 text-xs flex-1 sm:flex-none disabled:opacity-40"
          >
            清空下注
          </button>
          <div
            class="px-5 py-2.5 rounded-lg border-3 border-[#1a1a1a] text-xs font-black font-mono flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] flex-1 sm:flex-none"
            :class="lotteryStore.isSicboDrawing ? 'bg-[#ef4444] text-white' : totalBetAmount > 0 ? 'bg-[#facc15] text-[#1a1a1a]' : 'bg-[#fffef0] text-[#1a1a1a]'"
          >
            <template v-if="lotteryStore.isSicboDrawing">
              <Dices class="w-4 h-4 animate-spin" />
              <span>本期摇骰开奖中...</span>
            </template>
            <template v-else-if="totalBetAmount > 0">
              <CheckCircle class="w-4 h-4 text-[#22c55e]" />
              <span>已成功下注 {{ formattedTotalBet }} 币 · 待开奖</span>
            </template>
            <template v-else>
              <span>点击台面区域下注 ({{ lotteryStore.sicboRemainingSeconds }}s)</span>
            </template>
          </div>
        </div>
      </div>
    </div>

      <!-- Right Column: Full-Server Public Chat Channel -->
      <div class="lg:col-span-4 h-[680px] sticky top-20">
        <ChatPanel
          channel="global_lottery"
          title="全服公共聊天室"
          subtitle="全服定时开奖频道"
          channelType="lottery"
        />
      </div>
    </div>

    <!-- 下注确认弹窗 (必须确认后才能下注) -->
    <Modal v-model="showBetConfirmModal" title="下注确认 · CONFIRM BET">
      <div v-if="pendingBet" class="space-y-4 font-mono">
        <div class="p-3.5 rounded-lg bg-[#fffef0] border-3 border-[#1a1a1a] space-y-2 shadow-[3px_3px_0px_0px_#1a1a1a]">
          <div class="flex items-center justify-between">
            <span class="text-xs text-[#4a4a4a] font-bold">下注游戏 / 期号</span>
            <span class="text-xs font-black bg-[#facc15] px-2 py-0.5 rounded border border-[#1a1a1a]">
              猜大小 · 第 {{ lotteryStore.sicboPeriod }} 期
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-[#4a4a4a] font-bold">投注项目</span>
            <span class="text-sm font-black text-[#1a1a1a]">{{ pendingBet.name }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-[#4a4a4a] font-bold">赔率</span>
            <span class="text-xs font-black text-[#22c55e] bg-[#dcfce7] px-2 py-0.5 rounded border border-[#1a1a1a]">
              1 赔 {{ pendingBet.odds }}
            </span>
          </div>
        </div>

        <!-- 筹码选择 / 微调 -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-xs font-black text-[#1a1a1a]">下注筹码金额</label>
            <span class="text-xs font-bold text-[#4a4a4a] flex items-center gap-1">
              <span>可用余额: {{ authStore.userChips }}</span>
              <CoinIcon customClass="w-3.5 h-3.5" />
            </span>
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model.number="pendingBet.amount"
              type="number"
              min="10"
              step="50"
              class="comic-input flex-1 px-3 py-2 text-sm font-black"
            />
            <CoinIcon customClass="w-5 h-5" />
          </div>
          <!-- 快捷筹码选择 -->
          <div class="flex items-center gap-1.5 mt-2">
            <button
              v-for="amt in [50, 100, 500, 1000, 5000]"
              :key="amt"
              type="button"
              @click="pendingBet.amount = amt"
              class="px-2.5 py-1 text-xs font-bold border-2 border-[#1a1a1a] rounded transition-all"
              :class="pendingBet.amount === amt ? 'bg-[#facc15] shadow-[2px_2px_0px_0px_#1a1a1a]' : 'bg-white hover:bg-[#fffef0]'"
            >
              {{ amt }}
            </button>
          </div>
        </div>

        <div class="p-3 rounded-lg bg-white border-2 border-[#1a1a1a] flex items-center justify-between text-xs font-bold">
          <span>预计最高派彩:</span>
          <span class="text-base font-black text-[#ef4444] flex items-center gap-1">
            <CoinIcon customClass="w-4 h-4" />
            <span>{{ pendingBet.amount * pendingBet.odds }}</span>
          </span>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end space-x-3 w-full">
          <button
            @click="showBetConfirmModal = false"
            class="comic-btn-white px-5 py-2 text-xs"
          >
            取消
          </button>
          <button
            v-prevent-reclick
            @click="confirmBet"
            :disabled="!pendingBet || pendingBet.amount <= 0 || pendingBet.amount > authStore.userChips"
            class="comic-btn-yellow px-6 py-2 text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <CheckCircle class="w-4 h-4" />
            <span>确认下注 · BET NOW</span>
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import confetti from 'canvas-confetti'
import { Dices, ArrowLeft, Crown, Clock, CheckCircle, AlertTriangle } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { useLotteryStore } from '@/stores/lottery'
import { useChatStore } from '@/stores/chat'
import { useGameScheduleStore } from '@/stores/gameSchedule'
import { sound } from '@/lib/sound'
import DiceBox from '@/components/game/DiceBox.vue'
import ChipSelector from '@/components/game/ChipSelector.vue'
import ChatPanel from '@/components/chat/ChatPanel.vue'
import CoinIcon from '@/components/common/CoinIcon.vue'
import Modal from '@/components/common/Modal.vue'
import { calculateSicBoSettlement, POINT_ODDS } from '../engine'
import type { SicBoBetItem, SicBoBetType, SicBoRollResult } from '../types'

const authStore = useAuthStore()
const walletStore = useWalletStore()
const lotteryStore = useLotteryStore()
const chatStore = useChatStore()
const gameScheduleStore = useGameScheduleStore()

const scheduleState = computed(() => gameScheduleStore.checkGameOpen('sicbo'))

const pointOdds = POINT_ODDS
const selectedChip = ref<number>(100)
const bets = ref<SicBoBetItem[]>([])
const isRolling = ref<boolean>(false)
const lastProfit = ref<number | null>(null)

// 下注二次确认状态
const showBetConfirmModal = ref<boolean>(false)
const pendingBet = ref<SicBoBetItem | null>(null)

// 正在进行的骰子动效定时器
let rollAnimInterval: ReturnType<typeof setInterval> | null = null

const currentResult = ref<SicBoRollResult>(lotteryStore.sicboLastResult)

watch(
  () => lotteryStore.sicboLastResult,
  (newRes) => {
    if (!isRolling.value) {
      currentResult.value = newRes
    }
  }
)

const totalBetAmount = computed(() => {
  return bets.value.reduce((acc, b) => acc + b.amount, 0)
})

const formattedTotalBet = computed(() => {
  return new Intl.NumberFormat('en-US').format(totalBetAmount.value)
})

function getBetAmount(type: SicBoBetType, value?: number): number {
  const item = bets.value.find(b => b.type === type && b.value === value)
  return item ? item.amount : 0
}

// 1. 点击台面区域：触发下注二次确认弹窗，而不是直接下注
function requestPlaceBet(type: SicBoBetType, value: number | undefined, name: string, odds: number) {
  if (scheduleState.value.status === 'closing') {
    alert('活动关停中：等待当期开奖后将暂停开放，已停止接收新下注！')
    return
  }
  if (!scheduleState.value.isOpen) {
    alert(`活动未在开放时间内 (${scheduleState.value.timeDesc})`)
    return
  }
  if (lotteryStore.isSicboDrawing || isRolling.value) {
    alert('本期已封盘摇骰中，请等待开奖结束！')
    return
  }

  if (authStore.userChips < selectedChip.value) {
    alert('筹码不足，请先前往签到获取筹码！')
    return
  }

  pendingBet.value = {
    type,
    value,
    name,
    odds,
    amount: selectedChip.value
  }
  showBetConfirmModal.value = true
}

// 2. 在弹窗内点击「确认下注」后才真正下单并扣费记录
function confirmBet() {
  if (!pendingBet.value) return

  if (scheduleState.value.status === 'closing' || !scheduleState.value.isOpen) {
    alert('活动已关停或未在营业时间，下注失败！')
    showBetConfirmModal.value = false
    return
  }
  if (lotteryStore.isSicboDrawing || isRolling.value) {
    alert('当前已进入封盘摇骰阶段，下注未提交！')
    showBetConfirmModal.value = false
    return
  }
  if (authStore.userChips < totalBetAmount.value + pendingBet.value.amount) {
    alert('筹码不足！')
    return
  }

  const { type, value, name, odds, amount } = pendingBet.value
  sound.playChip()

  const existing = bets.value.find(b => b.type === type && b.value === value)
  if (existing) {
    existing.amount += amount
  } else {
    bets.value.push({
      type,
      value,
      name,
      odds,
      amount
    })
  }

  showBetConfirmModal.value = false
  pendingBet.value = null
}

function clearAllBets() {
  if (lotteryStore.isSicboDrawing || isRolling.value) return
  bets.value = []
}

// 监听全服开奖阶段变动
watch(
  () => lotteryStore.isSicboDrawing,
  (isDrawing) => {
    if (isDrawing) {
      // 封盘摇盅阶段启动
      isRolling.value = true
      sound.playDiceRoll()
      if (rollAnimInterval) clearInterval(rollAnimInterval)
      rollAnimInterval = setInterval(() => {
        currentResult.value.dice = [
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1
        ]
      }, 90)
    } else {
      // 倒计时进入新一期，开奖结果揭晓与结算
      if (rollAnimInterval) {
        clearInterval(rollAnimInterval)
        rollAnimInterval = null
      }
      isRolling.value = false
      handleScheduledDrawConclusion()
    }
  }
)

// 当期开奖结束，执行结算与记录
async function handleScheduledDrawConclusion() {
  const settledPeriod = lotteryStore.sicboLastDrawnPeriod
  const result = lotteryStore.sicboLastResult
  currentResult.value = result

  // 广播全服公共频道开奖结果（去重ID保证全服仅通报一条）
  chatStore.sendSystemAnnouncement(
    'global_lottery',
    `【猜大小】第 ${settledPeriod} 期开奖：[${result.dice.join(', ')}]，合计 ${result.sum} 点 (${result.isTriple ? '全围豹子' : result.isBig ? '大' : '小'} · ${result.isOdd ? '单' : '双'})！`,
    `ann_sicbo_${settledPeriod}`
  )

  if (bets.value.length > 0) {
    const { totalBet, totalPayout, netProfit } = calculateSicBoSettlement(bets.value, result)
    lastProfit.value = netProfit

    if (netProfit > 0) {
      sound.playWin()
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } })
    } else if (netProfit < 0) {
      sound.playLose()
    }

    // 记录战绩流水
    await walletStore.recordGameSettlement(
      'sicbo',
      totalBet,
      totalPayout,
      {
        dice: result.dice,
        sum: result.sum,
        isTriple: result.isTriple,
        period: settledPeriod
      }
    )

    // 清空注单，准备下一期
    bets.value = []
  }

  // 若处于关停过渡期，本期结算完成后正式关闭活动
  if (gameScheduleStore.schedules.sicbo?.status === 'closing') {
    await gameScheduleStore.completeCloseActivity('sicbo')
  }
}

onUnmounted(() => {
  if (rollAnimInterval) clearInterval(rollAnimInterval)
})
</script>
