<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  disabled: boolean
}>()

const emit = defineEmits<{
  send: [data: string | Uint8Array]
}>()

type SendMode = 'text' | 'hex'
type NewlineMode = 'none' | 'lf' | 'crlf'

const inputText = ref('')
const sendMode = ref<SendMode>('text')
const newlineMode = ref<NewlineMode>('lf')

// 常用十六进制快捷示例
const hexQuickExamples = [
  { label: 'AT', value: '41 54 0D 0A', desc: 'AT指令测试' },
  { label: 'Hello', value: '48 65 6C 6C 6F', desc: 'Hello字符串' }
]

const placeholder = computed(() => {
  return sendMode.value === 'hex'
    ? '输入十六进制数据，如: 48 65 6C 6C 6F'
    : '输入要发送的数据...'
})

function parseHexString(hex: string): Uint8Array | null {
  // 移除所有空格和常见分隔符
  const cleanHex = hex.replace(/[\s,.-]/g, '')

  // 检查是否为有效的十六进制字符串
  if (!/^[0-9A-Fa-f]*$/.test(cleanHex)) {
    return null
  }

  // 必须是偶数长度
  if (cleanHex.length % 2 !== 0) {
    return null
  }

  const bytes = new Uint8Array(cleanHex.length / 2)
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16)
  }

  return bytes
}

function handleSend() {
  const text = inputText.value.trim()
  if (!text) return

  if (sendMode.value === 'hex') {
    const bytes = parseHexString(text)
    if (!bytes) {
      alert('十六进制格式错误，请输入有效的十六进制数据（如: 48 65 6C 6C 6F）')
      return
    }
    emit('send', bytes)
  } else {
    let data = text
    if (newlineMode.value === 'lf') {
      data += '\n'
    } else if (newlineMode.value === 'crlf') {
      data += '\r\n'
    }
    emit('send', data)
  }

  inputText.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

// 填充快捷示例
function fillExample(value: string) {
  inputText.value = value
  sendMode.value = 'hex'
}
</script>

<template>
  <div class="data-sender">
    <div class="sender-header">
      <span class="sender-title">发送数据</span>
      <div class="sender-options">
        <div class="option-group">
          <label class="option-label">模式:</label>
          <select v-model="sendMode" class="option-select">
            <option value="text">文本</option>
            <option value="hex">十六进制</option>
          </select>
        </div>
        <div v-if="sendMode === 'text'" class="option-group">
          <label class="option-label">换行:</label>
          <select v-model="newlineMode" class="option-select">
            <option value="none">无</option>
            <option value="lf">LF (\n)</option>
            <option value="crlf">CRLF (\r\n)</option>
          </select>
        </div>
      </div>
    </div>
    <div class="sender-input">
      <textarea
        v-model="inputText"
        :placeholder="placeholder"
        :disabled="disabled"
        @keydown="handleKeydown"
      ></textarea>
      <button
        class="send-btn"
        :disabled="disabled || !inputText.trim()"
        @click="handleSend"
      >
        发送
      </button>
    </div>
    <p class="hint">
      <template v-if="sendMode === 'hex'">
        十六进制模式: 输入格式如 <code>48 65 6C 6C 6F</code> 或 <code>48656C6C6F</code>
      </template>
      <template v-else>
        按 Enter 发送，Shift+Enter 换行
      </template>
    </p>
    <!-- 十六进制快捷示例 -->
    <div v-if="sendMode === 'hex'" class="quick-examples">
      <span class="quick-label">快捷示例:</span>
      <button
        v-for="example in hexQuickExamples"
        :key="example.value"
        class="quick-btn"
        :disabled="disabled"
        @click="fillExample(example.value)"
        :title="example.desc"
      >
        {{ example.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.data-sender {
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.sender-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  flex-wrap: wrap;
  gap: 8px;
}

.sender-title {
  font-weight: 500;
  color: #333;
}

.sender-options {
  display: flex;
  align-items: center;
  gap: 16px;
}

.option-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.option-label {
  font-size: 12px;
  color: #666;
}

.option-select {
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.option-select:focus {
  border-color: #42b883;
  outline: none;
}

.sender-input {
  display: flex;
  gap: 8px;
  padding: 12px;
}

.sender-input textarea {
  flex: 1;
  min-height: 60px;
  padding: 8px 12px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.5;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  outline: none;
}

.sender-input textarea:focus {
  border-color: #42b883;
  box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
}

.sender-input textarea:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.send-btn {
  padding: 10px 20px;
  font-size: 14px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  align-self: flex-end;
}

.send-btn:hover:not(:disabled) {
  background: #35a070;
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.hint {
  margin: 0;
  padding: 0 12px 8px;
  font-size: 11px;
  color: #999;
}

.hint code {
  background: #f0f0f0;
  padding: 1px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.quick-examples {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px 10px;
  flex-wrap: wrap;
}

.quick-label {
  font-size: 11px;
  color: #999;
}

.quick-btn {
  padding: 4px 10px;
  font-size: 11px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-family: monospace;
  transition: all 0.2s;
}

.quick-btn:hover:not(:disabled) {
  background: #e0e0e0;
  border-color: #42b883;
}

.quick-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
