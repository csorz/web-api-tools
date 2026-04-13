<script setup lang="ts">
defineProps<{
  connected: boolean
  reading: boolean
  error?: string | null
}>()

function getStatusText(connected: boolean, reading: boolean): string {
  if (reading) return '读取中'
  if (connected) return '已连接'
  return '未连接'
}

function getStatusClass(connected: boolean, reading: boolean, error?: string | null): string {
  if (error) return 'status-error'
  if (reading) return 'status-reading'
  if (connected) return 'status-connected'
  return 'status-disconnected'
}
</script>

<template>
  <div class="connection-status">
    <span
      class="status-indicator"
      :class="getStatusClass(connected, reading, error)"
    ></span>
    <span class="status-text">
      {{ error || getStatusText(connected, reading) }}
    </span>
  </div>
</template>

<style scoped>
.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-connected {
  background: #42b883;
}

.status-reading {
  background: #ff9800;
}

.status-disconnected {
  background: #9e9e9e;
}

.status-error {
  background: #f44336;
}

.status-text {
  font-size: 14px;
  color: #333;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
