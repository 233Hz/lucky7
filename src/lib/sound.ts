// Web Audio API 程序化音效合成器 - 零外部静态依赖，极速响应
class SoundEffects {
  private ctx: AudioContext | null = null
  private muted: boolean = false

  constructor() {
    // 延迟初始化 AudioContext 直到首次用户交互
    const stored = localStorage.getItem('lucky7_sound_muted')
    this.muted = stored === 'true'
  }

  private getContext(): AudioContext | null {
    if (this.muted) return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  public toggleMute(): boolean {
    this.muted = !this.muted
    localStorage.setItem('lucky7_sound_muted', String(this.muted))
    return this.muted
  }

  public isMuted(): boolean {
    return this.muted
  }

  // 按钮点击
  public playClick() {
    const ctx = this.getContext()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04)

    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.04)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.04)
  }

  // 筹码清脆碰撞声
  public playChip() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(1800, now)
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.06)

    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.06)
  }

  // 发牌滑动音效
  public playDealCard() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime

    // 白噪音模拟纸牌摩擦
    const bufferSize = ctx.sampleRate * 0.08
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }

    const whiteNoise = ctx.createBufferSource()
    whiteNoise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1200, now)
    filter.frequency.linearRampToValueAtTime(600, now + 0.08)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.25, now)
    gain.gain.linearRampToValueAtTime(0.01, now + 0.08)

    whiteNoise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    whiteNoise.start(now)
    whiteNoise.stop(now + 0.08)
  }

  // 掷骰子碰撞摇动声
  public playDiceRoll() {
    const ctx = this.getContext()
    if (!ctx) return
    const now = ctx.currentTime

    for (let i = 0; i < 4; i++) {
      const t = now + i * 0.06
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(320 + Math.random() * 200, t)
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.04)

      gain.gain.setValueAtTime(0.2, t)
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.04)
    }
  }

  // 胜利欢庆和弦
  public playWin() {
    const ctx = this.getContext()
    if (!ctx) return
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
    const now = ctx.currentTime

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = now + idx * 0.08

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, start)

      gain.gain.setValueAtTime(0.2, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.35)
    })
  }

  // 失败柔和降调
  public playLose() {
    const ctx = this.getContext()
    if (!ctx) return
    const notes = [440, 415.3, 392]
    const now = ctx.currentTime

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = now + idx * 0.12

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, start)

      gain.gain.setValueAtTime(0.15, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25)

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.25)
    })
  }
}

export const sound = new SoundEffects()
