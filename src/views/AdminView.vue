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
          <h1 class="text-3xl font-black text-[#1a1a1a] uppercase flex items-center gap-2">
            <Shield class="w-8 h-8 text-[#1a1a1a]" />
            <span>系统管理控制台 · SUPER ADMIN</span>
            <span class="px-2.5 py-0.5 rounded-md bg-[#ef4444] text-white border-2 border-[#1a1a1a] text-xs font-black shadow-[2px_2px_0px_0px_#1a1a1a]">
              AUTHORIZED
            </span>
          </h1>
          <p class="text-xs text-[#4a4a4a] font-bold mt-1">支持全服玩家资产调账、赠送筹码与开奖周期调度</p>
        </div>

        <!-- Search Input -->
        <div class="w-full sm:w-72">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索玩家昵称或邮箱..."
            class="comic-input w-full px-3.5 py-2 text-xs"
          />
        </div>
      </div>

      <!-- Quick Metrics Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-5 rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <div class="text-xs text-[#1a1a1a] font-black uppercase">注册玩家总数</div>
          <div class="text-2xl font-black text-[#1a1a1a] mt-1">{{ playersList.length }} 位</div>
        </div>
        <div class="p-5 rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <div class="text-xs text-[#1a1a1a] font-black uppercase">全服流通虚拟币</div>
          <div class="text-2xl font-black text-[#1a1a1a] mt-1 flex items-center gap-1.5">
            <CoinIcon customClass="w-6 h-6" />
            <span>{{ totalCirculatingChips }}</span>
          </div>
        </div>
        <div class="p-5 rounded-lg bg-[#fffef0] border-4 border-[#1a1a1a] shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <div class="text-xs text-[#1a1a1a] font-black uppercase">管理操作模式</div>
          <div class="text-base font-black text-[#22c55e] mt-2 flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[#22c55e] border-2 border-[#1a1a1a]"></span>
            <span>数据库原子 RPC 事务</span>
          </div>
        </div>
      </div>

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

      <!-- Game Modes Schedule & Activity Controls Card -->
      <div class="rounded-lg bg-white border-4 border-[#1a1a1a] p-6 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b-3 border-[#1a1a1a] pb-3 gap-2">
          <div class="flex items-center gap-2">
            <Timer class="w-5 h-5 text-[#1a1a1a]" />
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
                    已暂存新时段 ({{ formatScheduleDesc(gameScheduleStore.schedules[g.id]?.pending_schedule!) }})，将于【{{ gameScheduleStore.schedules[g.id]?.pending_schedule?.effective_period }}】自动生效
                  </span>
                </div>
                <button
                  v-prevent-reclick
                  @click="handleCancelPending(g.id)"
                  class="px-2 py-0.5 text-[10px] font-black bg-white border border-[#1a1a1a] rounded hover:bg-gray-100 flex-shrink-0 shadow-[1px_1px_0px_0px_#1a1a1a]"
                  title="撤销该暂存配置"
                >
                  撤销
                </button>
              </div>
            </div>

            <!-- Save Button Row -->
            <div class="flex items-center justify-between pt-2 border-t-2 border-[#1a1a1a]">
              <span v-if="scheduleSaveSuccess[g.id]" class="text-[11px] font-black text-[#22c55e] flex items-center gap-1">
                <Check class="w-3.5 h-3.5" />
                <span>配置已保存！</span>
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

      <!-- System Messages Lifecycle & Auto-Cleanup Card -->
      <div class="rounded-lg bg-white border-4 border-[#1a1a1a] p-6 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b-3 border-[#1a1a1a] pb-3 gap-2">
          <div class="flex items-center gap-2">
            <MessageSquare class="w-5 h-5 text-[#1a1a1a]" />
            <h2 class="text-base font-black text-[#1a1a1a] uppercase">系统消息生命周期与有效时间管理 · MESSAGE RETENTION</h2>
          </div>
          <span class="px-2.5 py-0.5 rounded-md bg-[#facc15] text-[#1a1a1a] border-2 border-[#1a1a1a] text-xs font-black shadow-[2px_2px_0px_0px_#1a1a1a] self-start sm:self-auto">
            自动过期丢弃
          </span>
        </div>

        <p class="text-xs text-[#4a4a4a] font-bold">
          针对猜大小、六合彩高频定时开奖及房间动作产生的大量系统通报消息设置有效期。超期系统记录自动清理，防止数据库存储过多无用数据；玩家私人与公屏真实聊天不受影响，永久留存。
        </p>

        <!-- Message Counts Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="p-3 rounded-lg bg-[#fffef0] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
            <div class="text-[11px] text-[#4a4a4a] font-bold uppercase">全服聊天消息总量</div>
            <div class="text-lg font-black text-[#1a1a1a] mt-0.5">{{ messageStats.total }} 条</div>
          </div>
          <div class="p-3 rounded-lg bg-[#fffef0] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
            <div class="text-[11px] text-[#4a4a4a] font-bold uppercase">存活系统通报条数</div>
            <div class="text-lg font-black text-[#eab308] mt-0.5">{{ messageStats.system }} 条</div>
          </div>
          <div class="p-3 rounded-lg bg-[#fffef0] border-2 border-[#1a1a1a] shadow-[2px_2px_0px_0px_#1a1a1a]">
            <div class="text-[11px] text-[#4a4a4a] font-bold uppercase">玩家真实互动消息</div>
            <div class="text-lg font-black text-[#22c55e] mt-0.5">{{ messageStats.user }} 条</div>
          </div>
        </div>

        <!-- Retention Settings & Manual Clean -->
        <div class="p-4 rounded-lg bg-[#fffef0] border-3 border-[#1a1a1a] shadow-[3px_3px_0px_0px_#1a1a1a] space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span class="text-xs font-black text-[#1a1a1a] block">系统消息有效期 (TTL)</span>
              <span class="text-[11px] text-[#4a4a4a] font-bold">超过此时长的系统开奖通知将不再对前端可见，并由后台自动销毁</span>
            </div>
            <span class="text-xs font-mono font-black text-[#1a1a1a] bg-[#facc15] px-2 py-0.5 rounded-md border-2 border-[#1a1a1a] self-start sm:self-auto">
              当前有效时长: {{ chatStore.systemTtlMinutes }} 分钟 ({{ (chatStore.systemTtlMinutes / 60).toFixed(1) }} 小时)
            </span>
          </div>

          <div class="flex items-center gap-2">
            <input
              v-model.number="editSystemTtl"
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
              @click="editSystemTtl = p.min"
              class="px-2.5 py-1 text-[11px] font-mono font-black border-2 border-[#1a1a1a] rounded-md transition-all"
              :class="editSystemTtl === p.min ? 'bg-[#facc15] shadow-[2px_2px_0px_0px_#1a1a1a]' : 'bg-white hover:bg-[#fffef0]'"
            >
              {{ p.label }}
            </button>
          </div>

          <!-- Status badge -->
          <div class="p-2.5 rounded bg-white border-2 border-[#1a1a1a] text-[11px] font-bold text-[#1a1a1a] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-[2px_2px_0px_0px_#1a1a1a]">
            <div class="flex items-center gap-1.5">
              <Clock class="w-4 h-4 text-[#22c55e] flex-shrink-0" />
              <span>数据库已启用 <strong class="text-[#1a1a1a]">pg_cron</strong> 定时器，每 10 分钟自动在后台巡检并清理超时废弃记录</span>
            </div>
            <button
              type="button"
              @click="refreshMessageStats"
              class="text-[10px] font-black underline hover:text-[#3b82f6] flex items-center gap-1 self-start sm:self-auto"
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

      <!-- Players Management Table -->
      <div class="rounded-lg bg-white border-4 border-[#1a1a1a] overflow-hidden shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
        <div class="px-6 py-4 border-b-3 border-[#1a1a1a] bg-[#fffef0] flex items-center justify-between">
          <span class="text-xs font-black text-[#1a1a1a] uppercase tracking-wider">玩家档案与资产列表 · PLAYER ROSTER</span>
          <button
            v-prevent-reclick
            :disabled="isFetchingPlayers"
            @click="fetchPlayers"
            class="comic-btn-white px-3 py-1 text-xs disabled:opacity-50"
          >
            <RotateCw class="w-3.5 h-3.5 mr-1" :class="isFetchingPlayers ? 'animate-spin' : ''" />
            <span>{{ isFetchingPlayers ? '刷新中...' : '刷新列表' }}</span>
          </button>
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
            <div class="text-xs font-black text-[#1a1a1a]">{{ selectedTarget.nickname }} ({{ selectedTarget.email }})</div>
            <div class="text-xs text-[#1a1a1a] font-black flex items-center gap-1 mt-0.5">
              <span>现存余额: {{ formatChips(selectedTarget.chips) }}</span>
              <CoinIcon customClass="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-black text-[#1a1a1a] uppercase mb-1">调整额度 (正数为赠送，负数为划扣)</label>
          <input
            v-model.number="grantAmount"
            type="number"
            step="1000"
            class="comic-input w-full px-3.5 py-2.5 text-sm font-black"
          />
        </div>

        <!-- Quick Amount Pills -->
        <div class="flex items-center space-x-2 flex-wrap gap-y-1.5">
          <button
            v-for="amt in [5000, 10000, 50000, 100000]"
            :key="amt"
            type="button"
            @click="grantAmount = amt"
            class="comic-btn-white px-3 py-1 text-xs font-mono font-bold"
          >
            +{{ amt / 1000 }}k
          </button>
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
import {
  Shield, ShieldX, RotateCw, Gift, Timer, Check, Clock,
  Layers, Sparkles, Crown, Dices, Disc, AlertTriangle,
  MessageSquare, Trash2
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useLotteryStore } from '@/stores/lottery'
import { useGameScheduleStore, type GameModeId } from '@/stores/gameSchedule'
import { useChatStore } from '@/stores/chat'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { dialog } from '@/lib/dialog'
import Modal from '@/components/common/Modal.vue'
import CoinIcon from '@/components/common/CoinIcon.vue'
import type { Profile } from '@/types/database'

const authStore = useAuthStore()
const lotteryStore = useLotteryStore()
const gameScheduleStore = useGameScheduleStore()
const chatStore = useChatStore()
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
      : undefined

    const res = await gameScheduleStore.updateScheduleTime(gameId, params, nextPeriod)
    scheduleSaveSuccess.value[gameId] = true
    setTimeout(() => {
      scheduleSaveSuccess.value[gameId] = false
    }, 3000)

    if (res.isPending) {
      dialog.info(`【${gameScheduleStore.schedules[gameId].name}】新开启时段配置已成功暂存！\n\n当前期正在开奖进行中，新时段将于【${res.effectivePeriod}】开奖派彩完毕后（下期开始）自动平滑生效，无需手动关闭活动。`, {
        title: '配置已暂存 (下期生效)'
      })
    }
  } catch (err: unknown) {
    const e = err as { message?: string }
    dialog.error(e.message || '保存失败')
  } finally {
    isSavingSchedule.value[gameId] = false
  }
}

async function handleCancelPending(gameId: GameModeId) {
  const gName = gameScheduleStore.schedules[gameId]?.name || gameId
  const confirmed = await dialog.confirm(`确认撤销【${gName}】待生效的新开启时段配置吗？`, {
    title: '撤销确认'
  })
  if (confirmed) {
    await gameScheduleStore.cancelPendingSchedule(gameId)
  }
}

// 开奖周期与历史展示期数配置响应式编辑状态（自动与 Store 保持双向秒级同步，免去刷新）
const editSicboCycle = ref(lotteryStore.sicboCycleSeconds)
const editMarksixCycle = ref(lotteryStore.marksixCycleSeconds)
const editHistoryLimit = ref(lotteryStore.historyLimit)
const cycleSaveSuccess = ref(false)

watch(
  () => lotteryStore.sicboCycleSeconds,
  (newVal) => {
    editSicboCycle.value = newVal
  },
  { immediate: true }
)

watch(
  () => lotteryStore.marksixCycleSeconds,
  (newVal) => {
    editMarksixCycle.value = newVal
  },
  { immediate: true }
)

watch(
  () => lotteryStore.historyLimit,
  (newVal) => {
    editHistoryLimit.value = newVal
  },
  { immediate: true }
)

// 系统消息有效时间与过期清理响应式状态
const editSystemTtl = ref(chatStore.systemTtlMinutes)
const ttlSaveSuccess = ref(false)
const isSavingTtl = ref(false)
const isCleaningMessages = ref(false)
const isLoadingStats = ref(false)
const messageStats = ref({ total: 0, system: 0, user: 0 })

watch(
  () => chatStore.systemTtlMinutes,
  (newVal) => {
    editSystemTtl.value = newVal
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
    await chatStore.updateSystemTtl(editSystemTtl.value)
    ttlSaveSuccess.value = true
    setTimeout(() => {
      ttlSaveSuccess.value = false
    }, 3000)
    dialog.success(`系统消息有效时长已设定为 ${editSystemTtl.value} 分钟（${(editSystemTtl.value / 60).toFixed(1)} 小时）！\n\n新产生的系统通报将以此有效期写入，超期记录由后台定时器（pg_cron）与数据库触发器自动清理。`, {
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
  const confirmed = await dialog.confirm(`确认立即执行一次全服过期系统消息深度清理吗？\n\n将清理所有超过 ${editSystemTtl.value} 分钟的旧系统通报（玩家真实聊天消息永久保留）。`, {
    title: '立即清理确认'
  })
  if (!confirmed) return

  isCleaningMessages.value = true
  try {
    const res = await chatStore.cleanExpiredMessages(editSystemTtl.value)
    await refreshMessageStats()
    dialog.success(`清理完毕！已成功从数据库中清除 ${res.deletedCount} 条过期系统消息。`, {
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
  const q = searchQuery.value.toLowerCase()
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
      // 演示模式提供测试玩家列表
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
