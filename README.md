# Lucky 7 - 热门玩法综合竞技平台 (Arcade Hub)

本项目基于 **Vite + Vue 3 (Composition API) + TypeScript + Tailwind CSS + Supabase** 搭建，采用现代化扁平简约卡片风（Modern Clean Minimalist）界面，聚合了 **炸金花、21点、德州扑克、猜大小（骰宝）、猜点数六合彩** 五大经典热门玩法。

---

## 🌟 核心特性与亮点

- 🎮 **五大经典玩法深度实现**：
  1. **炸金花**：三张底牌博弈，支持闷牌（暗注）、看牌翻倍、跟注、加注、比牌PK，实现豹子、顺金、金花、顺子、对子、散牌及特殊 235 克豹子全套规则判定。
  2. **21点 (Blackjack)**：对战庄家，提供要牌 (Hit)、停牌 (Stand)、双倍下注 (Double)，软硬 Ace 动态点数换算、庄家软17停牌规则与 3:2 天王赔率结算。
  3. **德州扑克**：国际标准规则，2张底牌 + 5张公共牌（翻牌、转牌、河牌），7选5最优牌型评级算法（高牌到皇家同花顺），彩池流转与 AI 智能对手。
  4. **猜大小 (骰宝)**：3颗骰子物理模拟摇盅，涵盖大/小/单/双/全围豹子（1:30）以及 4-17 点（最高 60 倍）多注区同投，配备历史走势路单。
  5. **猜点数六合彩**：即开型 1-49 号特码摇奖滚球动效，涵盖特码直选（1:47倍）、特码大小单双、红蓝绿三色波及十二生肖多维下注。
- 👥 **双模对战架构**：
  - **Supabase 数据库行驱动联机**：基于 `game_rooms` 和 `room_players` 数据表，玩家操作直接落盘，通过 Supabase Realtime `postgres_changes` 实时广播牌桌全状态。
  - **智能 AI 单人对战/练习**：每款卡牌与棋牌均内嵌 AI 决策引擎，单人即可流畅练习与体验，无需等待在线玩家。
- 🪙 **健全的虚拟货币经济体系**：
  - **新用户注册礼金**：Supabase 注册自动赠送 10,000 体验筹码。
  - **每日签到系统**：7天连续签到递增奖励（1,000 ~ 4,000 🪙），连签断签重置算法。
  - **管理员后台赠送与调账**：专属管理后台，管理员可按玩家昵称/邮箱搜索，并一键调账赠送筹码，全流程记录流水。
- 🔊 **零依赖程序化合成音效**：基于 Web Audio API 实现，纯代码生成发牌、推筹码、掷骰、胜利欢呼和弦音效，无需外链加载音频。
- 📱 **全端自适应响应式**：移动端触控优化与桌面宽屏高清排版无缝自适应。

---

## 📁 模块组织与目录结构

```text
lucky7/
├── index.html                   # 网页入口与视口设置
├── package.json                 # 项目依赖与构建脚本
├── tsconfig.json                # TypeScript 编译配置
├── vite.config.ts               # Vite 基础与路径别名配置
├── tailwind.config.js           # 现代化扁平设计系统颜色与排版扩展
├── supabase/
│   └── schema.sql               # 完整 Supabase 数据库表、触发器、RPC 函数与 RLS 策略
├── src/
│   ├── main.ts                  # 应用入口，挂载 Pinia 与 Vue Router
│   ├── App.vue                  # 根视图，包含导航栏、路由过渡与页脚
│   ├── assets/
│   │   └── main.css             # Tailwind 基础导入与自定义精致滚动条
│   ├── lib/
│   │   ├── supabase.ts          # Supabase 客户端单例与配置环境判断
│   │   └── sound.ts             # Web Audio API 程序化音效合成器
│   ├── types/
│   │   ├── database.ts          # Supabase 数据库数据模型（Profile、Record、Room 等）
│   │   └── game.ts              # 通用扑克、筹码、席位公共类型定义
│   ├── stores/
│   │   ├── auth.ts              # 用户认证、权限判定、个人资料与余额刷新
│   │   ├── wallet.ts            # 每日签到、对局结算与流水明细管理
│   │   └── room.ts              # 房间大厅与 Supabase 实时联机订阅
│   ├── components/
│   │   ├── common/              # 公共组件（Navbar, Footer, Modal）
│   │   └── game/                # 游戏公用组件（PlayingCard, ChipSelector, PlayerSeat, DiceBox, BallShaker）
│   ├── games/                   # 5大高度独立的玩法模块
│   │   ├── zhajinhua/           # 炸金花：types.ts, engine.ts, ZhajinhuaView.vue
│   │   ├── blackjack/           # 21点：types.ts, engine.ts, BlackjackView.vue
│   │   ├── texas/               # 德州扑克：types.ts, engine.ts, TexasView.vue
│   │   ├── sicbo/               # 猜大小：types.ts, engine.ts, SicboView.vue
│   │   └── marksix/             # 六合彩：types.ts, engine.ts, MarksixView.vue
│   └── views/
│       ├── HomeView.vue         # 游戏大厅首页与联机房间弹窗
│       ├── AuthView.vue         # 登录/注册与一键免密试玩体验
│       ├── CheckinView.vue      # 每日签到7天日历与领取动效
│       ├── LeaderboardView.vue  # 全服财富排行榜与前三名颁奖台
│       ├── RecordsView.vue      # 战绩记录与盈亏分析筛选
│       ├── AdminView.vue        # 管理员控制台：玩家搜索与后台筹码赠送
│       └── ProfileView.vue      # 个人中心：昵称修改与流水账单
```

---

## 🚀 快速上手与运行

### 1. 安装依赖
```bash
npm install
```

### 2. 配置 Supabase 环境变量
在项目根目录下创建 `.env` 文件（或复制 `.env.example`）：
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> **提示**：即使未即刻配置 Supabase，系统也内置了本地演示与练习模式（支持单人对战、AI模拟、本地记账与一键试玩），可立即体验完整游戏！

### 3. 本地启动开发服务器
```bash
npm run dev
```
打开浏览器访问控制台输出的地址（通常为 `http://localhost:5173`）即可进入游戏大厅。

### 4. 构建生产产物
```bash
npm run build
```

---

## 🌐 部署到 GitHub Pages 指南

本项目为纯静态 SPA（所有数据由 Supabase 云端提供），已专门为 GitHub Pages 进行了适配优化：
- **静态资源相对路径**：已配置 `base: './'`，无论部署在根域名还是子仓库路径下都不会 404。
- **Hash 路由模式**：已切换为 `createWebHashHistory`，在 GitHub Pages 上任意刷新子页面都不会发生 404 错误。

### 自动化部署步骤（推荐）：

1. **推送代码至 GitHub 仓库**：
   ```bash
   git add .
   git commit -m "feat: initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/你的仓库名.git
   git push -u origin main
   ```

2. **在 GitHub 仓库中配置 Supabase 密钥 (Secrets)**：
   - 打开 GitHub 你的仓库页面 ➔ **Settings** ➔ **Secrets and variables** ➔ **Actions**。
   - 点击 **New repository secret**，添加以下两项：
     - `VITE_SUPABASE_URL`：填写你的 Supabase 根 URL
     - `VITE_SUPABASE_ANON_KEY`：填写你的 Publishable Key

3. **开启 GitHub Pages**：
   - 进入仓库 **Settings** ➔ **Pages**。
   - 在 **Build and deployment** 下的 **Source** 中选择 **「GitHub Actions」**。
   - 项目中已内置好的 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) 会在每次代码推送时自动编译并部署，1~2 分钟后即可直接通过公网访问！

## 🗄️ Supabase 数据库配置指南

在您的 [Supabase 控制台](https://supabase.com/dashboard) 中进入对应项目的 **SQL Editor**，打开并直接执行本项目中的 [`supabase/schema.sql`](file:///d:/Code/gemini_test/lucky7/supabase/schema.sql) 文件内容。

脚本将自动创建以下设施：
1. **数据表**：
   - `profiles`：玩家信息、筹码余额、管理员标识
   - `daily_checkins`：每日签到防刷及连续天数记录
   - `chip_transactions`：全部筹码进出流水审计表
   - `game_records`：对局战绩表（包含每局手牌详情与胜负盈亏）
   - `game_rooms` 与 `room_players`：联机对战房间及在桌席位
2. **触发器**：新用户在 Supabase Auth 注册时自动建立档案并赠送 10,000 体验金。
3. **RPC 存储过程**：
   - `claim_daily_checkin(p_user_id)`：原子性签到并梯度发放奖励。
   - `settle_game(...)`：原子性结算每局战绩并调账。
   - `admin_grant_chips(p_target_user_id, p_amount, p_reason)`：管理员给玩家后台赠分/扣分。
4. **实时发布**：开启 `game_rooms`、`room_players` 等表的 Realtime 广播。

### 设置管理员账号
注册完用户后，在 Supabase SQL Editor 中执行一行命令即可成为管理员：
```sql
update public.profiles set is_admin = true where email = '你的注册邮箱@xxx.com';
```
登录后导航栏将自动出现「管理后台」入口。

---

## 🧩 如何扩展一个新游戏？（只需 3 步）

1. **创建游戏引擎与视图**：
   在 `src/games/` 下新建目录（例如 `src/games/baccarat/`），编写 `types.ts`、`engine.ts` 和 `views/BaccaratView.vue`。
2. **结算数据对接**：
   对局结束时调用 `walletStore.recordGameSettlement('baccarat', bet, payout, details)`，系统将自动更新余额、写入战绩并记账。
3. **注册路由与大厅入口**：
   - 在 `src/router/index.ts` 中添加 `{ path: '/game/baccarat', component: BaccaratView }`。
   - 在 `src/views/HomeView.vue` 增加游戏展示卡片即可！
