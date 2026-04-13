<script setup lang="ts">
import type { SerialPort } from '@/types/serial'

const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  scan: [port: SerialPort]
  error: [message: string]
}>()

async function handleScan() {
  try {
    // 总是弹出选择对话框让用户选择串口
    const port = await navigator.serial.requestPort()
    emit('scan', port)
  } catch (e) {
    emit('error', (e as Error).message)
  }
}
</script>

<template>
  <button
    class="scan-button"
    :disabled="disabled"
    @click="handleScan"
  >
    <slot>扫描串口</slot>
  </button>
</template>

<style scoped>
.scan-button {
  padding: 10px 20px;
  font-size: 14px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.scan-button:hover:not(:disabled) {
  background: #35a070;
}

.scan-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
