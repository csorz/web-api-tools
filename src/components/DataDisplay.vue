<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  data: string
}>()

const textarea = ref<HTMLTextAreaElement | null>(null)
const autoScroll = ref(true)

// 监听数据变化，自动滚动到底部
watch(
  () => props.data,
  () => {
    if (autoScroll.value && textarea.value) {
      nextTick(() => {
        if (textarea.value) {
          textarea.value.scrollTop = textarea.value.scrollHeight
        }
      })
    }
  }
)

function clearData() {
  emit('clear')
}

const emit = defineEmits<{
  clear: []
}>()
</script>

<template>
  <div class="data-display">
    <div class="data-header">
      <span class="data-title">接收数据</span>
      <div class="data-actions">
        <label class="auto-scroll">
          <input type="checkbox" v-model="autoScroll" />
          自动滚动
        </label>
        <button class="clear-btn" @click="clearData">清空</button>
      </div>
    </div>
    <textarea
      ref="textarea"
      class="data-content"
      :value="data"
      readonly
      placeholder="暂无数据..."
    ></textarea>
  </div>
</template>

<style scoped>
.data-display {
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.data-title {
  font-weight: 500;
  color: #333;
}

.data-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.auto-scroll {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
}

.clear-btn {
  padding: 4px 12px;
  font-size: 12px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.clear-btn:hover {
  background: #f0f0f0;
}

.data-content {
  flex: 1;
  min-height: 200px;
  padding: 12px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.5;
  border: none;
  resize: vertical;
  outline: none;
}

.data-content:focus {
  box-shadow: inset 0 0 0 1px #42b883;
}
</style>
