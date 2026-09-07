import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuthStore } from './auth'
import type { ChipTransaction, GameRecord } from '@/types/database'

export const useWalletStore = defineStore('wallet', () => {
  const authStore = useAuthStore()
  const transactions = ref<ChipTransaction[]>([])
  const gameRecords = ref<GameRecord[]>([])
  const loading = ref<boolean>(false)
  const isCheckedInToday = ref<boolean>(false)
  const currentStreak = ref<number>(1)

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
      const reward = 1000 + ((newStreak - 1) % 7) * 500
      authStore.profile.chips += reward
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
        amount: reward,
        type: 'daily_checkin',
        balance_after: authStore.profile.chips,
        note: `第 ${newStreak} 天连续签到`,
        created_at: new Date().toISOString()
      })

      return { success: true, reward, streak: newStreak }
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
    checkTodayStatus,
    claimDailyBonus,
    recordGameSettlement,
    fetchGameRecords,
    fetchTransactions
  }
})
