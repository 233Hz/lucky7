<template>
  <div class="flex flex-col h-full bg-white border-4 border-black shadow-brutal font-mono select-none">
    <!-- Channel Header -->
    <div class="p-3 bg-[#ffff00] border-b-4 border-black flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <div class="w-8 h-8 rounded-none bg-black text-[#ffff00] border-2 border-black flex items-center justify-center font-black">
          <MessageSquare class="w-4 h-4" />
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <span class="text-xs sm:text-sm font-black text-black">{{ title }}</span>
            <span
              class="text-[10px] font-black px-1.5 py-0.2 border border-black"
              :class="channelType === 'lottery' ? 'bg-[#ff006e] text-white' : 'bg-[#00d9ff] text-black'"
            >
              {{ channelType === 'lottery' ? '全服公共' : '本房私密' }}
            </span>
          </div>
          <div class="text-[10px] text-black/70 flex items-center gap-1 mt-0.5 font-bold">
            <span class="w-2 h-2 rounded-full bg-[#00e676] border border-black inline-block animate-pulse"></span>
            <span>{{ subtitle || (channelType === 'lottery' ? '全服玩家实时互联' : '在桌玩家专属畅聊') }}</span>
          </div>
        </div>
      </div>

      <!-- Header Controls -->
      <div class="flex items-center space-x-1">
        <button
          @click="chatStore.clearChannel(channel)"
          class="p-1 rounded-none border border-black bg-white hover:bg-[#ff006e] hover:text-white transition-colors"
          title="清空聊天记录"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
        <button
          v-if="allowClose"
          @click="$emit('close')"
          class="p-1 rounded-none border border-black bg-white hover:bg-black hover:text-white transition-colors"
          title="关闭聊天面板"
        >
          <X class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Message Stream -->
    <div
      ref="messageContainerRef"
      class="flex-1 p-3 overflow-y-auto space-y-3 bg-[#fdfaf5] min-h-[220px] max-h-[480px]"
    >
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="flex flex-col"
        :class="msg.senderId === currentUserId ? 'items-end' : 'items-start'"
      >
        <!-- A. System Announcement Message -->
        <div
          v-if="msg.isSystem"
          class="w-full my-1 p-2 rounded-none bg-[#ffffeb] border-2 border-black shadow-brutal-sm text-xs leading-relaxed"
        >
          <div class="flex items-center gap-1.5 text-black font-black mb-0.5">
            <Megaphone class="w-3.5 h-3.5 text-[#ff006e]" />
            <span class="bg-black text-[#ffff00] px-1 py-0.2 text-[10px] font-mono font-black border border-black">系统播报</span>
            <span class="text-[10px] text-black/60 font-mono font-normal ml-auto">{{ formatTime(msg.createdAt) }}</span>
          </div>
          <div class="text-black font-bold font-mono pl-5 text-[11px] sm:text-xs">
            {{ msg.content }}
          </div>
        </div>

        <!-- B. Regular Player Message -->
        <template v-else>
          <!-- Sender info line -->
          <div
            class="flex items-center gap-1.5 mb-0.5 text-[10px] font-bold text-black/70"
            :class="msg.senderId === currentUserId ? 'flex-row-reverse' : 'flex-row'"
          >
            <span class="font-black text-black">{{ msg.senderName }}</span>
            <span
              v-if="msg.isHost"
              class="px-1 py-0.2 bg-[#ffff00] text-black border border-black text-[9px] font-black"
            >
              房主
            </span>
            <span
              v-if="msg.senderId === currentUserId"
              class="px-1 py-0.2 bg-[#ccff00] text-black border border-black text-[9px] font-black"
            >
              我
            </span>
            <span class="text-[9px] text-black/50 font-mono">{{ formatTime(msg.createdAt) }}</span>
          </div>

          <!-- Message Body with Avatar -->
          <div
            class="flex items-start gap-2 max-w-[88%]"
            :class="msg.senderId === currentUserId ? 'flex-row-reverse' : 'flex-row'"
          >
            <img
              :src="msg.senderAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + msg.senderId"
              class="w-7 h-7 rounded-none border-2 border-black bg-white flex-shrink-0"
              alt="avatar"
            />
            <div
              class="p-2.5 rounded-none border-2 border-black text-xs font-mono font-bold leading-relaxed break-all shadow-brutal-sm"
              :class="msg.senderId === currentUserId ? 'bg-[#ccff00] text-black' : 'bg-white text-black'"
            >
              {{ msg.content }}
            </div>
          </div>
        </template>
      </div>

      <!-- Empty state hint -->
      <div v-if="messages.length === 0" class="text-center py-8 text-black/40 text-xs">
        暂无消息，快发一句破冰吧！
      </div>
    </div>

    <!-- Quick Phrase Shortcuts -->
    <div class="px-2.5 py-1.5 bg-[#f4f4f0] border-t-2 border-black overflow-x-auto flex items-center space-x-1.5 no-scrollbar">
      <span class="text-[10px] text-black font-black flex-shrink-0 flex items-center gap-0.5">
        <Sparkles class="w-3 h-3 text-[#ff9500]" />
        <span>快捷:</span>
      </span>
      <button
        v-for="(phrase, idx) in quickPhrases"
        :key="idx"
        @click="sendQuickPhrase(phrase)"
        class="px-2 py-0.5 rounded-none text-[10px] font-bold border border-black bg-white hover:bg-[#ffff00] active:translate-y-0.5 flex-shrink-0 transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
      >
        {{ phrase }}
      </button>
    </div>

    <!-- Input Bar -->
    <div class="p-2.5 bg-white border-t-3 border-black flex items-center space-x-2">
      <input
        v-model="inputContent"
        @keyup.enter="handleSendMessage"
        type="text"
        maxlength="80"
        :placeholder="channelType === 'lottery' ? '与全服彩友畅聊...' : '与桌内对手对话...'"
        class="flex-1 px-3 py-2 text-xs font-mono font-bold border-2 border-black rounded-none focus:outline-none focus:bg-[#ffffeb] shadow-brutal-sm"
      />
      <button
        v-prevent-reclick
        @click="handleSendMessage"
        :disabled="!inputContent.trim() || isSending"
        class="brutal-btn-lime px-4 py-2 text-xs font-black disabled:opacity-40 flex items-center gap-1 shadow-brutal-sm flex-shrink-0"
      >
        <Send class="w-3.5 h-3.5" />
        <span>{{ isSending ? '发送中' : '发送' }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import {
  MessageSquare,
  Send,
  Trash2,
  X,
  Megaphone,
  Sparkles
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'

const props = withDefaults(
  defineProps<{
    channel: string
    title?: string
    subtitle?: string
    channelType?: 'lottery' | 'room'
    isHost?: boolean
    allowClose?: boolean
  }>(),
  {
    title: '全服公共聊天室',
    subtitle: '',
    channelType: 'lottery',
    isHost: false,
    allowClose: false
  }
)

defineEmits<{
  (e: 'close'): void
}>()

const authStore = useAuthStore()
const chatStore = useChatStore()

const inputContent = ref('')
const messageContainerRef = ref<HTMLDivElement | null>(null)

const currentUserId = computed(() => authStore.profile?.id || '')

const messages = computed(() => {
  return chatStore.getMessages(props.channel)
})

// 快捷短语预设
const quickPhrases = computed(() => {
  if (props.channelType === 'lottery') {
    return [
      '这期必开大！',
      '小买怡情搏一把！',
      '这把看好单数！',
      '特码看好红波！',
      '跟上跟上！',
      '坐等开奖发财！'
    ]
  }
  return [
    '快点准备啊！',
    '房主快开局！',
    '这把牌绝了！',
    '跟注到底！',
    '承让承让！',
    '手气正好，再来！'
  ]
})

function formatTime(isoStr: string) {
  if (!isoStr) return ''
  try {
    const d = new Date(isoStr)
    return d.toTimeString().slice(0, 8)
  } catch {
    return ''
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messageContainerRef.value) {
      messageContainerRef.value.scrollTop = messageContainerRef.value.scrollHeight
    }
  })
}

watch(
  () => messages.value.length,
  () => {
    scrollToBottom()
  }
)

onMounted(() => {
  chatStore.initChannel(props.channel)
  scrollToBottom()
})

const isSending = ref(false)

async function handleSendMessage() {
  const text = inputContent.value.trim()
  if (!text || isSending.value) return
  isSending.value = true
  try {
    await chatStore.sendMessage(props.channel, text, { isHost: props.isHost })
    inputContent.value = ''
    scrollToBottom()
  } finally {
    isSending.value = false
  }
}

function sendQuickPhrase(phrase: string) {
  chatStore.sendMessage(props.channel, phrase, { isHost: props.isHost })
  scrollToBottom()
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
