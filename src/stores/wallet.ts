import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuthStore } from './auth'
import type { ChipTransaction, GameRecord } from '@/types/database'

export interface CheckinMilestone {
  days: number
  reward: number
  title: string
}

export interface CheckinConfig {
  day_rewards: number[]
  milestones?: CheckinMilestone[]
}

export const DEFAULT_DAY_REWARDS = [1000, 1500, 2000, 2500, 3000, 3500, 4000]
export const DEFAULT_MILESTONES: CheckinMilestone[] = [
  { days: 3, reward: 888, title: '连签3天小试牛刀' },
  { days: 7, reward: 2888, title: '连签7天持之以恒' },
  { days: 14, reward: 6888, title: '连签14天炉火纯青' },
  { days: 30, reward: 18888, title: '连签30天登峰造极' }
]

export const useWalletStore = defineStore('wallet', () => {
  const authStore = useAuthStore()
  const transactions = ref<ChipTransaction[]>([])
  const gameRecords = ref<GameRecord[]>([])
  const loading = ref<boolean>(false)
  const isCheckedInToday = ref<boolean>(false)
  const currentStreak = ref<number>(1)

  // 7天签到阶梯奖励配置 (第1~7天)
  const dayRewards = ref<number[]>(
    JSON.parse(localStorage.getItem('lucky7_checkin_day_rewards') || 'null') || [...DEFAULT_DAY_REWARDS]
  )
  // 连签任务里程碑配置
  const milestones = ref<CheckinMilestone[]>(
    JSON.parse(localStorage.getItem('lucky7_checkin_milestones') || 'null') || [...DEFAULT_MILESTONES]
  )

  const maxReward = computed(() => {
    return Math.max(...dayRewards.value, 4000)
  })

  function getRewardForDay(dayIndex: number): number {
    return dayRewards.value[dayIndex] ?? (1000 + dayIndex * 500)
  }

  // 从服务端同步签到配置
  async function fetchCheckinConfig() {
    if (!isSupabaseConfigured()) return
    try {
      const { data, error } = await supabase
        .from('system_configs')
        .select('*')
        .eq('key', 'checkin_rewards')
        .maybeSingle()

      if (!error && data?.value) {
        const val = data.value as CheckinConfig
        if (Array.isArray(val.day_rewards) && val.day_rewards.length >= 7) {
          dayRewards.value = val.day_rewards
          localStorage.setItem('lucky7_checkin_day_rewards', JSON.stringify(val.day_rewards))
        }
        if (Array.isArray(val.milestones)) {
          milestones.value = val.milestones
          localStorage.setItem('lucky7_checkin_milestones', JSON.stringify(val.milestones))
        }
      }
    } catch (err) {
      console.warn('Fetch checkin config error:', err)
    }
  }

  fetchCheckinConfig()

  // 管理员保存更新签到配置
  async function updateCheckinConfig(newDayRewards: number[], newMilestones?: CheckinMilestone[]) {
    dayRewards.value = [...newDayRewards]
    if (newMilestones) milestones.value = [...newMilestones]

    localStorage.setItem('lucky7_checkin_day_rewards', JSON.stringify(dayRewards.value))
    localStorage.setItem('lucky7_checkin_milestones', JSON.stringify(milestones.value))

    if (isSupabaseConfigured()) {
      const payload: CheckinConfig = {
        day_rewards: dayRewards.value,
        milestones: milestones.value
      }
      const { error } = await supabase
        .from('system_configs')
        .upsert({
          key: 'checkin_rewards',
          value: payload,
          updated_at: new Date().toISOString()
        })
      if (error) throw error
    }
  }

  // 检查今日是否已签到
  async function checkTodayStatus() {
    if (!authStore.profile) return
    const todayStr = new Date().toISOString().split('T')[0]

    if (!isSupabaseConfigured()) {
      const localCheckin = localStorage.getItem(`lucky7_checkin_${authStore.profile.id}`)
      if (localCheckin) {
        const parsed = JSON.parse(localCheckin)
        isCheckedInToday.value = parsed.date === todayStr
        currentStreak.value = parsed.streak || 1
      } else {
        isCheckedInToday.value = false
        currentStreak.value = 1
      }
      return
    }

    try {
      const { data } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', authStore.profile.id)
        .eq('checkin_date', todayStr)
        .maybeSingle()

      isCheckedInToday.value = Boolean(data)

      // 查询最近一次连签
      const { data: lastRecord } = await supabase
        .from('daily_checkins')
        .select('streak_days, checkin_date')
        .eq('user_id', authStore.profile.id)
        .order('checkin_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (lastRecord) {
        currentStreak.value = lastRecord.streak_days || 1
      }
    } catch (err) {
      console.error('Check checkin status error:', err)
    }
  }

  // 领取每日签到奖励
  async function claimDailyBonus(): Promise<{ success: boolean; reward?: number; streak?: number; message?: string }> {
    if (!authStore.profile) return { success: false, message: '请先登录' }
    const todayStr = new Date().toISOString().split('T')[0]

    if (!isSupabaseConfigured()) {
      if (isCheckedInToday.value) {
        return { success: false, message: '今日已经签到过了！' }
      }
      const newStreak = currentStreak.value + 1
      const dayIdx = (newStreak - 1) % 7
      const baseReward = dayRewards.value[dayIdx] ?? (1000 + dayIdx * 500)
      let milestoneReward = 0
      let milestoneTitle = ''
      const matched = milestones.value.find(m => m.days === newStreak)
      if (matched) {
        milestoneReward = matched.reward
        milestoneTitle = matched.title
      }
      const totalReward = baseReward + milestoneReward
      authStore.profile.chips += totalReward
      localStorage.setItem('lucky7_local_profile', JSON.stringify(authStore.profile))

      localStorage.setItem(`lucky7_checkin_${authStore.profile.id}`, JSON.stringify({
        date: todayStr,
        streak: newStreak
      }))
      isCheckedInToday.value = true
      currentStreak.value = newStreak

      // 本地流水记录
      transactions.value.unshift({
        id: 'tx_' + Date.now(),
        user_id: authStore.profile.id,
        amount: totalReward,
        type: 'daily_checkin',
        balance_after: authStore.profile.chips,
        note: milestoneReward > 0
          ? `第 ${newStreak} 天连续签到 (${baseReward}) + 里程碑 [${milestoneTitle}] (${milestoneReward})`
          : `第 ${newStreak} 天连续签到`,
        created_at: new Date().toISOString()
      })

      return {
        success: true,
        reward: totalReward,
        streak: newStreak
      }
    }

    try {
      loading.value = true
      const { data, error } = await supabase.rpc('claim_daily_checkin', {
        p_user_id: authStore.profile.id
      })

      if (error) throw error
      const res = data as { success: boolean; reward?: number; streak?: number; message?: string; new_balance?: number }
      if (res.success) {
        isCheckedInToday.value = true
        currentStreak.value = res.streak || 1
        if (res.new_balance !== undefined) {
          authStore.profile.chips = res.new_balance
        }
      }
      return res
    } catch (err: unknown) {
      const e = err as { message?: string }
      return { success: false, message: e.message || '签到失败' }
    } finally {
      loading.value = false
    }
  }

  // 结算对局结果（记录战绩与资金变动）
  async function recordGameSettlement(
    gameType: 'zhajinhua' | 'blackjack' | 'texas' | 'sicbo' | 'marksix',
    betAmount: number,
    payout: number,
    details: Record<string, unknown> = {},
    roomId: string | null = null
  ) {
    if (!authStore.profile) return null
    const netProfit = payout - betAmount

    if (!isSupabaseConfigured()) {
      authStore.profile.chips = Math.max(0, authStore.profile.chips + netProfit)
      localStorage.setItem('lucky7_local_profile', JSON.stringify(authStore.profile))

      const rec: GameRecord = {
        id: 'rec_' + Date.now() + Math.random().toString(36).slice(2, 6),
        user_id: authStore.profile.id,
        game_type: gameType,
        room_id: roomId,
        bet_amount: betAmount,
        payout,
        net_profit: netProfit,
        details,
        created_at: new Date().toISOString()
      }
      gameRecords.value.unshift(rec)

      // 保存本地历史
      const localRecords = JSON.parse(localStorage.getItem('lucky7_records_' + authStore.profile.id) || '[]')
      localRecords.unshift(rec)
      if (localRecords.length > 50) localRecords.pop()
      localStorage.setItem('lucky7_records_' + authStore.profile.id, JSON.stringify(localRecords))

      return { netProfit, newBalance: authStore.profile.chips }
    }

    try {
      const { data, error } = await supabase.rpc('settle_game', {
        p_user_id: authStore.profile.id,
        p_game_type: gameType,
        p_bet_amount: betAmount,
        p_payout: payout,
        p_details: details
      })

      if (error) {
        console.error('Settle game error:', error)
      } else if (data) {
        const res = data as { success: boolean; new_balance?: number; net_profit?: number }
        if (res.new_balance !== undefined) {
          authStore.profile.chips = res.new_balance
        }
        return res
      }
    } catch (err) {
      console.error('RPC settle_game exception:', err)
    }
    return null
  }

  // 加载战绩历史
  async function fetchGameRecords(limit = 30) {
    if (!authStore.profile) return
    if (!isSupabaseConfigured()) {
      const stored = localStorage.getItem('lucky7_records_' + authStore.profile.id)
      if (stored) {
        try {
          gameRecords.value = JSON.parse(stored)
        } catch {
          gameRecords.value = []
        }
      }
      return
    }

    try {
      loading.value = true
      const { data, error } = await supabase
        .from('game_records')
        .select('*')
        .eq('user_id', authStore.profile.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (!error && data) {
        gameRecords.value = data as GameRecord[]
      }
    } catch (err) {
      console.error('Fetch game records error:', err)
    } finally {
      loading.value = false
    }
  }

  // 加载流水历史
  async function fetchTransactions(limit = 30) {
    if (!authStore.profile) return
    if (!isSupabaseConfigured()) {
      return
    }

    try {
      loading.value = true
      const { data, error } = await supabase
        .from('chip_transactions')
        .select('*')
        .eq('user_id', authStore.profile.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (!error && data) {
        transactions.value = data as ChipTransaction[]
      }
    } catch (err) {
      console.error('Fetch transactions error:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    transactions,
    gameRecords,
    loading,
    isCheckedInToday,
    currentStreak,
    dayRewards,
    milestones,
    maxReward,
    getRewardForDay,
    fetchCheckinConfig,
    updateCheckinConfig,
    checkTodayStatus,
    claimDailyBonus,
    recordGameSettlement,
    fetchGameRecords,
    fetchTransactions
  }
})
