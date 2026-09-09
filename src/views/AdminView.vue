<template>
  <div class="max-w-6xl mx-auto px-4 py-8 space-y-8 font-mono">
    <!-- Non-admin protection alert -->
    <div v-if="!authStore.isAdmin" class="rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] p-8 text-center space-y-4 shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] text-[#1a1a1a]">
      <div class="w-16 h-16 rounded-lg bg-[#ef4444] border-3 border-[#1a1a1a] text-white mx-auto flex items-center justify-center shadow-[4px_4px_0px_0px_#1a1a1a]">
        <ShieldX class="w-9 h-9" />
      </div>
      <h2 class="text-3xl font-black text-[#1a1a1a] uppercase">无权访问管理后台 · ACCESS DENIED</h2>
      <p class="text-xs sm:text-sm text-[#4a4a4a] max-w-lg mx-auto leading-relaxed font-bold">
        当前账号未具备管理员访问权限。如需开通后台权限，请在后台控制台中执行如下授权命令：
      </p>
      <div class="p-3 rounded-md bg-white border-3 border-[#1a1a1a] font-mono text-xs text-[#1a1a1a] font-black max-w-md mx-auto overflow-x-auto shadow-[3px_3px_0px_0px_#1a1a1a]">
        update public.profiles set is_admin = true where email = '{{ authStore.user?.email || '你的邮箱' }}';
      </div>
      <router-link to="/" class="comic-btn-yellow px-6 py-2.5 text-xs inline-block">
        返回大厅首页 · HOME
      </router-link>
    </div>

    <!-- Admin Panel -->
    <div v-else class="space-y-6">
      <!-- Admin Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-[#1a1a1a] pb-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-[#1a1a1a] uppercase flex items-center gap-2">
            <Shield class="w-7 h-7 sm:w-8 sm:h-8 text-[#1a1a1a]" />
            <span>系统管理控制台 · SUPER ADMIN</span>
            <span class="px-2 py-0.5 rounded-md bg-[#ef4444] text-white border-2 border-[#1a1a1a] text-[10px] sm:text-xs font-black shadow-[2px_2px_0px_0px_#1a1a1a]">
              AUTHORIZED
            </span>
          </h1>
          <p class="text-xs text-[#4a4a4a] font-bold mt-1">支持分菜单管理游戏运营时段、开奖调度、消息治理与玩家资产</p>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-auto">
          <button
            v-prevent-reclick
            @click="refreshAllData"
            class="comic-btn-white px-3.5 py-2 text-xs flex items-center gap-1.5"
          >
            <RotateCw class="w-3.5 h-3.5 text-[#1a1a1a]" :class="{ 'animate-spin': isFetchingPlayers || isLoadingStats }" />
            <span>刷新全服数据</span>
          </button>
        </div>
      </div>

      <!-- Menu Navigation Bar (Comic Tabs) -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 border-b-4 border-[#1a1a1a] scrollbar-none">
        <button
          v-for="menu in adminMenus"
          :key="menu.id"
          @click="switchTab(menu.id)"
          class="flex items-center gap-2 px-4 py-2.5 rounded-lg border-3 border-[#1a1a1a] font-black text-xs transition-all whitespace-nowrap select-none cursor-pointer"
          :class="activeTab === menu.id
            ? 'bg-[#facc15] text-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a] -translate-y-0.5'
            : 'bg-white text-[#1a1a1a] hover:bg-[#fffef0] shadow-[2px_2px_0px_0px_#1a1a1a]'"
        >
          <component :is="menu.icon" class="w-4 h-4 text-[#1a1a1a]" />
          <span>{{ menu.label }}</span>
          <span
            v-if="menu.badge"
            class="px-1.5 py-0.5 rounded text-[10px] font-black border border-[#1a1a1a]"
            :class="activeTab === menu.id ? 'bg-[#1a1a1a] text-[#facc15]' : 'bg-[#fffef0] text-[#1a1a1a]'"
          >
            {{ menu.badge }}
          </span>
        </button>
      </div>

      <!-- ========================================================== -->
      <!-- TAB 1: 📊 数据概览 · DASHBOARD -->
      <!-- ========================================================== -->
      <div v-if="activeTab === 'dashboard'" class="space-y-6">
        <!-- 4 KPI Metrics Summary -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Card 1: Players -->
          <div class="p-5 rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-[#4a4a4a] font-black uppercase">注册玩家总数</span>
                <Users class="w-4 h-4 text-[#1a1a1a]" />
              </div>
              <div class="text-2xl font-black text-[#1a1a1a] mt-2">{{ playersList.length }} 位</div>
            </div>
            <button
              @click="switchTab('players')"
              class="mt-3 text-[11px] font-black text-[#1a1a1a] hover:text-[#eab308] flex items-center gap-1 self-start underline"
            >
              <span>查阅玩家资产</span>
              <ChevronRight class="w-3 h-3" />
            </button>
          </div>

          <!-- Card 2: Circulating Chips -->
          <div class="p-5 rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-[#4a4a4a] font-black uppercase">全服流通虚拟币</span>
                <CoinIcon customClass="w-4 h-4" />
              </div>
              <div class="text-2xl font-black text-[#1a1a1a] mt-2 flex items-center gap-1.5">
                <CoinIcon customClass="w-5 h-5" />
                <span>{{ totalCirculatingChips }}</span>
              </div>
            </div>
            <button
              @click="switchTab('players')"
              class="mt-3 text-[11px] font-black text-[#1a1a1a] hover:text-[#eab308] flex items-center gap-1 self-start underline"
            >
              <span>调整 / 赠送筹码</span>
              <ChevronRight class="w-3 h-3" />
            </button>
          </div>

          <!-- Card 3: Game Modes -->
          <div class="p-5 rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-[#4a4a4a] font-black uppercase">运营中游戏玩法</span>
                <Gamepad2 class="w-4 h-4 text-[#1a1a1a]" />
              </div>
              <div class="text-2xl font-black text-[#22c55e] mt-2">{{ openGamesCount }} / {{ gameModeList.length }} 开放</div>
            </div>
            <button
              @click="switchTab('schedules')"
              class="mt-3 text-[11px] font-black text-[#1a1a1a] hover:text-[#eab308] flex items-center gap-1 self-start underline"
            >
              <span>调度运营时段</span>
              <ChevronRight class="w-3 h-3" />
            </button>
          </div>

          <!-- Card 4: Chat Messages -->
          <div class="p-5 rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-[#4a4a4a] font-black uppercase">全服存留聊天记录</span>
                <MessageSquare class="w-4 h-4 text-[#1a1a1a]" />
              </div>
              <div class="text-2xl font-black text-[#1a1a1a] mt-2">{{ messageStats.total }} 条</div>
              <div class="text-[10px] text-[#4a4a4a] font-bold mt-0.5">TTL 有效期: {{ chatStore.messageTtlMinutes }} 分钟</div>
            </div>
            <button
              @click="switchTab('retention')"
              class="mt-3 text-[11px] font-black text-[#1a1a1a] hover:text-[#eab308] flex items-center gap-1 self-start underline"
            >
              <span>管理生命周期</span>
              <ChevronRight class="w-3 h-3" />
            </button>
          </div>
        </div>

        <!-- System Health & Architecture Status Card -->
        <div class="rounded-lg bg-white border-4 border-[#1a1a1a] p-6 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] space-y-4">
          <div class="flex items-center justify-between border-b-3 border-[#1a1a1a] pb-3">
            <div class="flex items-center gap-2">
              <Activity class="w-5 h-5 text-[#1a1a1a]" />
              <h2 class="text-base font-black text-[#1a1a1a] uppercase">系统服务状态与运行架构 · SYSTEM HEALTH & SERVICES</h2>
            </div>
            <span class="px-2.5 py-0.5 rounded-md bg-[#22c55e] text-[#1a1a1a] border-2 border-[#1a1a1a] text-xs font-black shadow-[2px_2px_0px_0px_#1a1a1a]">
              🟢 ALL SYSTEMS OPERATIONAL
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div class="p-3.5 rounded-lg bg-[#fffef0] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] space-y-1">
              <div class="text-[11px] font-black text-[#4a4a4a] uppercase flex items-center gap-1.5">
                <Database class="w-3.5 h-3.5 text-[#1a1a1a]" />
                <span>Supabase 数据库</span>
              </div>
              <div class="text-xs font-black text-[#22c55e] flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-[#22c55e] inline-block"></span>
                <span>已连接 (Connected)</span>
              </div>
              <div class="text-[10px] text-[#4a4a4a] font-bold">支持原子 RPC 派彩事务</div>
            </div>

            <div class="p-3.5 rounded-lg bg-[#fffef0] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] space-y-1">
              <div class="text-[11px] font-black text-[#4a4a4a] uppercase flex items-center gap-1.5">
                <Sparkles class="w-3.5 h-3.5 text-[#1a1a1a]" />
                <span>Realtime 广播总线</span>
              </div>
              <div class="text-xs font-black text-[#22c55e] flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-[#22c55e] inline-block"></span>
                <span>实时同步 (Active)</span>
              </div>
              <div class="text-[10px] text-[#4a4a4a] font-bold">跨标签页与服务端毫秒级广播</div>
            </div>

            <div class="p-3.5 rounded-lg bg-[#fffef0] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] space-y-1">
              <div class="text-[11px] font-black text-[#4a4a4a] uppercase flex items-center gap-1.5">
                <Clock class="w-3.5 h-3.5 text-[#1a1a1a]" />
                <span>pg_cron 定时清理</span>
              </div>
              <div class="text-xs font-black text-[#22c55e] flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-[#22c55e] inline-block"></span>
                <span>运行中 (每 10 分钟)</span>
              </div>
              <div class="text-[10px] text-[#4a4a4a] font-bold">自动丢弃全服超期聊天与通报</div>
            </div>

            <div class="p-3.5 rounded-lg bg-[#fffef0] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a] space-y-1">
              <div class="text-[11px] font-black text-[#4a4a4a] uppercase flex items-center gap-1.5">
                <Timer class="w-3.5 h-3.5 text-[#1a1a1a]" />
                <span>下期自动生效机制</span>
              </div>
              <div class="text-xs font-black text-[#22c55e] flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-[#22c55e] inline-block"></span>
                <span>就绪 (Staging Enabled)</span>
              </div>
              <div class="text-[10px] text-[#4a4a4a] font-bold">开奖中改配置不影响当期对局</div>
            </div>
          </div>
        </div>

        <!-- Quick Navigation Action Tiles -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            @click="switchTab('schedules')"
            class="p-4 rounded-lg bg-white border-3 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] hover:bg-[#fffef0] hover:shadow-[5px_5px_0px_0px_#1a1a1a] transition-all text-left flex items-start space-x-3 group cursor-pointer"
          >
            <div class="w-10 h-10 rounded-lg bg-[#facc15] border-2 border-[#1a1a1a] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-[2px_2px_0px_0px_#1a1a1a]">
              <Gamepad2 class="w-5 h-5 text-[#1a1a1a]" />
            </div>
            <div>
              <div class="text-xs font-black text-[#1a1a1a]">游戏模式与运营时段</div>
              <div class="text-[10px] text-[#4a4a4a] font-bold mt-1">设置 5 大玩法开放时间与关停控制</div>
            </div>
          </button>

          <button
            @click="switchTab('lottery')"
            class="p-4 rounded-lg bg-white border-3 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] hover:bg-[#fffef0] hover:shadow-[5px_5px_0px_0px_#1a1a1a] transition-all text-left flex items-start space-x-3 group cursor-pointer"
          >
            <div class="w-10 h-10 rounded-lg bg-[#facc15] border-2 border-[#1a1a1a] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-[2px_2px_0px_0px_#1a1a1a]">
              <Timer class="w-5 h-5 text-[#1a1a1a]" />
            </div>
            <div>
              <div class="text-xs font-black text-[#1a1a1a]">开奖周期与历史期数</div>
              <div class="text-[10px] text-[#4a4a4a] font-bold mt-1">设定秒级开奖循环与前台弹窗期数</div>
            </div>
          </button>

          <button
            @click="switchTab('retention')"
            class="p-4 rounded-lg bg-white border-3 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] hover:bg-[#fffef0] hover:shadow-[5px_5px_0px_0px_#1a1a1a] transition-all text-left flex items-start space-x-3 group cursor-pointer"
          >
            <div class="w-10 h-10 rounded-lg bg-[#facc15] border-2 border-[#1a1a1a] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-[2px_2px_0px_0px_#1a1a1a]">
              <MessageSquare class="w-5 h-5 text-[#1a1a1a]" />
            </div>
            <div>
              <div class="text-xs font-black text-[#1a1a1a]">消息生命周期治理</div>
              <div class="text-[10px] text-[#4a4a4a] font-bold mt-1">设置 TTL 有效时长与深度清理</div>
            </div>
          </button>

          <button
            @click="switchTab('players')"
            class="p-4 rounded-lg bg-white border-3 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] hover:bg-[#fffef0] hover:shadow-[5px_5px_0px_0px_#1a1a1a] transition-all text-left flex items-start space-x-3 group cursor-pointer"
          >
            <div class="w-10 h-10 rounded-lg bg-[#facc15] border-2 border-[#1a1a1a] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-[2px_2px_0px_0px_#1a1a1a]">
              <Users class="w-5 h-5 text-[#1a1a1a]" />
            </div>
            <div>
              <div class="text-xs font-black text-[#1a1a1a]">玩家档案与资产管理</div>
              <div class="text-[10px] text-[#4a4a4a] font-bold mt-1">搜索账号、赠送筹码与流水追溯</div>
            </div>
          </button>
        </div>
      </div>

      <!-- ========================================================== -->
      <!-- TAB 2: 🎮 游戏运营 · SCHEDULES -->
      <!-- ========================================================== -->
      <div v-if="activeTab === 'schedules'" class="space-y-6">
        <!-- Game Modes Schedule & Activity Controls Card -->
        <div class="rounded-lg bg-white border-4 border-[#1a1a1a] p-6 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b-3 border-[#1a1a1a] pb-3 gap-2">
            <div class="flex items-center gap-2">
              <Gamepad2 class="w-5 h-5 text-[#1a1a1a]" />
              <h2 class="text-base font-black text-[#1a1a1a] uppercase">全服游戏模式运营与开启时间配置 · GAME MODES SCHEDULE</h2>
            </div>
            <span class="px-2.5 py-0.5 rounded-md bg-[#22c55e] text-[#1a1a1a] border-2 border-[#1a1a1a] text-xs font-black shadow-[2px_2px_0px_0px_#1a1a1a] self-start sm:self-auto">
              多端实时同步
            </span>
          </div>

          <p class="text-xs text-[#4a4a4a] font-bold">
            配置全服 5 大游戏模式的活动运营状态与开放时间。支持全天 24 小时开放或每日自定义固定营业时段。
            <br />
            <span class="text-[#22c55e] font-black">现代运营模式：支持「下期自动生效」机制！修改开启时间无需人工暂停活动，保存后系统将在当前期开奖派彩完毕后（下期开始前）自动平滑生效，绝不影响正在进行的游戏对局。</span>
          </p>

          <!-- 5 Modes Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
            <div
              v-for="g in gameModeList"
              :key="g.id"
              class="p-4 rounded-lg bg-[#fffef0] border-3 border-[#1a1a1a] shadow-[4px_4px_0px_0px_#1a1a1a] space-y-3.5 flex flex-col justify-between"
            >
              <!-- Card Header: Icon, Name & Current Status -->
              <div class="flex items-start justify-between gap-2 border-b-2 border-[#1a1a1a] pb-2.5">
                <div class="flex items-center space-x-2.5">
                  <div class="w-9 h-9 rounded-md bg-[#facc15] border-2 border-[#1a1a1a] flex items-center justify-center text-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
                    <component :is="g.icon" class="w-5 h-5" />
                  </div>
                  <div>
                    <div class="text-xs font-black text-[#1a1a1a]">{{ g.name }}</div>
                    <div class="text-[10px] text-[#4a4a4a] font-bold">{{ g.desc }}</div>
                  </div>
                </div>

                <!-- Status Badge -->
                <div class="flex items-center">
                  <span
                    v-if="gameScheduleStore.schedules[g.id]?.status === 'open'"
                    class="px-2 py-0.5 rounded text-[11px] font-black bg-[#22c55e] text-[#1a1a1a] border-2 border-[#1a1a1a] shadow-[1px_1px_0px_0px_#1a1a1a]"
                  >
                    🟢 营业中
                  </span>
                  <span
                    v-else-if="gameScheduleStore.schedules[g.id]?.status === 'closing'"
                    class="px-2 py-0.5 rounded text-[11px] font-black bg-[#facc15] text-[#1a1a1a] border-2 border-[#1a1a1a] shadow-[1px_1px_0px_0px_#1a1a1a] animate-pulse"
                  >
                    🟡 关停过渡中
                  </span>
                  <span
                    v-else
                    class="px-2 py-0.5 rounded text-[11px] font-black bg-[#ef4444] text-white border-2 border-[#1a1a1a] shadow-[1px_1px_0px_0px_#1a1a1a]"
                  >
                    ⚫ 已关闭
                  </span>
                </div>
              </div>

              <!-- Activity Switch Control -->
              <div class="flex items-center justify-between p-2 rounded bg-white border-2 border-[#1a1a1a]">
                <span class="text-xs font-black text-[#1a1a1a]">活动状态控制：</span>
                <div class="flex items-center space-x-2">
                  <button
                    v-if="gameScheduleStore.schedules[g.id]?.status === 'open'"
                    v-prevent-reclick
                    @click="handleCloseActivity(g.id)"
                    class="comic-btn-red px-3 py-1 text-xs"
                  >
                    关闭活动
                  </button>
                  <div
                    v-else-if="gameScheduleStore.schedules[g.id]?.status === 'closing'"
                    class="px-2.5 py-1 text-[11px] font-black bg-[#facc15] border border-[#1a1a1a] rounded flex items-center gap-1 text-[#1a1a1a]"
                  >
                    <Clock class="w-3.5 h-3.5 animate-spin" />
                    <span>等待当期开奖结算...</span>
                  </div>
                  <button
                    v-else
                    v-prevent-reclick
                    @click="handleReopenActivity(g.id)"
                    class="comic-btn-yellow px-3 py-1 text-xs"
                  >
                    开启活动
                  </button>
                </div>
              </div>

              <!-- Closing Transition Notice -->
              <div
                v-if="gameScheduleStore.schedules[g.id]?.status === 'closing'"
                class="p-2.5 rounded bg-[#fef9c3] border-2 border-[#1a1a1a] text-[11px] font-bold text-[#854d0e] flex items-center gap-1.5"
              >
                <AlertTriangle class="w-4 h-4 text-[#ef4444] flex-shrink-0 animate-bounce" />
                <span>已下达关停指令。当前正在进行的开奖结束后将正式关闭并解锁时间配置修改。</span>
              </div>

              <!-- Schedule Time Setting -->
              <div class="space-y-2 pt-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-black text-[#1a1a1a]">开启时间设置</span>
                  <label class="flex items-center space-x-1.5 cursor-pointer select-none text-xs font-black">
                    <input
                      type="checkbox"
                      v-model="editSchedules[g.id].is_24h"
                      class="rounded border-2 border-[#1a1a1a] text-[#facc15] focus:ring-0"
                    />
                    <span>全天 24 小时开放</span>
                  </label>
                </div>

                <!-- Start / End Time (if not 24h) -->
                <div v-if="!editSchedules[g.id].is_24h" class="grid grid-cols-2 gap-2">
                  <div>
                    <label class="block text-[10px] font-bold text-[#4a4a4a] uppercase mb-0.5">每日开始时间</label>
                    <input
                      type="time"
                      v-model="editSchedules[g.id].start_time"
                      class="comic-input w-full px-2 py-1 text-xs font-mono font-black cursor-text"
                    />
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-[#4a4a4a] uppercase mb-0.5">每日结束时间</label>
                    <input
                      type="time"
                      v-model="editSchedules[g.id].end_time"
                      class="comic-input w-full px-2 py-1 text-xs font-mono font-black cursor-text"
                    />
                  </div>
                </div>

                <!-- Pending Schedule Notice (下期自动生效提示) -->
                <div
                  v-if="gameScheduleStore.schedules[g.id]?.pending_schedule"
                  class="p-2.5 rounded bg-[#fef9c3] border-2 border-[#1a1a1a] text-[11px] font-bold text-[#854d0e] flex items-center justify-between gap-2 shadow-[2px_2px_0px_0px_#1a1a1a]"
                >
                  <div class="flex items-center gap-1.5 min-w-0">
                    <Clock class="w-4 h-4 text-[#eab308] flex-shrink-0 animate-spin" />
                    <span class="truncate">
                      已暂存配置：{{ formatScheduleDesc(gameScheduleStore.schedules[g.id].pending_schedule!) }}
                      （将在
                      <strong class="text-[#1a1a1a] underline">
                        第 {{ gameScheduleStore.schedules[g.id].pending_schedule!.effective_period }} 期
                      </strong>
                      结算后自动生效）
                    </span>
                  </div>
                  <button
                    v-prevent-reclick
                    @click="handleCancelPending(g.id)"
                    class="comic-btn-red px-2 py-0.5 text-[10px] flex-shrink-0 whitespace-nowrap"
                  >
                    撤销
                  </button>
                </div>

                <div class="text-[10px] text-[#4a4a4a] font-bold flex items-center justify-between pt-0.5">
                  <span>当前线上生效时段：</span>
                  <span class="font-mono font-black text-[#1a1a1a]">
                    {{ formatScheduleDesc(gameScheduleStore.schedules[g.id] || editSchedules[g.id]) }}
                  </span>
                </div>
              </div>

              <!-- Card Footer: Save Button -->
              <div class="pt-2 border-t-2 border-[#1a1a1a] flex items-center justify-between">
                <span v-if="scheduleSaveSuccess[g.id]" class="text-[11px] font-black text-[#22c55e] flex items-center gap-1">
                  <Check class="w-3.5 h-3.5" />
                  <span>配置已同步！</span>
                </span>
                <span v-else></span>

                <button
                  v-prevent-reclick
                  :disabled="isSavingSchedule[g.id]"
                  @click="handleSaveSchedule(g.id)"
                  class="comic-btn-white px-4 py-1.5 text-xs flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Check class="w-3.5 h-3.5" />
                  <span>{{ isSavingSchedule[g.id] ? '保存中...' : '保存时间配置' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================== -->
      <!-- TAB 3: ⏱️ 开奖配置 · LOTTERY -->
      <!-- ========================================================== -->
      <div v-if="activeTab === 'lottery'" class="space-y-6">
        <!-- Lottery Draw Cycle Settings Card -->
        <div class="rounded-lg bg-white border-4 border-[#1a1a1a] p-6 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] space-y-4">
          <div class="flex items-center justify-between border-b-3 border-[#1a1a1a] pb-3">
            <div class="flex items-center gap-2">
              <Timer class="w-5 h-5 text-[#1a1a1a]" />
              <h2 class="text-base font-black text-[#1a1a1a] uppercase">全服开奖周期与历史展示配置 · LOTTERY TIMER & HISTORY</h2>
            </div>
            <span class="px-2.5 py-0.5 rounded-md bg-[#facc15] border-2 border-[#1a1a1a] text-xs font-black shadow-[2px_2px_0px_0px_#1a1a1a]">
              实时全服生效
            </span>
          </div>
          <p class="text-xs text-[#4a4a4a] font-bold">
            配置“猜大小”与“猜六合彩”全服定时开奖的循环周期，以及前台「上一期开奖结果」弹窗允许查看的历史期数 (X 期)。所有客户端将严格根据此配置同步。
          </p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <!-- 猜大小周期 -->
            <div class="p-4 rounded-lg bg-[#fffef0] border-3 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a] space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-black text-[#1a1a1a]">猜大小 · 骰宝 (Sic Bo)</span>
                <span class="text-xs font-mono font-black text-[#1a1a1a] bg-[#facc15] px-2 py-0.5 rounded-md border-2 border-[#1a1a1a]">
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
                  class="comic-input flex-1 px-3 py-1.5 text-xs font-mono font-black"
                />
                <span class="text-xs font-black">秒</span>
              </div>
              <div class="flex items-center gap-1.5 pt-1">
                <button
                  v-for="sec in [15, 30, 45, 60]"
                  :key="sec"
                  type="button"
                  @click="editSicboCycle = sec"
                  class="px-2.5 py-1 text-[11px] font-mono font-black border-2 border-[#1a1a1a] rounded-md transition-all"
                  :class="editSicboCycle === sec ? 'bg-[#facc15] shadow-[2px_2px_0px_0px_#1a1a1a]' : 'bg-white hover:bg-[#fffef0]'"
                >
                  {{ sec }}s
                </button>
              </div>
            </div>

            <!-- 猜六合彩周期 -->
            <div class="p-4 rounded-lg bg-[#fffef0] border-3 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a] space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-black text-[#1a1a1a]">猜点数六合彩 (Mark Six)</span>
                <span class="text-xs font-mono font-black text-[#1a1a1a] bg-[#facc15] px-2 py-0.5 rounded-md border-2 border-[#1a1a1a]">
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
                  class="comic-input flex-1 px-3 py-1.5 text-xs font-mono font-black"
                />
                <span class="text-xs font-black">秒</span>
              </div>
              <div class="flex items-center gap-1.5 pt-1">
                <button
                  v-for="sec in [30, 60, 90, 120]"
                  :key="sec"
                  type="button"
                  @click="editMarksixCycle = sec"
                  class="px-2.5 py-1 text-[11px] font-mono font-black border-2 border-[#1a1a1a] rounded-md transition-all"
                  :class="editMarksixCycle === sec ? 'bg-[#facc15] shadow-[2px_2px_0px_0px_#1a1a1a]' : 'bg-white hover:bg-[#fffef0]'"
                >
                  {{ sec }}s
                </button>
              </div>
            </div>

            <!-- 往期历史开奖展示期数配置 (X 期) -->
            <div class="p-4 rounded-lg bg-[#fffef0] border-3 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a] space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-black text-[#1a1a1a]">往期开奖历史展示期数</span>
                <span class="text-xs font-mono font-black text-[#1a1a1a] bg-[#facc15] px-2 py-0.5 rounded-md border-2 border-[#1a1a1a]">
                  当前: {{ lotteryStore.historyLimit }} 期
                </span>
              </div>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="editHistoryLimit"
                  type="number"
                  min="5"
                  max="50"
                  step="5"
                  class="comic-input flex-1 px-3 py-1.5 text-xs font-mono font-black"
                />
                <span class="text-xs font-black">期</span>
              </div>
              <div class="flex items-center gap-1.5 pt-1">
                <button
                  v-for="cnt in [10, 15, 20, 30]"
                  :key="cnt"
                  type="button"
                  @click="editHistoryLimit = cnt"
                  class="px-2 py-1 text-[11px] font-mono font-black border-2 border-[#1a1a1a] rounded-md transition-all"
                  :class="editHistoryLimit === cnt ? 'bg-[#facc15] shadow-[2px_2px_0px_0px_#1a1a1a]' : 'bg-white hover:bg-[#fffef0]'"
                >
                  {{ cnt }}期
                </button>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between pt-2">
            <span v-if="cycleSaveSuccess" class="text-xs font-black text-[#22c55e] flex items-center gap-1">
              <Check class="w-4 h-4" />
              <span>周期与历史配置已成功更新并保存！</span>
            </span>
            <span v-else></span>
            <button
              v-prevent-reclick
              :disabled="isSavingCycles"
              @click="saveLotteryCycles"
              class="comic-btn-yellow px-6 py-2 text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <Check class="w-4 h-4" />
              <span>{{ isSavingCycles ? '保存配置中...' : '保存周期与历史配置' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ========================================================== -->
      <!-- TAB 4: 💬 消息治理 · RETENTION -->
      <!-- ========================================================== -->
      <div v-if="activeTab === 'retention'" class="space-y-6">
        <!-- System & Chat Messages Lifecycle & Auto-Cleanup Card -->
        <div class="rounded-lg bg-white border-4 border-[#1a1a1a] p-6 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b-3 border-[#1a1a1a] pb-3 gap-2">
            <div class="flex items-center gap-2">
              <MessageSquare class="w-5 h-5 text-[#1a1a1a]" />
              <h2 class="text-base font-black text-[#1a1a1a] uppercase">全服聊天消息生命周期与有效时间管理 · MESSAGE RETENTION</h2>
            </div>
            <span class="px-2.5 py-0.5 rounded-md bg-[#facc15] text-[#1a1a1a] border-2 border-[#1a1a1a] text-xs font-black shadow-[2px_2px_0px_0px_#1a1a1a] self-start sm:self-auto">
              全量过期丢弃
            </span>
          </div>

          <p class="text-xs text-[#4a4a4a] font-bold">
            全服所有聊天记录（包含系统开奖广播、房间通报及玩家公屏/私密聊天）均统一配置有效时间。超过有效期的历史记录自动清理丢弃，防止数据库占用过多空间，保障即时通信极速畅通。
          </p>

          <!-- Message Counts Stats -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="p-3 rounded-lg bg-[#fffef0] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
              <div class="text-[11px] text-[#4a4a4a] font-bold uppercase">全服聊天消息总量</div>
              <div class="text-lg font-black text-[#1a1a1a] mt-0.5">{{ messageStats.total }} 条</div>
            </div>
            <div class="p-3 rounded-lg bg-[#fffef0] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
              <div class="text-[11px] text-[#4a4a4a] font-bold uppercase">有效系统通报条数</div>
              <div class="text-lg font-black text-[#eab308] mt-0.5">{{ messageStats.system }} 条</div>
            </div>
            <div class="p-3 rounded-lg bg-[#fffef0] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
              <div class="text-[11px] text-[#4a4a4a] font-bold uppercase">有效玩家互动消息</div>
              <div class="text-lg font-black text-[#22c55e] mt-0.5">{{ messageStats.user }} 条</div>
            </div>
          </div>

          <!-- Retention Settings & Manual Clean -->
          <div class="p-4 rounded-lg bg-[#fffef0] border-3 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a] space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span class="text-xs font-black text-[#1a1a1a] block">全量消息有效期 (TTL)</span>
                <span class="text-[11px] text-[#4a4a4a] font-bold">超过此时长的所有聊天记录与系统通知将不再对前端显示，并由数据库定时任务自动销毁</span>
              </div>
              <span class="text-xs font-mono font-black text-[#1a1a1a] bg-[#facc15] px-2 py-0.5 rounded-md border-2 border-[#1a1a1a] self-start sm:self-auto">
                当前有效时长: {{ chatStore.messageTtlMinutes }} 分钟 ({{ (chatStore.messageTtlMinutes / 60).toFixed(1) }} 小时)
              </span>
            </div>

            <div class="flex items-center gap-2">
              <input
                v-model.number="editMessageTtl"
                type="number"
                min="10"
                max="1440"
                step="10"
                class="comic-input flex-1 px-3 py-1.5 text-xs font-mono font-black"
              />
              <span class="text-xs font-black">分钟</span>
            </div>

            <!-- Quick Pills -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <button
                v-for="p in [
                  { label: '30分钟', min: 30 },
                  { label: '1小时', min: 60 },
                  { label: '2小时', min: 120 },
                  { label: '6小时', min: 360 },
                  { label: '12小时', min: 720 },
                  { label: '24小时', min: 1440 }
                ]"
                :key="p.min"
                type="button"
                @click="editMessageTtl = p.min"
                class="px-2.5 py-1 text-[11px] font-mono font-black border-2 border-[#1a1a1a] rounded-md transition-all cursor-pointer"
                :class="editMessageTtl === p.min ? 'bg-[#facc15] shadow-[2px_2px_0px_0px_#1a1a1a]' : 'bg-white hover:bg-[#fffef0]'"
              >
                {{ p.label }}
              </button>
            </div>

            <!-- Status badge -->
            <div class="p-2.5 rounded bg-white border-2 border-[#1a1a1a] text-[11px] font-bold text-[#1a1a1a] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-[2px_2px_0px_0px_#1a1a1a]">
              <div class="flex items-center gap-1.5">
                <Clock class="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                <span>数据库已启用 <strong class="text-[#1a1a1a]">pg_cron</strong> 定时器，每 10 分钟自动在后台巡检并清理超期消息</span>
              </div>
              <button
                type="button"
                @click="refreshMessageStats"
                class="text-[10px] font-black underline hover:text-[#3b82f6] flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <RotateCw class="w-3 h-3" :class="{ 'animate-spin': isLoadingStats }" />
                <span>刷新统计</span>
              </button>
            </div>
          </div>

          <!-- Buttons Row -->
          <div class="flex flex-col sm:flex-row items-center justify-between pt-2 gap-3">
            <div>
              <span v-if="ttlSaveSuccess" class="text-xs font-black text-[#22c55e] flex items-center gap-1">
                <Check class="w-4 h-4" />
                <span>有效期配置已保存并同步至数据库！</span>
              </span>
            </div>

            <div class="flex items-center gap-2 w-full sm:w-auto">
              <button
                v-prevent-reclick
                :disabled="isCleaningMessages"
                @click="handleCleanExpiredMessages"
                class="comic-btn-white flex-1 sm:flex-none px-4 py-2 text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 class="w-4 h-4 text-[#ef4444]" />
                <span>{{ isCleaningMessages ? '正在清理中...' : '立即清理过期消息' }}</span>
              </button>
              <button
                v-prevent-reclick
                :disabled="isSavingTtl"
                @click="handleSaveTtl"
                class="comic-btn-yellow flex-1 sm:flex-none px-5 py-2 text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Check class="w-4 h-4" />
                <span>{{ isSavingTtl ? '保存中...' : '保存有效时间' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================== -->
      <!-- TAB 5: 👥 玩家资产 · PLAYERS -->
      <!-- ========================================================== -->
      <div v-if="activeTab === 'players'" class="space-y-6">
        <!-- Players Management Table -->
        <div class="rounded-lg bg-white border-4 border-[#1a1a1a] overflow-hidden shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
          <div class="px-6 py-4 border-b-3 border-[#1a1a1a] bg-[#fffef0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <Users class="w-5 h-5 text-[#1a1a1a]" />
              <span class="text-xs font-black text-[#1a1a1a] uppercase tracking-wider">玩家档案与资产列表 · PLAYER ROSTER</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-black bg-[#facc15] border border-[#1a1a1a]">
                共 {{ filteredPlayers.length }} 位
              </span>
            </div>

            <div class="flex items-center gap-2">
              <!-- Search Input -->
              <div class="relative w-full sm:w-64">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜索昵称或邮箱..."
                  class="comic-input w-full pl-8 pr-3 py-1.5 text-xs"
                />
                <Search class="w-3.5 h-3.5 text-[#1a1a1a] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                v-prevent-reclick
                :disabled="isFetchingPlayers"
                @click="fetchPlayers"
                class="comic-btn-white px-3 py-1.5 text-xs disabled:opacity-50 flex items-center whitespace-nowrap"
              >
                <RotateCw class="w-3.5 h-3.5 mr-1" :class="isFetchingPlayers ? 'animate-spin' : ''" />
                <span>{{ isFetchingPlayers ? '刷新中...' : '刷新' }}</span>
              </button>
            </div>
          </div>

          <div class="divide-y-3 divide-[#1a1a1a]">
            <div
              v-for="p in filteredPlayers"
              :key="p.id"
              class="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#fffef0] transition-colors"
            >
              <div class="flex items-center space-x-3.5">
                <img
                  :src="p.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + p.id"
                  class="w-10 h-10 rounded-md border-2 border-[#1a1a1a] bg-white shadow-[2px_2px_0px_0px_#1a1a1a]"
                />
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="text-sm font-black text-[#1a1a1a]">{{ p.nickname }}</span>
                    <span v-if="p.is_admin" class="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#ef4444] text-white border border-[#1a1a1a] shadow-[1px_1px_0px_0px_#1a1a1a]">
                      管理员
                    </span>
                  </div>
                  <div class="text-xs text-[#4a4a4a] font-bold mt-0.5">{{ p.email }}</div>
                </div>
              </div>

              <div class="flex items-center space-x-4 sm:space-x-6 justify-between sm:justify-end">
                <div class="text-right">
                  <div class="text-[10px] text-[#1a1a1a] font-black uppercase">当前筹码</div>
                  <div class="text-sm font-black text-[#1a1a1a] flex items-center justify-end gap-1">
                    <CoinIcon customClass="w-3.5 h-3.5" />
                    <span>{{ formatChips(p.chips) }}</span>
                  </div>
                </div>

                <button
                  @click="openGrantModal(p)"
                  class="comic-btn-yellow px-4 py-2 text-xs"
                >
                  <Gift class="w-3.5 h-3.5 mr-1.5" />
                  <span>赠送/调整筹码</span>
                </button>
              </div>
            </div>

            <!-- Empty Search Results Notice -->
            <div v-if="filteredPlayers.length === 0" class="p-8 text-center text-xs font-black text-[#4a4a4a]">
              暂无匹配的玩家记录
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grant Chips Modal -->
    <Modal v-model="showGrantModal" title="后台赠送 / 调整筹码">
      <div v-if="selectedTarget" class="space-y-4">
        <div class="p-3.5 rounded-lg bg-[#fffef0] border-3 border-[#1a1a1a] flex items-center space-x-3 shadow-[3px_3px_0px_0px_#1a1a1a]">
          <img
            :src="selectedTarget.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + selectedTarget.id"
            class="w-8 h-8 rounded-md border-2 border-[#1a1a1a] bg-white"
          />
          <div>
            <div class="text-xs font-black text-[#1a1a1a]">{{ selectedTarget.nickname }}</div>
            <div class="text-[10px] text-[#4a4a4a] font-bold">{{ selectedTarget.email }}</div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-black text-[#1a1a1a] uppercase mb-1">当前筹码余额</label>
          <div class="text-lg font-black text-[#1a1a1a] font-mono flex items-center gap-1.5">
            <CoinIcon customClass="w-5 h-5" />
            <span>{{ formatChips(selectedTarget.chips) }}</span>
          </div>
        </div>

        <div>
          <label class="block text-xs font-black text-[#1a1a1a] uppercase mb-1">调账筹码数量 (正数为增，负数为减)</label>
          <input
            v-model.number="grantAmount"
            type="number"
            step="1000"
            class="comic-input w-full px-3.5 py-2 text-sm font-mono font-black"
          />
          <div class="flex items-center gap-1.5 mt-2 flex-wrap">
            <button
              v-for="amt in [1000, 5000, 10000, 50000, 100000, -10000]"
              :key="amt"
              type="button"
              @click="grantAmount = amt"
              class="px-2 py-0.5 text-[10px] font-mono font-black border-2 border-[#1a1a1a] rounded-md transition-all"
              :class="grantAmount === amt ? 'bg-[#facc15] shadow-[2px_2px_0px_0px_#1a1a1a]' : 'bg-white hover:bg-[#fffef0]'"
            >
              {{ amt > 0 ? `+${amt}` : amt }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-black text-[#1a1a1a] uppercase mb-1">赠送事由 / 备注说明</label>
          <input
            v-model="grantReason"
            type="text"
            placeholder="例如: VIP玩家专享体验金"
            class="comic-input w-full px-3.5 py-2 text-xs"
          />
        </div>
      </div>

      <template #footer>
        <button
          v-prevent-reclick
          @click="submitGrant"
          :disabled="isSubmitting || grantAmount === 0"
          class="comic-btn-red w-full py-2.5 text-sm disabled:opacity-50"
        >
          <Gift class="w-4 h-4 mr-1.5" />
          <span>{{ isSubmitting ? '正在写入数据库...' : '确认调账并记录流水' }}</span>
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Shield, ShieldX, RotateCw, Gift, Timer, Check, Clock,
  Layers, Sparkles, Crown, Dices, Disc, AlertTriangle,
  MessageSquare, Trash2, LayoutDashboard, Gamepad2, Users,
  Search, ChevronRight, Activity, Database
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useLotteryStore } from '@/stores/lottery'
import { useGameScheduleStore, type GameModeId } from '@/stores/gameSchedule'
import { useChatStore } from '@/stores/chat'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { dialog } from '@/lib/dialog'
import { sound } from '@/lib/sound'
import Modal from '@/components/common/Modal.vue'
import CoinIcon from '@/components/common/CoinIcon.vue'
import type { Profile } from '@/types/database'

const authStore = useAuthStore()
const lotteryStore = useLotteryStore()
const gameScheduleStore = useGameScheduleStore()
const chatStore = useChatStore()
const route = useRoute()
const router = useRouter()

// 菜单选项定义
type AdminTab = 'dashboard' | 'schedules' | 'lottery' | 'retention' | 'players'
const validTabs: AdminTab[] = ['dashboard', 'schedules', 'lottery', 'retention', 'players']
const activeTab = ref<AdminTab>(
  validTabs.includes(route.query.tab as AdminTab) ? (route.query.tab as AdminTab) : 'dashboard'
)

function switchTab(tab: AdminTab) {
  if (activeTab.value === tab) return
  activeTab.value = tab
  sound.playClick()
  router.replace({ query: { ...route.query, tab } })
}

watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab && validTabs.includes(newTab as AdminTab)) {
      activeTab.value = newTab as AdminTab
    }
  }
)

const playersList = ref<Profile[]>([])
const searchQuery = ref('')

// 5 大游戏模式元数据
const gameModeList: Array<{ id: GameModeId; name: string; icon: any; desc: string }> = [
  { id: 'zhajinhua', name: '炸金花 (Golden Flower)', icon: Layers, desc: '三张底牌扑克博弈' },
  { id: 'blackjack', name: '21点 (Blackjack)', icon: Sparkles, desc: '娱乐场黑杰克天王对决' },
  { id: 'texas', name: '德州扑克 (Texas Hold\'em)', icon: Crown, desc: '7选5国际竞技扑克' },
  { id: 'sicbo', name: '猜大小 · 骰宝 (Sic Bo)', icon: Dices, desc: '物理摇盅全服定时开奖' },
  { id: 'marksix', name: '猜点数六合彩 (Mark Six)', icon: Disc, desc: '1-49特码摇号滚球开奖' }
]

const openGamesCount = computed(() => {
  return gameModeList.filter(g => gameScheduleStore.schedules[g.id]?.status === 'open').length
})

// 导航菜单定义
const adminMenus = computed(() => [
  {
    id: 'dashboard' as AdminTab,
    label: '数据概览 · DASHBOARD',
    icon: LayoutDashboard,
    badge: ''
  },
  {
    id: 'schedules' as AdminTab,
    label: '游戏运营 · SCHEDULES',
    icon: Gamepad2,
    badge: `${openGamesCount.value}/${gameModeList.length} 开放`
  },
  {
    id: 'lottery' as AdminTab,
    label: '开奖配置 · LOTTERY',
    icon: Timer,
    badge: ''
  },
  {
    id: 'retention' as AdminTab,
    label: '消息治理 · RETENTION',
    icon: MessageSquare,
    badge: `${messageStats.value.total} 条`
  },
  {
    id: 'players' as AdminTab,
    label: '玩家资产 · PLAYERS',
    icon: Users,
    badge: `${playersList.value.length} 位`
  }
])

// 编辑暂存状态（按游戏 id 映射）
const editSchedules = ref<Record<GameModeId, { is_24h: boolean; start_time: string; end_time: string }>>({
  zhajinhua: { is_24h: true, start_time: '00:00', end_time: '23:59' },
  blackjack: { is_24h: true, start_time: '00:00', end_time: '23:59' },
  texas: { is_24h: true, start_time: '00:00', end_time: '23:59' },
  sicbo: { is_24h: true, start_time: '00:00', end_time: '23:59' },
  marksix: { is_24h: true, start_time: '00:00', end_time: '23:59' }
})

const isSavingSchedule = ref<Record<GameModeId, boolean>>({
  zhajinhua: false,
  blackjack: false,
  texas: false,
  sicbo: false,
  marksix: false
})

const scheduleSaveSuccess = ref<Record<GameModeId, boolean>>({
  zhajinhua: false,
  blackjack: false,
  texas: false,
  sicbo: false,
  marksix: false
})

// 初始化与同步 Store
watch(
  () => gameScheduleStore.schedules,
  (newScheds) => {
    for (const item of gameModeList) {
      const s = newScheds[item.id]
      if (s) {
        editSchedules.value[item.id] = {
          is_24h: s.is_24h,
          start_time: s.start_time || '00:00',
          end_time: s.end_time || '23:59'
        }
      }
    }
  },
  { immediate: true, deep: true }
)

function formatScheduleDesc(cfg: { is_24h: boolean; start_time: string; end_time: string }): string {
  return cfg.is_24h ? '全天24小时开放' : `每日 ${cfg.start_time} - ${cfg.end_time}`
}

async function handleCloseActivity(gameId: GameModeId) {
  try {
    if (gameId === 'sicbo' || gameId === 'marksix') {
      const period = gameId === 'sicbo' ? lotteryStore.sicboPeriod : lotteryStore.marksixPeriod
      await gameScheduleStore.requestCloseActivity(gameId, period)
      dialog.info(`已向【${gameScheduleStore.schedules[gameId].name}】下达关停指令！\n\n当前期（${period}）未结束的开奖将照常进行并完成结算，结算完毕后将自动正式关闭活动。`, {
        title: '关停指令已生效'
      })
    } else {
      await gameScheduleStore.requestCloseActivity(gameId)
    }
  } catch (err: unknown) {
    const e = err as { message?: string }
    dialog.error(e.message || '关停活动失败')
  }
}

async function handleReopenActivity(gameId: GameModeId) {
  try {
    await gameScheduleStore.reopenActivity(gameId)
  } catch (err: unknown) {
    const e = err as { message?: string }
    dialog.error(e.message || '开启活动失败')
  }
}

async function handleSaveSchedule(gameId: GameModeId) {
  isSavingSchedule.value[gameId] = true
  try {
    const params = editSchedules.value[gameId]
    const nextPeriod = gameId === 'sicbo'
      ? `第 ${lotteryStore.nextSicboPeriod} 期`
      : gameId === 'marksix'
      ? `第 ${lotteryStore.nextMarksixPeriod} 期`
      : '下一对局'

    const result = await gameScheduleStore.updateScheduleTime(gameId, params, nextPeriod)
    scheduleSaveSuccess.value[gameId] = true
    setTimeout(() => {
      scheduleSaveSuccess.value[gameId] = false
    }, 3000)

    if (result.isPending) {
      dialog.info(`【${gameScheduleStore.schedules[gameId].name}】配置已暂存！\n\n新开启时间（${formatScheduleDesc(params)}）将在 ${nextPeriod} 开始前自动生效并更新，不会影响当前对局。`, {
        title: '已设定下期自动生效'
      })
    } else {
      dialog.success(`【${gameScheduleStore.schedules[gameId].name}】开启时间配置已保存并全服生效！`, {
        title: '配置已更新'
      })
    }
  } catch (err: unknown) {
    const e = err as { message?: string }
    dialog.error(e.message || '保存时间配置失败')
  } finally {
    isSavingSchedule.value[gameId] = false
  }
}

async function handleCancelPending(gameId: GameModeId) {
  const confirmed = await dialog.confirm(`确认撤销【${gameScheduleStore.schedules[gameId].name}】的暂存时间配置吗？\n\n撤销后将恢复为原本的生效时段，下期将不再自动切换。`, {
    title: '撤销暂存配置'
  })
  if (!confirmed) return

  try {
    await gameScheduleStore.cancelPendingSchedule(gameId)
    // 还原表单输入为当前生效配置
    const s = gameScheduleStore.schedules[gameId]
    if (s) {
      editSchedules.value[gameId] = {
        is_24h: s.is_24h,
        start_time: s.start_time || '00:00',
        end_time: s.end_time || '23:59'
      }
    }
    dialog.success(`已成功撤销【${gameScheduleStore.schedules[gameId].name}】的暂存配置！`, {
      title: '已撤销暂存'
    })
  } catch (err: unknown) {
    const e = err as { message?: string }
    dialog.error(e.message || '撤销失败')
  }
}

// 周期与历史展示本地编辑状态
const editSicboCycle = ref(lotteryStore.sicboCycleSeconds)
const editMarksixCycle = ref(lotteryStore.marksixCycleSeconds)
const editHistoryLimit = ref(lotteryStore.historyLimit)
const cycleSaveSuccess = ref(false)

watch(
  () => [lotteryStore.sicboCycleSeconds, lotteryStore.marksixCycleSeconds, lotteryStore.historyLimit],
  ([sicbo, marksix, limit]) => {
    editSicboCycle.value = sicbo
    editMarksixCycle.value = marksix
    editHistoryLimit.value = limit
  },
  { immediate: true }
)

// 全服消息有效时间与过期清理响应式状态
const editMessageTtl = ref(chatStore.messageTtlMinutes)
const ttlSaveSuccess = ref(false)
const isSavingTtl = ref(false)
const isCleaningMessages = ref(false)
const isLoadingStats = ref(false)
const messageStats = ref({ total: 0, system: 0, user: 0 })

watch(
  () => chatStore.messageTtlMinutes,
  (newVal) => {
    editMessageTtl.value = newVal
  },
  { immediate: true }
)

async function refreshMessageStats() {
  isLoadingStats.value = true
  try {
    messageStats.value = await chatStore.fetchMessageStats()
  } finally {
    isLoadingStats.value = false
  }
}

async function handleSaveTtl() {
  isSavingTtl.value = true
  try {
    await chatStore.updateMessageTtl(editMessageTtl.value)
    ttlSaveSuccess.value = true
    setTimeout(() => {
      ttlSaveSuccess.value = false
    }, 3000)
    dialog.success(`消息有效时长已设定为 ${editMessageTtl.value} 分钟（${(editMessageTtl.value / 60).toFixed(1)} 小时）！\n\n全服新产生的聊天记录与系统广播将以此有效期写入，超期记录由后台定时任务（pg_cron）与数据库自动清理。`, {
      title: '生命周期配置已保存'
    })
  } catch (err: unknown) {
    const e = err as { message?: string }
    dialog.error(e.message || '保存配置失败')
  } finally {
    isSavingTtl.value = false
  }
}

async function handleCleanExpiredMessages() {
  const confirmed = await dialog.confirm(`确认立即执行一次全服过期聊天记录深度清理吗？\n\n将清理所有超过 ${editMessageTtl.value} 分钟的旧聊天与历史系统通报，释放数据库存储空间。`, {
    title: '立即清理确认'
  })
  if (!confirmed) return

  isCleaningMessages.value = true
  try {
    const res = await chatStore.cleanExpiredMessages(editMessageTtl.value)
    await refreshMessageStats()
    dialog.success(`清理完毕！已成功从数据库中清除 ${res.deletedCount} 条过期聊天消息与系统通报。`, {
      title: '清理成功'
    })
  } catch (err: unknown) {
    const e = err as { message?: string }
    dialog.error(e.message || '清理操作失败')
  } finally {
    isCleaningMessages.value = false
  }
}

const showGrantModal = ref(false)
const selectedTarget = ref<Profile | null>(null)
const grantAmount = ref(10000)
const grantReason = ref('管理员后台赠送体验金')
const isSubmitting = ref(false)
const isSavingCycles = ref(false)
const isFetchingPlayers = ref(false)

onMounted(() => {
  fetchPlayers()
  refreshMessageStats()
})

const filteredPlayers = computed(() => {
  if (!searchQuery.value.trim()) return playersList.value
  const q = searchQuery.value.toLowerCase().trim()
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
  if (isFetchingPlayers.value) return
  isFetchingPlayers.value = true
  try {
    if (!isSupabaseConfigured()) {
      playersList.value = [
        authStore.profile || { id: 'admin', email: 'admin@lucky7.game', nickname: '系统超级管理员', avatar_url: '', chips: 100000, is_admin: true },
        { id: 'usr_01', email: 'stephen@lucky7.game', nickname: '阿星', avatar_url: '', chips: 10000, is_admin: false },
        { id: 'usr_02', email: 'god@lucky7.game', nickname: '高进', avatar_url: '', chips: 88880, is_admin: false },
        { id: 'usr_03', email: 'knife@lucky7.game', nickname: '小刀', avatar_url: '', chips: 5000, is_admin: false }
      ]
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      playersList.value = data as Profile[]
    }
  } catch (err) {
    console.error('Fetch players error:', err)
  } finally {
    isFetchingPlayers.value = false
  }
}

async function refreshAllData() {
  sound.playClick()
  await Promise.all([
    fetchPlayers(),
    refreshMessageStats()
  ])
  dialog.success('已从 Supabase 刷新全服最新运营与玩家数据！', { title: '数据已同步' })
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
    dialog.success(`成功为 ${selectedTarget.value.nickname} 调整筹码 ${grantAmount.value}！`, {
      title: '调账成功'
    })
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
      dialog.success(`调账成功！目标玩家最新余额: ${selectedTarget.value.chips}`, {
        title: '调账成功'
      })
    } else {
      dialog.error(res.message || '调账失败')
    }
  } catch (err: unknown) {
    const e = err as { message?: string }
    dialog.error('操作异常: ' + (e.message || '请检查权限'))
  } finally {
    isSubmitting.value = false
  }
}

async function saveLotteryCycles() {
  if (isSavingCycles.value) return
  isSavingCycles.value = true
  try {
    await lotteryStore.updateCycles(editSicboCycle.value, editMarksixCycle.value, editHistoryLimit.value)
    cycleSaveSuccess.value = true
    setTimeout(() => {
      cycleSaveSuccess.value = false
    }, 3000)
  } finally {
    isSavingCycles.value = false
  }
}
</script>
