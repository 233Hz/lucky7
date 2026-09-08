<template>
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-4 border-[#1a1a1a]">
      <div class="flex items-center space-x-3">
        <router-link to="/" class="comic-btn-white px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
          <ArrowLeft class="w-4 h-4" />
          <span>返回大厅</span>
        </router-link>
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-[#1a1a1a] flex items-center gap-2 tracking-tight">
            <Disc class="w-6 h-6 text-[#1a1a1a]" />
            <span>猜点数六合彩 (Mark Six)</span>
            <span class="comic-badge bg-[#22c55e] text-[#1a1a1a]">
              全服定时开奖
            </span>
          </h1>
          <p class="text-xs font-mono text-[#1a1a1a]/70">特码直选高达 47 倍 · 波色 · 生肖 · 两面盘</p>
        </div>
      </div>

      <!-- Synchronized Period & Countdown Timer -->
      <div class="flex items-center gap-3">
        <div class="text-right">
          <div class="text-[10px] text-[#1a1a1a] font-black uppercase">当前开奖期号</div>
          <div class="text-sm font-black font-mono text-[#1a1a1a] bg-[#facc15] px-2.5 py-0.5 rounded-md border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            {{ lotteryStore.marksixPeriod }}
          </div>
        </div>
        <div class="flex flex-col items-center">
          <div
            class="px-4 py-1.5 rounded-md border-2 border-[#1a1a1a] font-mono font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
            :class="lotteryStore.isMarksixDrawing ? 'bg-[#ef4444] text-white animate-pulse' : 'bg-[#22c55e] text-[#1a1a1a]'"
          >
            <Clock class="w-4 h-4" />
            <span>{{ lotteryStore.isMarksixDrawing ? '封盘·摇号开奖中' : `开奖倒计时 ${lotteryStore.marksixRemainingSeconds}s` }}</span>
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
      <span>【关停过渡】管理员已发起关闭指令：当期（第 {{ lotteryStore.marksixPeriod }} 期）摇号结算后将正式关闭活动，已停止接收新下注。</span>
    </div>

    <div
      v-else-if="!scheduleState.isOpen"
      class="mb-4 p-6 rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[6px_6px_0px_0px_#1a1a1a] text-center space-y-3 font-mono"
    >
      <div class="w-12 h-12 rounded-lg bg-[#ef4444] text-white border-2 border-[#1a1a1a] flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_#1a1a1a]">
        <Clock class="w-6 h-6" />
      </div>
      <h2 class="text-xl font-black text-[#1a1a1a]">猜点数六合彩 (Mark Six) 暂停营业中</h2>
      <p class="text-xs text-[#4a4a4a] font-bold">
        {{ scheduleState.reason }} ({{ scheduleState.timeDesc }})
      </p>
      <router-link to="/" class="comic-btn-yellow px-5 py-2 text-xs inline-block">
        返回游戏大厅 · HOME
      </router-link>
    </div>

    <!-- Main Layout Grid (Left: Game Table, Right: Public Chat Room) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Main Live Draw Shaker & Table -->
      <div class="lg:col-span-8 rounded-xl bg-[#fffef0] border-4 border-[#1a1a1a] p-6 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] space-y-6 text-[#1a1a1a]">
      <!-- Top Draw Stage & History (3-Column Layout: History | Center Ball | Bet Status) -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pb-6 border-b-4 border-[#1a1a1a]">
        <!-- 1. Left: Single Previous Round Result (只显示上一期结果) -->
        <div class="md:col-span-5 flex flex-col items-center md:items-start min-w-0 w-full space-y-2 p-3 bg-white rounded-xl border-3 border-[#1a1a1a] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]">
          <div class="flex items-center justify-between w-full">
            <span class="text-xs font-black font-mono text-[#1a1a1a] uppercase tracking-wider flex items-center gap-1.5">
              <span>上一期特码开奖</span>
            </span>
            <span class="text-[10px] font-bold font-mono px-2 py-0.5 bg-[#facc15] border border-[#1a1a1a] rounded text-[#1a1a1a]">
              第 {{ lotteryStore.marksixLastDrawnPeriod }} 期
            </span>
          </div>

          <!-- 上一期特码球与生肖波色 -->
          <div class="flex items-center justify-between w-full pt-0.5">
            <div class="flex items-center space-x-2">
              <div
                class="w-8 h-8 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center font-mono font-black text-xs shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
                :class="lotteryStore.marksixLastResult.waveColor === 'red' ? 'bg-[#ef4444] text-white' : lotteryStore.marksixLastResult.waveColor === 'blue' ? 'bg-[#3b82f6] text-white' : 'bg-[#22c55e] text-[#1a1a1a]'"
              >
                {{ lotteryStore.marksixLastResult.number < 10 ? '0' + lotteryStore.marksixLastResult.number : lotteryStore.marksixLastResult.number }}
              </div>
              <span class="text-xs font-mono font-black text-[#1a1a1a] px-1.5 py-0.5 bg-[#facc15] border border-[#1a1a1a] rounded">
                生肖: {{ lotteryStore.marksixLastResult.zodiac }}
              </span>
            </div>

            <!-- 大/小与单/双标签 -->
            <div class="flex items-center space-x-1 text-xs font-mono font-black">
              <span
                class="px-1.5 py-0.5 rounded border border-[#1a1a1a] text-[10px]"
                :class="lotteryStore.marksixLastResult.isBig ? 'bg-[#ef4444] text-white' : 'bg-[#3b82f6] text-white'"
              >
                {{ lotteryStore.marksixLastResult.isBig ? '大' : '小' }}
              </span>
              <span class="px-1.5 py-0.5 rounded border border-[#1a1a1a] text-[10px] bg-[#1a1a1a] text-white">
                {{ lotteryStore.marksixLastResult.isOdd ? '单' : '双' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 2. Middle: Shaker Center Stage -->
        <div class="md:col-span-4 flex flex-col items-center justify-center">
          <div class="p-3 sm:p-4 rounded-xl bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex flex-col items-center">
            <BallShaker
              :number="currentResult.number"
              :rolling="isDrawing"
              :zodiac="currentResult.zodiac"
            />
            <div class="mt-2 text-xs font-mono text-[#1a1a1a] font-bold flex items-center space-x-1.5">
              <span>期号: {{ currentResult.period }}</span>
              <span>|</span>
              <span class="font-black px-1.5 py-0.5 rounded-md bg-[#facc15] border border-[#1a1a1a] text-[11px]">{{ currentResult.isBig ? '大' : '小' }}</span>
              <span>|</span>
              <span class="font-black px-1.5 py-0.5 rounded-md bg-[#3b82f6] text-white border border-[#1a1a1a] text-[11px]">{{ currentResult.isOdd ? '单' : '双' }}</span>
            </div>
          </div>
        </div>

        <!-- 3. Right: Current Total Bet & Profit -->
        <div class="md:col-span-3 flex flex-col items-center md:items-end justify-center space-y-1 w-full">
          <div class="text-xs font-black font-mono text-[#1a1a1a]/70 uppercase">本局累计下注</div>
          <div class="text-xl sm:text-2xl font-black font-mono text-[#1a1a1a] flex items-center gap-1.5 bg-[#facc15] px-2.5 py-1 rounded-md border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            <CoinIcon customClass="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{{ formattedTotalBet }}</span>
          </div>
          <div v-if="lastProfit !== null" class="text-xs font-mono font-black flex items-center gap-1 border-2 border-[#1a1a1a] rounded-md px-2 py-0.5 shadow-[1px_1px_0px_0px_rgba(26,26,26,1)]" :class="lastProfit >= 0 ? 'bg-[#22c55e] text-[#1a1a1a]' : 'bg-[#ef4444] text-white'">
            <span>上期盈亏: {{ lastProfit >= 0 ? '+' : '' }}{{ lastProfit }}</span>
            <CoinIcon customClass="w-3 h-3" />
          </div>
        </div>
      </div>

      <!-- Betting Panels Navigation Tabs -->
      <div class="flex flex-wrap items-center gap-2 border-b-4 border-[#1a1a1a] pb-3">
        <button
          v-for="tab in ['two_sides', 'waves', 'zodiacs', 'exact']"
          :key="tab"
          @click="activeTab = tab"
          class="px-4 py-2 rounded-lg border-2 border-[#1a1a1a] font-mono font-black text-xs uppercase transition-all"
          :class="activeTab === tab ? 'bg-[#facc15] text-[#1a1a1a] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] -translate-y-0.5' : 'bg-[#fffef0] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#fffef0]'"
        >
          {{ tabNames[tab] }}
        </button>
      </div>

      <!-- 1. 两面盘 (大/小, 单/双) -->
      <div v-if="activeTab === 'two_sides'" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          v-for="item in [
            { type: 'big_small', value: 'big', name: '特码 大 (25-48)', odds: 1.95, sub: '49和局' },
            { type: 'big_small', value: 'small', name: '特码 小 (01-24)', odds: 1.95, sub: '49和局' },
            { type: 'odd_even', value: 'odd', name: '特码 单', odds: 1.95, sub: '49和局' },
            { type: 'odd_even', value: 'even', name: '特码 双', odds: 1.95, sub: '49和局' }
          ]"
          :key="item.name"
          @click="requestPlaceBet(item.type as any, item.value, item.name, item.odds)"
          class="p-4 rounded-xl border-4 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-between select-none"
          :class="getBetAmount(item.type as any, item.value) > 0 ? 'bg-[#22c55e] text-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'bg-[#fffef0] text-[#1a1a1a] hover:bg-[#f0fdf4] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'"
        >
          <span class="text-base font-black">{{ item.name }}</span>
          <span class="text-xs font-mono font-black mt-1 px-2 py-0.5 border-2 border-[#1a1a1a] rounded-md bg-[#fffef0] text-[#1a1a1a]">1 赔 {{ item.odds }}</span>
          <div v-if="getBetAmount(item.type as any, item.value) > 0" class="mt-2 px-2.5 py-0.5 rounded-md bg-[#1a1a1a] text-[#facc15] border border-[#1a1a1a] text-xs font-mono font-bold flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            <CoinIcon customClass="w-3 h-3" />
            <span>{{ getBetAmount(item.type as any, item.value) }}</span>
          </div>
        </div>
      </div>

      <!-- 2. 三色波 (红波/蓝波/绿波) -->
      <div v-if="activeTab === 'waves'" class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          @click="requestPlaceBet('wave_color', 'red', '红波', 2.8)"
          class="p-5 rounded-xl border-4 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-between select-none"
          :class="getBetAmount('wave_color', 'red') > 0 ? 'bg-[#ef4444] text-white shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'bg-[#fffef0] text-[#1a1a1a] hover:bg-[#fee2e2] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'"
        >
          <div class="flex items-center gap-2">
            <span class="w-4 h-4 rounded-full bg-[#ef4444] border-2 border-[#1a1a1a]"></span>
            <span class="text-lg font-black" :class="getBetAmount('wave_color', 'red') > 0 ? 'text-white' : 'text-[#ef4444]'">红 波 (Red)</span>
          </div>
          <span class="text-xs font-mono font-bold mt-1" :class="getBetAmount('wave_color', 'red') > 0 ? 'text-white' : 'text-[#1a1a1a]/70'">涵盖 17 个红球 · 1 赔 2.8</span>
          <div v-if="getBetAmount('wave_color', 'red') > 0" class="mt-2 px-3 py-0.5 rounded-md bg-[#1a1a1a] text-white border border-[#1a1a1a] text-xs font-mono font-bold flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            <CoinIcon customClass="w-3 h-3" />
            <span>{{ getBetAmount('wave_color', 'red') }}</span>
          </div>
        </div>

        <div
          @click="requestPlaceBet('wave_color', 'blue', '蓝波', 2.9)"
          class="p-5 rounded-xl border-4 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-between select-none"
          :class="getBetAmount('wave_color', 'blue') > 0 ? 'bg-[#3b82f6] text-white shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'bg-[#fffef0] text-[#1a1a1a] hover:bg-[#e0f2fe] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'"
        >
          <div class="flex items-center gap-2">
            <span class="w-4 h-4 rounded-full bg-[#3b82f6] border-2 border-[#1a1a1a]"></span>
            <span class="text-lg font-black" :class="getBetAmount('wave_color', 'blue') > 0 ? 'text-white' : 'text-[#3b82f6]'">蓝 波 (Blue)</span>
          </div>
          <span class="text-xs font-mono font-bold mt-1" :class="getBetAmount('wave_color', 'blue') > 0 ? 'text-white' : 'text-[#1a1a1a]/70'">涵盖 16 个蓝球 · 1 赔 2.9</span>
          <div v-if="getBetAmount('wave_color', 'blue') > 0" class="mt-2 px-3 py-0.5 rounded-md bg-[#1a1a1a] text-white border border-[#1a1a1a] text-xs font-mono font-bold flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            <CoinIcon customClass="w-3 h-3" />
            <span>{{ getBetAmount('wave_color', 'blue') }}</span>
          </div>
        </div>

        <div
          @click="requestPlaceBet('wave_color', 'green', '绿波', 2.9)"
          class="p-5 rounded-xl border-4 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-between select-none"
          :class="getBetAmount('wave_color', 'green') > 0 ? 'bg-[#22c55e] text-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] -translate-y-1' : 'bg-[#fffef0] text-[#1a1a1a] hover:bg-[#dcfce7] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'"
        >
          <div class="flex items-center gap-2">
            <span class="w-4 h-4 rounded-full bg-[#22c55e] border-2 border-[#1a1a1a]"></span>
            <span class="text-lg font-black text-[#1a1a1a]">绿 波 (Green)</span>
          </div>
          <span class="text-xs font-mono font-bold mt-1 text-[#1a1a1a]/70">涵盖 16 个绿球 · 1 赔 2.9</span>
          <div v-if="getBetAmount('wave_color', 'green') > 0" class="mt-2 px-3 py-0.5 rounded-md bg-[#1a1a1a] text-[#22c55e] border border-[#1a1a1a] text-xs font-mono font-bold flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
            <CoinIcon customClass="w-3 h-3" />
            <span>{{ getBetAmount('wave_color', 'green') }}</span>
          </div>
        </div>
      </div>

      <!-- 3. 十二生肖 (1 赔 11.5) -->
      <div v-if="activeTab === 'zodiacs'" class="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
        <div
          v-for="zod in zodiacList"
          :key="zod"
          @click="requestPlaceBet('zodiac', zod, `生肖-${zod}`, 11.5)"
          class="p-3 rounded-xl border-3 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-center select-none"
          :class="getBetAmount('zodiac', zod) > 0 ? 'bg-[#facc15] shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] -translate-y-0.5' : 'bg-[#fffef0] hover:bg-[#fef9c3] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]'"
        >
          <span class="text-lg font-black text-[#1a1a1a]">{{ zod }}</span>
          <span class="text-[10px] font-mono font-bold text-[#1a1a1a]/70">1:11.5</span>
          <span v-if="getBetAmount('zodiac', zod) > 0" class="mt-1 text-[10px] font-mono font-black bg-[#1a1a1a] text-[#facc15] px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
            <CoinIcon customClass="w-2.5 h-2.5" />
            <span>{{ getBetAmount('zodiac', zod) }}</span>
          </span>
        </div>
      </div>

      <!-- 4. 特码直选 1-49 (1 赔 47) -->
      <div v-if="activeTab === 'exact'" class="rounded-xl bg-[#fffef0] border-4 border-[#1a1a1a] p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
        <div class="text-xs font-black font-mono text-[#1a1a1a] mb-3 flex items-center justify-between">
          <span class="uppercase tracking-wider">特码 1-49 直选号盘 (1 赔 47)</span>
          <span class="bg-[#facc15] px-2 py-0.5 border-2 border-[#1a1a1a] rounded-md text-[11px] font-bold text-[#1a1a1a]">点击球号下注</span>
        </div>
        <div class="grid grid-cols-7 sm:grid-cols-10 gap-2 max-h-72 overflow-y-auto pr-1">
          <div
            v-for="n in 49"
            :key="n"
            @click="requestPlaceBet('exact_number', n, `特码${n}`, 47)"
            class="p-2 rounded-lg border-2 border-[#1a1a1a] transition-all cursor-pointer flex flex-col items-center justify-center select-none relative"
            :class="getBetAmount('exact_number', n) > 0 ? 'bg-[#facc15] shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]' : 'bg-white hover:bg-[#fffef0]'"
          >
            <div
              class="w-7 h-7 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center font-mono font-black text-xs shadow-[1px_1px_0px_0px_#1a1a1a]"
              :class="getBallWave(n) === 'red' ? 'bg-[#ef4444] text-white' : getBallWave(n) === 'blue' ? 'bg-[#3b82f6] text-white' : 'bg-[#22c55e] text-[#1a1a1a]'"
            >
              {{ n < 10 ? '0' + n : n }}
            </div>
            <span v-if="getBetAmount('exact_number', n) > 0" class="mt-1 text-[9px] font-mono font-black bg-[#1a1a1a] text-[#facc15] px-1 rounded-sm flex items-center gap-0.5">
              <CoinIcon customClass="w-2.5 h-2.5" />
              <span>{{ getBetAmount('exact_number', n) }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Bottom Controls: Chips + Scheduled Status -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-4 border-[#1a1a1a]">
        <ChipSelector v-model="selectedChip" :disabled="lotteryStore.isMarksixDrawing" />

        <div class="flex items-center space-x-3 w-full sm:w-auto">
          <button
            v-prevent-reclick
            @click="clearAllBets"
            :disabled="totalBetAmount === 0 || lotteryStore.isMarksixDrawing"
            class="comic-btn-white flex-1 sm:flex-none px-4 py-2.5 text-xs disabled:opacity-40"
          >
            清空下注
          </button>
          <div
            class="px-5 py-2.5 rounded-lg border-3 border-[#1a1a1a] text-xs font-black font-mono flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] flex-1 sm:flex-none"
            :class="lotteryStore.isMarksixDrawing ? 'bg-[#ef4444] text-white' : totalBetAmount > 0 ? 'bg-[#facc15] text-[#1a1a1a]' : 'bg-[#fffef0] text-[#1a1a1a]'"
          >
            <template v-if="lotteryStore.isMarksixDrawing">
              <Disc class="w-4 h-4 animate-spin" />
              <span>本期特码摇号中...</span>
            </template>
            <template v-else-if="totalBetAmount > 0">
              <CheckCircle class="w-4 h-4 text-[#22c55e]" />
              <span>已下注 {{ formattedTotalBet }} 币 · 待开奖</span>
            </template>
            <template v-else>
              <span>请在倒计时结束前下注 ({{ lotteryStore.marksixRemainingSeconds }}s)</span>
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

    <!-- 六合彩下注确认弹窗 (必须确认后才能下注) -->
    <Modal v-model="showBetConfirmModal" title="下注确认 · CONFIRM BET">
      <div v-if="pendingBet" class="space-y-4 font-mono">
        <div class="p-3.5 rounded-lg bg-[#fffef0] border-3 border-[#1a1a1a] space-y-2 shadow-[3px_3px_0px_0px_#1a1a1a]">
          <div class="flex items-center justify-between">
            <span class="text-xs text-[#4a4a4a] font-bold">下注游戏 / 期号</span>
            <span class="text-xs font-black bg-[#facc15] px-2 py-0.5 rounded border border-[#1a1a1a]">
              六合彩 · 第 {{ lotteryStore.marksixPeriod }} 期
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
            <span>{{ Math.round(pendingBet.amount * pendingBet.odds) }}</span>
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
import { Disc, ArrowLeft, Clock, CheckCircle, AlertTriangle } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { useLotteryStore } from '@/stores/lottery'
import { useChatStore } from '@/stores/chat'
import { useGameScheduleStore } from '@/stores/gameSchedule'
import { sound } from '@/lib/sound'
import BallShaker from '@/components/game/BallShaker.vue'
import ChipSelector from '@/components/game/ChipSelector.vue'
import ChatPanel from '@/components/chat/ChatPanel.vue'
import CoinIcon from '@/components/common/CoinIcon.vue'
import Modal from '@/components/common/Modal.vue'
import {
  settleMarkSixBets,
  getBallWave,
  ZODIACS
} from '../engine'
import type { MarkSixBetItem, MarkSixBetType, MarkSixDrawResult } from '../types'

const authStore = useAuthStore()
const walletStore = useWalletStore()
const lotteryStore = useLotteryStore()
const chatStore = useChatStore()
const gameScheduleStore = useGameScheduleStore()

const scheduleState = computed(() => gameScheduleStore.checkGameOpen('marksix'))

const activeTab = ref<string>('two_sides')
const tabNames: Record<string, string> = {
  two_sides: '两面盘 (大小单双)',
  waves: '三色波 (红蓝绿)',
  zodiacs: '十二生肖',
  exact: '特码直选 1-49'
}

const zodiacList = ZODIACS
const selectedChip = ref<number>(100)
const bets = ref<MarkSixBetItem[]>([])
const isDrawing = ref<boolean>(false)
const lastProfit = ref<number | null>(null)

// 下注二次确认状态
const showBetConfirmModal = ref<boolean>(false)
const pendingBet = ref<MarkSixBetItem | null>(null)

// 正在滚球的动效定时器与下注时所处期号
let drawAnimInterval: ReturnType<typeof setInterval> | null = null

const currentResult = ref<MarkSixDrawResult>(lotteryStore.marksixLastResult)

watch(
  () => lotteryStore.marksixLastResult,
  (newRes) => {
    if (!isDrawing.value) {
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

function getBetAmount(type: MarkSixBetType, value: string | number): number {
  const item = bets.value.find(b => b.type === type && b.value === value)
  return item ? item.amount : 0
}

// 1. 点击注区：弹出下注二次确认弹窗
function requestPlaceBet(type: MarkSixBetType, value: string | number, name: string, odds: number) {
  if (scheduleState.value.status === 'closing') {
    alert('活动关停中：等待当期开奖后将暂停开放，已停止接收新下注！')
    return
  }
  if (!scheduleState.value.isOpen) {
    alert(`活动未在开放时间内 (${scheduleState.value.timeDesc})`)
    return
  }
  if (lotteryStore.isMarksixDrawing || isDrawing.value) {
    alert('本期已封盘摇号中，请等待开奖揭晓！')
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

// 2. 弹窗内确认下注后才真正下单并扣款记录
function confirmBet() {
  if (!pendingBet.value) return

  if (scheduleState.value.status === 'closing' || !scheduleState.value.isOpen) {
    alert('活动已关停或未在营业时间，下注失败！')
    showBetConfirmModal.value = false
    return
  }
  if (lotteryStore.isMarksixDrawing || isDrawing.value) {
    alert('当前已进入封盘摇号阶段，下注未提交！')
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
  if (lotteryStore.isMarksixDrawing || isDrawing.value) return
  bets.value = []
}

// 监听全服定时开奖阶段变动
watch(
  () => lotteryStore.isMarksixDrawing,
  (isDrawPhase) => {
    if (isDrawPhase) {
      // 封盘滚球阶段启动
      isDrawing.value = true
      sound.playDiceRoll()
      if (drawAnimInterval) clearInterval(drawAnimInterval)
      drawAnimInterval = setInterval(() => {
        const randNum = Math.floor(Math.random() * 49) + 1
        currentResult.value = {
          ...currentResult.value,
          number: randNum,
          waveColor: getBallWave(randNum)
        }
      }, 90)
    } else {
      // 倒计时进入新一期，开奖结果揭晓并结算
      if (drawAnimInterval) {
        clearInterval(drawAnimInterval)
        drawAnimInterval = null
      }
      isDrawing.value = false
      handleScheduledMarkSixConclusion()
    }
  }
)

// 当期开奖结束，执行结算与记录
async function handleScheduledMarkSixConclusion() {
  const settledPeriod = lotteryStore.marksixLastDrawnPeriod
  const result = lotteryStore.marksixLastResult
  currentResult.value = result

  // 广播全服公共频道开奖结果（去重ID保证全服仅通报一条）
  const waveName = result.waveColor === 'red' ? '红波' : result.waveColor === 'blue' ? '蓝波' : '绿波'
  chatStore.sendSystemAnnouncement(
    'global_lottery',
    `【六合彩】第 ${settledPeriod} 期特码：[${result.number < 10 ? '0' + result.number : result.number}] (${waveName} · 生肖${result.zodiac} · ${result.isBig ? '大' : '小'} · ${result.isOdd ? '单' : '双'})！`,
    `ann_marksix_${settledPeriod}`
  )

  if (bets.value.length > 0) {
    const { totalBet, totalPayout, netProfit } = settleMarkSixBets(bets.value, result)
    lastProfit.value = netProfit

    if (netProfit > 0) {
      sound.playWin()
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
    } else if (netProfit < 0) {
      sound.playLose()
    }

    // 记录流水
    await walletStore.recordGameSettlement(
      'marksix',
      totalBet,
      totalPayout,
      {
        number: result.number,
        zodiac: result.zodiac,
        waveColor: result.waveColor,
        period: settledPeriod
      }
    )

    // 清空注单，准备下一期
    bets.value = []
  }

  // 若处于关停过渡期，本期结算完成后正式关闭活动
  if (gameScheduleStore.schedules.marksix?.status === 'closing') {
    await gameScheduleStore.completeCloseActivity('marksix')
  }
}

onUnmounted(() => {
  if (drawAnimInterval) clearInterval(drawAnimInterval)
})
</script>
