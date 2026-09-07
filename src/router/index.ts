import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AuthView from '@/views/AuthView.vue'
import CheckinView from '@/views/CheckinView.vue'
import LeaderboardView from '@/views/LeaderboardView.vue'
import RecordsView from '@/views/RecordsView.vue'
import AdminView from '@/views/AdminView.vue'
import ProfileView from '@/views/ProfileView.vue'

import ZhajinhuaView from '@/games/zhajinhua/views/ZhajinhuaView.vue'
import BlackjackView from '@/games/blackjack/views/BlackjackView.vue'
import TexasView from '@/games/texas/views/TexasView.vue'
import SicboView from '@/games/sicbo/views/SicboView.vue'
import MarksixView from '@/games/marksix/views/MarksixView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/auth', name: 'auth', component: AuthView },
  { path: '/checkin', name: 'checkin', component: CheckinView },
  { path: '/leaderboard', name: 'leaderboard', component: LeaderboardView },
  { path: '/records', name: 'records', component: RecordsView },
  { path: '/admin', name: 'admin', component: AdminView },
  { path: '/profile', name: 'profile', component: ProfileView },

  // 5 个独立游戏模块路由
  { path: '/game/zhajinhua', name: 'game-zhajinhua', component: ZhajinhuaView },
  { path: '/game/blackjack', name: 'game-blackjack', component: BlackjackView },
  { path: '/game/texas', name: 'game-texas', component: TexasView },
  { path: '/game/sicbo', name: 'game-sicbo', component: SicboView },
  { path: '/game/marksix', name: 'game-marksix', component: MarksixView }
]

const router = createRouter({
  // 使用 Hash 路由模式，确保部署在 GitHub Pages 等纯静态托管上刷新页面不会出现 404 错误
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
