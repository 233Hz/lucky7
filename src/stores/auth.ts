import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Profile } from '@/types/database'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const profile = ref<Profile | null>(null)
  const loading = ref<boolean>(false)
  const authError = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(user.value))
  const isAdmin = computed(() => Boolean(profile.value?.is_admin))
  const userChips = computed(() => profile.value?.chips ?? 0)

  // 初始化鉴权状态与会话监听
  async function initAuth() {
    if (!isSupabaseConfigured()) {
      // 检查本地是否有保存的演示账号
      const localProfile = localStorage.getItem('lucky7_local_profile')
      if (localProfile) {
        try {
          const parsed = JSON.parse(localProfile)
          profile.value = parsed
          user.value = { id: parsed.id, email: parsed.email } as unknown as User
        } catch {
          createGuestProfile()
        }
      } else {
        createGuestProfile()
      }
      return
    }

    try {
      loading.value = true
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        user.value = session.user
        await fetchProfile(session.user.id)
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          user.value = session.user
          await fetchProfile(session.user.id)
        } else {
          user.value = null
          profile.value = null
        }
      })
    } catch (err: unknown) {
      console.error('Auth initialization error:', err)
    } finally {
      loading.value = false
    }
  }

  // 创建游客或无配置模式临时玩家
  function createGuestProfile() {
    const guestId = 'guest_' + Math.random().toString(36).substring(2, 9)
    const guest: Profile = {
      id: guestId,
      email: 'guest@lucky7.game',
      nickname: '幸运玩家_' + guestId.slice(-4),
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + guestId,
      chips: 10000,
      is_admin: true // 演示体验默认赋予管理员权限以供测试体验管理后台
    }
    profile.value = guest
    user.value = { id: guestId, email: guest.email } as unknown as User
    localStorage.setItem('lucky7_local_profile', JSON.stringify(guest))
  }

  // 获取用户公开资料
  async function fetchProfile(userId: string) {
    if (!isSupabaseConfigured()) return
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.warn('Fetch profile error:', error.message)
      } else if (data) {
        profile.value = data as Profile
      }
    } catch (err) {
      console.error('Fetch profile exception:', err)
    }
  }

  // 用户注册
  async function signUp(email: string, password: string, nickname: string) {
    authError.value = null
    loading.value = true

    if (!isSupabaseConfigured()) {
      const newId = 'usr_' + Date.now().toString(36)
      const p: Profile = {
        id: newId,
        email,
        nickname: nickname || email.split('@')[0],
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
        chips: 10000,
        is_admin: false
      }
      profile.value = p
      user.value = { id: newId, email } as unknown as User
      localStorage.setItem('lucky7_local_profile', JSON.stringify(p))
      loading.value = false
      return true
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname: nickname || email.split('@')[0],
            avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`
          }
        }
      })

      if (error) throw error

      if (data.user) {
        user.value = data.user
        await fetchProfile(data.user.id)
      }
      return true
    } catch (err: unknown) {
      const e = err as { message?: string }
      authError.value = e.message || '注册失败'
      return false
    } finally {
      loading.value = false
    }
  }

  // 用户登录
  async function signIn(email: string, password: string) {
    authError.value = null
    loading.value = true

    if (!isSupabaseConfigured()) {
      const p: Profile = {
        id: 'usr_' + email.replace(/[^a-zA-Z0-9]/g, '_'),
        email,
        nickname: email.split('@')[0],
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
        chips: 10000,
        is_admin: true
      }
      profile.value = p
      user.value = { id: p.id, email } as unknown as User
      localStorage.setItem('lucky7_local_profile', JSON.stringify(p))
      loading.value = false
      return true
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data.user) {
        user.value = data.user
        await fetchProfile(data.user.id)
      }
      return true
    } catch (err: unknown) {
      const e = err as { message?: string }
      authError.value = e.message || '登录失败'
      return false
    } finally {
      loading.value = false
    }
  }

  // 登出
  async function signOut() {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut()
    } else {
      localStorage.removeItem('lucky7_local_profile')
    }
    user.value = null
    profile.value = null
  }

  // 更新昵称和头像
  async function updateProfile(nickname: string, avatarUrl: string) {
    if (!profile.value) return false
    profile.value.nickname = nickname
    profile.value.avatar_url = avatarUrl

    if (!isSupabaseConfigured()) {
      localStorage.setItem('lucky7_local_profile', JSON.stringify(profile.value))
      return true
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nickname,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.value.id)

      return !error
    } catch {
      return false
    }
  }

  // 修改密码
  async function updatePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    authError.value = null
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: '密码长度至少需要 6 个字符' }
    }

    if (!isSupabaseConfigured()) {
      return { success: true, message: '密码修改成功（本地演示模式）！' }
    }

    try {
      loading.value = true
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { success: false, message: error.message || '修改密码失败' }
      }
      return { success: true, message: '密码已成功更新，请妥善保存您的新密码！' }
    } catch (err: unknown) {
      const e = err as { message?: string }
      return { success: false, message: e.message || '更新密码发生异常' }
    } finally {
      loading.value = false
    }
  }

  // 刷新最新余额
  async function refreshBalance() {
    if (profile.value && isSupabaseConfigured()) {
      await fetchProfile(profile.value.id)
    }
  }

  return {
    user,
    profile,
    loading,
    authError,
    isAuthenticated,
    isAdmin,
    userChips,
    initAuth,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updatePassword,
    refreshBalance
  }
})
