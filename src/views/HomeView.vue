<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
    <!-- Top Comic Hero Banner -->
    <div class="relative rounded-lg bg-[#ef4444] border-4 border-[#1a1a1a] p-6 sm:p-10 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-hidden text-white">
      <!-- Halftone Dots & Speed Lines Textures -->
      <div class="absolute inset-0 bg-[radial-gradient(circle,#1a1a1a_1.2px,transparent_1.2px)] [background-size:8px_8px] opacity-15 pointer-events-none"></div>
      <div class="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_12px,rgba(0,0,0,0.06)_12px,rgba(0,0,0,0.06)_24px)] pointer-events-none"></div>

      <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div class="space-y-3 max-w-xl">
          <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-[#facc15] text-[#1a1a1a] border-3 border-[#1a1a1a] text-xs font-black uppercase font-mono shadow-[2px_2px_0px_0px_#1a1a1a]">
            <span class="w-2.5 h-2.5 rounded-full bg-[#1a1a1a] animate-ping"></span>
            <span>POW! 现已开放 5 大经典漫画面板玩法</span>
          </div>
          <h1 class="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
            热血街机棋牌，<span class="bg-[#facc15] text-[#1a1a1a] border-3 border-[#1a1a1a] px-3 py-0.5 inline-block -rotate-2 shadow-[3px_3px_0px_0px_#1a1a1a]">即刻开局</span>
          </h1>
          <p class="text-xs sm:text-sm text-white font-sans font-bold leading-relaxed">
            涵盖炸金花、21点、德州扑克、猜大小与六合彩。支持多人实时联机对决、智能 AI 陪练与全服财富排行榜。
          </p>
        </div>

        <!-- Quick Status & Action Card -->
        <div class="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-[#fffef0] text-[#1a1a1a] p-5 rounded-lg border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <div class="flex items-center space-x-3.5 pr-4 sm:border-r-3 border-[#1a1a1a]">
            <div class="w-12 h-12 rounded-lg bg-[#facc15] border-3 border-[#1a1a1a] flex items-center justify-center shadow-[2px_2px_0px_0px_#1a1a1a]">
              <CoinIcon customClass="w-7 h-7" />
            </div>
            <div>
              <div class="text-[10px] text-[#1a1a1a] font-black uppercase tracking-wider font-mono">我的筹码余额</div>
              <div class="text-2xl font-black font-mono text-[#1a1a1a]">{{ formattedChips }}</div>
            </div>
          </div>
          <router-link
            to="/checkin"
            class="comic-btn-yellow px-5 py-3 text-xs sm:text-sm"
          >
            <CalendarCheck class="w-4 h-4 mr-1.5" />
            <span>每日签到领币</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Games Grid Section -->
    <div class="space-y-6">
      <div class="flex items-center justify-between border-b-4 border-[#1a1a1a] pb-3">
        <div>
          <h2 class="text-2xl sm:text-3xl font-black text-[#1a1a1a] uppercase flex items-center gap-2.5 font-mono">
            <Gamepad2 class="w-7 h-7 text-[#1a1a1a]" />
            <span>热门漫画面板大厅</span>
            <span class="text-xs font-black px-2.5 py-0.5 bg-[#facc15] text-[#1a1a1a] border-2 border-[#1a1a1a] rounded-md shadow-[2px_2px_0px_0px_#1a1a1a]">SELECT PANEL</span>
          </h2>
          <p class="text-xs text-[#4a4a4a] font-bold mt-1">选择经典游戏分镜，开启智勇热血对战</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- 1. 炸金花 -->
        <div class="group relative rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] p-6 flex flex-col justify-between shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:shadow-[10px_10px_0px_0px_rgba(26,26,26,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all duration-150 overflow-hidden">
          <!-- Halftone Reveal on Hover -->
          <div class="absolute inset-0 bg-[radial-gradient(circle,#1a1a1a_1px,transparent_1px)] [background-size:6px_6px] opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-150"></div>
          <!-- Badge Pop -->
          <div class="absolute -top-1 -right-1 bg-[#facc15] text-[#1a1a1a] text-[10px] font-black uppercase px-2.5 py-0.5 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] transform scale-0 group-hover:scale-100 transition-transform duration-100 rotate-6 z-20">HOT!</div>

          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-lg bg-[#facc15] border-3 border-[#1a1a1a] flex items-center justify-center text-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a]">
                <Layers class="w-6 h-6" />
              </div>
              <span class="px-2.5 py-1 rounded-md bg-[#1a1a1a] text-white border-2 border-[#1a1a1a] text-[11px] font-black uppercase font-mono shadow-[2px_2px_0px_0px_#1a1a1a]">
                三张比拼 · 心理博弈
              </span>
            </div>
            <h3 class="text-xl font-black uppercase tracking-wide text-[#1a1a1a]">
              炸金花 (Golden Flower)
            </h3>
            <p class="text-xs text-[#4a4a4a] font-sans font-bold mt-2 leading-relaxed">
              三张底牌见分晓！支持闷牌（暗注）、看牌翻倍、加注与激爽比牌PK。豹子通吃，235奇袭逆转。
            </p>
            <div class="flex items-center space-x-2 mt-4 text-[11px] font-mono font-bold text-[#1a1a1a] bg-white p-2.5 rounded-md border-2 border-[#1a1a1a]">
              <span class="flex items-center gap-1 font-black">底注: 50 <CoinIcon customClass="w-3.5 h-3.5" /></span>
              <span>•</span>
              <span class="font-bold">单人AI / 联机开房</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t-3 border-[#1a1a1a]">
            <router-link
              to="/game/zhajinhua"
              class="comic-btn-yellow w-full py-3 text-xs block text-center"
            >
              开始游戏 · BATTLE!
            </router-link>
          </div>
        </div>

        <!-- 2. 21点 (Blackjack) -->
        <div class="group relative rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] p-6 flex flex-col justify-between shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:shadow-[10px_10px_0px_0px_rgba(26,26,26,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all duration-150 overflow-hidden">
          <div class="absolute inset-0 bg-[radial-gradient(circle,#1a1a1a_1px,transparent_1px)] [background-size:6px_6px] opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-150"></div>
          <div class="absolute -top-1 -right-1 bg-[#ef4444] text-white text-[10px] font-black uppercase px-2.5 py-0.5 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] transform scale-0 group-hover:scale-100 transition-transform duration-100 rotate-6 z-20">TOP!</div>

          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-lg bg-[#ef4444] border-3 border-[#1a1a1a] flex items-center justify-center text-white shadow-[3px_3px_0px_0px_#1a1a1a]">
                <Sparkles class="w-6 h-6" />
              </div>
              <span class="px-2.5 py-1 rounded-md bg-[#1a1a1a] text-[#facc15] border-2 border-[#1a1a1a] text-[11px] font-black uppercase font-mono shadow-[2px_2px_0px_0px_#1a1a1a]">
                3:2 天王赔率
              </span>
            </div>
            <h3 class="text-xl font-black uppercase tracking-wide text-[#1a1a1a]">
              21点 (Blackjack)
            </h3>
            <p class="text-xs text-[#4a4a4a] font-sans font-bold mt-2 leading-relaxed">
              经典娱乐场黑杰克对决！包含要牌、停牌、双倍下注。软17庄家规则，算点智取庄家高额筹码。
            </p>
            <div class="flex items-center space-x-2 mt-4 text-[11px] font-mono font-bold text-[#1a1a1a] bg-white p-2.5 rounded-md border-2 border-[#1a1a1a]">
              <span class="font-black">自由下注</span>
              <span>•</span>
              <span class="font-bold">智能 Ace 点数计算</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t-3 border-[#1a1a1a]">
            <router-link
              to="/game/blackjack"
              class="comic-btn-red w-full py-3 text-xs block text-center"
            >
              开始挑战 · HIT ME!
            </router-link>
          </div>
        </div>

        <!-- 3. 德州扑克 (Texas Hold'em) -->
        <div class="group relative rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] p-6 flex flex-col justify-between shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:shadow-[10px_10px_0px_0px_rgba(26,26,26,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all duration-150 overflow-hidden">
          <div class="absolute inset-0 bg-[radial-gradient(circle,#1a1a1a_1px,transparent_1px)] [background-size:6px_6px] opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-150"></div>
          <div class="absolute -top-1 -right-1 bg-[#3b82f6] text-white text-[10px] font-black uppercase px-2.5 py-0.5 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] transform scale-0 group-hover:scale-100 transition-transform duration-100 rotate-6 z-20">PRO!</div>

          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-lg bg-[#3b82f6] border-3 border-[#1a1a1a] flex items-center justify-center text-white shadow-[3px_3px_0px_0px_#1a1a1a]">
                <Crown class="w-6 h-6" />
              </div>
              <span class="px-2.5 py-1 rounded-md bg-[#1a1a1a] text-[#3b82f6] border-2 border-[#1a1a1a] text-[11px] font-black uppercase font-mono shadow-[2px_2px_0px_0px_#1a1a1a]">
                7选5牌型评级
              </span>
            </div>
            <h3 class="text-xl font-black uppercase tracking-wide text-[#1a1a1a]">
              德州扑克 (Texas Hold'em)
            </h3>
            <p class="text-xs text-[#4a4a4a] font-sans font-bold mt-2 leading-relaxed">
              国际风靡的智力竞技！翻牌前、翻牌、转牌、河牌四轮下注，过牌、跟注、加注与全下(All-in)。
            </p>
            <div class="flex items-center space-x-2 mt-4 text-[11px] font-mono font-bold text-[#1a1a1a] bg-white p-2.5 rounded-md border-2 border-[#1a1a1a]">
              <span class="flex items-center gap-1 font-black">盲注: 50/100 <CoinIcon customClass="w-3.5 h-3.5" /></span>
              <span>•</span>
              <span class="font-bold">皇家同花顺</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t-3 border-[#1a1a1a]">
            <router-link
              to="/game/texas"
              class="comic-btn-blue w-full py-3 text-xs block text-center"
            >
              入席对决 · ALL-IN!
            </router-link>
          </div>
        </div>

        <!-- 4. 猜大小 (Sic Bo) -->
        <div class="group relative rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] p-6 flex flex-col justify-between shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:shadow-[10px_10px_0px_0px_rgba(26,26,26,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all duration-150 overflow-hidden">
          <div class="absolute inset-0 bg-[radial-gradient(circle,#1a1a1a_1px,transparent_1px)] [background-size:6px_6px] opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-150"></div>
          <div class="absolute -top-1 -right-1 bg-[#ef4444] text-white text-[10px] font-black uppercase px-2.5 py-0.5 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] transform scale-0 group-hover:scale-100 transition-transform duration-100 rotate-6 z-20">60X!</div>

          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-lg bg-[#ef4444] border-3 border-[#1a1a1a] flex items-center justify-center text-white shadow-[3px_3px_0px_0px_#1a1a1a]">
                <Dices class="w-6 h-6" />
              </div>
              <span class="px-2.5 py-1 rounded-md bg-[#1a1a1a] text-[#ef4444] border-2 border-[#1a1a1a] text-[11px] font-black uppercase font-mono shadow-[2px_2px_0px_0px_#1a1a1a]">
                最高 60 倍
              </span>
            </div>
            <h3 class="text-xl font-black uppercase tracking-wide text-[#1a1a1a]">
              猜大小 · 骰宝 (Sic Bo)
            </h3>
            <p class="text-xs text-[#4a4a4a] font-sans font-bold mt-2 leading-relaxed">
              3颗骰子摇盅开奖！涵盖大、小、单、双、全围豹子(1:30)及 4-17 点高倍赔率，即开即算。
            </p>
            <div class="flex items-center space-x-2 mt-4 text-[11px] font-mono font-bold text-[#1a1a1a] bg-white p-2.5 rounded-md border-2 border-[#1a1a1a]">
              <span class="font-black">近期走势图</span>
              <span>•</span>
              <span class="font-bold">物理骰盅动效</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t-3 border-[#1a1a1a]">
            <router-link
              to="/game/sicbo"
              class="comic-btn-red w-full py-3 text-xs block text-center"
            >
              摇骰开盅 · ROLL!
            </router-link>
          </div>
        </div>

        <!-- 5. 猜点数六合彩 (Mark Six) -->
        <div class="group relative rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] p-6 flex flex-col justify-between shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:shadow-[10px_10px_0px_0px_rgba(26,26,26,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all duration-150 overflow-hidden">
          <div class="absolute inset-0 bg-[radial-gradient(circle,#1a1a1a_1px,transparent_1px)] [background-size:6px_6px] opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-150"></div>
          <div class="absolute -top-1 -right-1 bg-[#22c55e] text-white text-[10px] font-black uppercase px-2.5 py-0.5 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] transform scale-0 group-hover:scale-100 transition-transform duration-100 rotate-6 z-20">47X!</div>

          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-lg bg-[#22c55e] border-3 border-[#1a1a1a] flex items-center justify-center text-white shadow-[3px_3px_0px_0px_#1a1a1a]">
                <Disc class="w-6 h-6" />
              </div>
              <span class="px-2.5 py-1 rounded-md bg-[#1a1a1a] text-[#22c55e] border-2 border-[#1a1a1a] text-[11px] font-black uppercase font-mono shadow-[2px_2px_0px_0px_#1a1a1a]">
                特码 47 倍
              </span>
            </div>
            <h3 class="text-xl font-black uppercase tracking-wide text-[#1a1a1a]">
              猜点数六合彩 (Mark Six)
            </h3>
            <p class="text-xs text-[#4a4a4a] font-sans font-bold mt-2 leading-relaxed">
              1-49特码摇奖机滚球！支持特码直选、大小单双、红蓝绿三色波及十二生肖多维下注。
            </p>
            <div class="flex items-center space-x-2 mt-4 text-[11px] font-mono font-bold text-[#1a1a1a] bg-white p-2.5 rounded-md border-2 border-[#1a1a1a]">
              <span class="font-black">即开型滚球</span>
              <span>•</span>
              <span class="font-bold">历史特码统计</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t-3 border-[#1a1a1a]">
            <router-link
              to="/game/marksix"
              class="comic-btn-green w-full py-3 text-xs block text-center"
            >
              即刻开奖 · LUCKY 7!
            </router-link>
          </div>
        </div>

        <!-- 6. 联机房间大厅入口 (Multiplayer Lobby) -->
        <div class="group relative rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] p-6 flex flex-col justify-between shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:shadow-[10px_10px_0px_0px_rgba(26,26,26,1)] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all duration-150 overflow-hidden">
          <div class="absolute inset-0 bg-[radial-gradient(circle,#1a1a1a_1px,transparent_1px)] [background-size:6px_6px] opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-150"></div>
          <div class="absolute -top-1 -right-1 bg-[#facc15] text-[#1a1a1a] text-[10px] font-black uppercase px-2.5 py-0.5 border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] transform scale-0 group-hover:scale-100 transition-transform duration-100 rotate-6 z-20">ROOM!</div>

          <div>
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 rounded-lg bg-[#1a1a1a] border-3 border-[#1a1a1a] flex items-center justify-center text-[#facc15] shadow-[3px_3px_0px_0px_#1a1a1a]">
                <Globe class="w-6 h-6" />
              </div>
              <span class="px-2.5 py-1 rounded-md bg-[#facc15] text-[#1a1a1a] border-2 border-[#1a1a1a] text-[11px] font-black uppercase font-mono shadow-[2px_2px_0px_0px_#1a1a1a]">
                实时联机
              </span>
            </div>
            <h3 class="text-xl font-black uppercase tracking-wide text-[#1a1a1a]">
              在线联机房间大厅
            </h3>
            <p class="text-xs text-[#4a4a4a] font-sans font-bold mt-2 leading-relaxed">
              支持多人在线即时匹配！自由创建专属对战房间、自定义底注门槛，随时邀请好友入座同台较量。
            </p>
            <div class="flex items-center space-x-2 mt-4 text-[11px] font-mono font-black text-[#1a1a1a] bg-[#facc15] p-2.5 rounded-md border-2 border-[#1a1a1a]">
              <span>■ 联机网络服务正常 · 实时对决</span>
            </div>
          </div>
          <div class="mt-6 pt-4 border-t-3 border-[#1a1a1a]">
            <button
              @click="openRoomLobby"
              class="comic-btn-black w-full py-3 text-xs"
            >
              浏览联机房间 · JOIN!
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Multiplayer Lobby Modal -->
    <Modal v-model="showRoomModal" title="在线联机对战大厅">
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-xs text-[#1a1a1a] font-mono font-black">选择房间即刻入座：</span>
          <button
            @click="showCreateModal = true"
            class="comic-btn-yellow px-3.5 py-1.5 text-xs"
          >
            <Plus class="w-3.5 h-3.5 mr-1" />
            <span>创建新房间</span>
          </button>
        </div>

        <div class="space-y-3 max-h-64 overflow-y-auto pr-1">
          <div
            v-for="rm in roomStore.activeRooms"
            :key="rm.id"
            class="p-4 rounded-lg bg-white border-3 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a] flex items-center justify-between hover:bg-[#fffef0] transition-colors"
          >
            <div>
              <div class="text-sm font-black text-[#1a1a1a] font-mono">{{ rm.name }}</div>
              <div class="text-xs text-[#1a1a1a] font-mono font-bold mt-1 flex items-center gap-1.5">
                <span>底注: {{ rm.min_bet }}</span>
                <CoinIcon customClass="w-3.5 h-3.5" />
                <span>· 上限: {{ rm.max_players }}人</span>
              </div>
            </div>
            <button
              @click="joinRoomAndEnter(rm)"
              class="comic-btn-blue px-3.5 py-1.5 text-xs"
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
          <label class="block text-xs font-black text-[#1a1a1a] uppercase mb-1 font-mono">房间名称</label>
          <input
            v-model="newRoomName"
            type="text"
            placeholder="例如: 谁与争锋好友桌"
            class="comic-input w-full text-sm py-2.5 px-3"
          />
        </div>
        <div>
          <label class="block text-xs font-black text-[#1a1a1a] uppercase mb-1 font-mono">游戏玩法</label>
          <select
            v-model="newRoomType"
            class="comic-input w-full text-sm py-2.5 px-3 font-mono font-bold"
          >
            <option value="zhajinhua">炸金花 (Golden Flower)</option>
            <option value="texas">德州扑克 (Texas Hold'em)</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-black text-[#1a1a1a] uppercase mb-1 flex items-center gap-1 font-mono">
            <span>底注要求</span>
            <CoinIcon customClass="w-3.5 h-3.5" />
          </label>
          <input
            v-model.number="newRoomMinBet"
            type="number"
            min="10"
            step="10"
            class="comic-input w-full text-sm py-2.5 px-3 font-mono font-bold"
          />
        </div>
      </div>
      <template #footer>
        <button
          @click="submitCreateRoom"
          class="comic-btn-yellow w-full py-2.5 text-sm"
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
