<template>
  <div class="min-h-screen flex flex-col bg-[#fffef0] text-[#1a1a1a] selection:bg-[#facc15] selection:text-[#1a1a1a]">
    <!-- Main Top Navbar -->
    <Navbar />

    <!-- Route Views -->
    <main class="flex-1">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Global Footer -->
    <Footer />

    <!-- Global Unified UI Dialog (Alert & Confirm) -->
    <GlobalDialog />

    <!-- Daily Checkin First-Login Reminder Modal -->
    <DailyCheckinModal />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Navbar from '@/components/common/Navbar.vue'
import Footer from '@/components/common/Footer.vue'
import GlobalDialog from '@/components/common/GlobalDialog.vue'
import DailyCheckinModal from '@/components/common/DailyCheckinModal.vue'
import { setupGlobalAlertInterception } from '@/lib/dialog'
import { useAuthStore } from '@/stores/auth'
import { useWalletStore } from '@/stores/wallet'
import { useLotteryStore } from '@/stores/lottery'
import { useGameScheduleStore } from '@/stores/gameSchedule'

const authStore = useAuthStore()
const walletStore = useWalletStore()
useLotteryStore()
useGameScheduleStore()

setupGlobalAlertInterception()

onMounted(async () => {
  await authStore.initAuth()
  await walletStore.checkTodayStatus()
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
