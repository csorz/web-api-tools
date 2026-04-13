# Multi-Serial Port Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor single serial port UI into a multi-port layout with left-right panels, supporting independent operation and future master-slave modes.

**Architecture:** Extract SerialPanel component from App.vue, create useSerialManager for multi-port state management, implement responsive flex layout for side-by-side panels.

**Tech Stack:** Vue 3 Composition API, TypeScript, Web Serial API, CSS Flexbox

---

## File Structure

```
src/
├── App.vue                      # Refactor: use SerialPanel + GlobalToolbar
├── components/
│   ├── GlobalToolbar.vue        # Create: mode switch, add/remove ports
│   ├── SerialPanel.vue          # Create: extracted from App.vue
│   ├── ScanButton.vue           # Keep: no changes
│   ├── DataDisplay.vue          # Keep: no changes
│   ├── DataSender.vue           # Keep: no changes
│   └── ConnectionStatus.vue     # Keep: no changes
├── composables/
│   ├── useSerial.ts             # Keep: no changes
│   └── useSerialManager.ts      # Create: multi-port manager
├── types/
│   └── serial.d.ts              # Modify: add new types
└── styles/
    └── main.css                 # Modify: responsive styles
```

---

## Phase 1: Type Definitions

### Task 1: Add New Types to serial.d.ts

**Files:**
- Modify: `src/types/serial.d.ts`

- [ ] **Step 1: Add new type definitions**

```typescript
// Add to existing file after the current types

/**
 * 串口角色
 */
export type SerialRole = 'master' | 'slave' | 'independent'

/**
 * 工作模式
 */
export type WorkMode = 'independent' | 'broadcast' | 'gather' | 'master-slave'

/**
 * 串口配置
 */
export interface SerialPortConfig {
  id: string
  name: string
  role: SerialRole
  port: SerialPort | null
  connected: boolean
  reading: boolean
  error: string | null
  data: string
  portInfo: SerialPortInfo | null
}

/**
 * 串口连接选项
 */
export interface SerialConnectionOptions extends SerialOptions {
  baudRate: number
  dataBits?: 7 | 8
  stopBits?: 1 | 2
  parity?: 'none' | 'even' | 'odd'
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/serial.d.ts
git commit -m "feat: add multi-serial types (SerialRole, WorkMode, SerialPortConfig)"
```

---

## Phase 2: Multi-Port Manager

### Task 2: Create useSerialManager Composable

**Files:**
- Create: `src/composables/useSerialManager.ts`

- [ ] **Step 1: Create the composable with core state**

```typescript
import { ref, computed } from 'vue'
import type { SerialPortConfig, SerialRole, WorkMode, SerialConnectionOptions } from '@/types/serial'
import { useSerial } from './useSerial'

export function useSerialManager() {
  // 状态
  const ports = ref<SerialPortConfig[]>([])
  const mode = ref<WorkMode>('independent')
  const masterId = ref<string | null>(null)

  // 每个串口独立的 useSerial 实例
  const serialInstances = new Map<string, ReturnType<typeof useSerial>>()

  // 生成唯一 ID
  function generateId(): string {
    return `port-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // 计算属性
  const connectedCount = computed(() =>
    ports.value.filter(p => p.connected).length
  )

  const masterPort = computed(() =>
    ports.value.find(p => p.id === masterId.value) || null
  )

  const slavePorts = computed(() =>
    ports.value.filter(p => p.role === 'slave')
  )

  return {
    ports,
    mode,
    masterId,
    connectedCount,
    masterPort,
    slavePorts,
    generateId,
    serialInstances
  }
}
```

- [ ] **Step 2: Add port management methods**

```typescript
// Add inside useSerialManager function, before the return statement

  /**
   * 添加新串口
   */
  async function addPort(): Promise<string> {
    const id = generateId()
    const newPort: SerialPortConfig = {
      id,
      name: `串口 ${ports.value.length + 1}`,
      role: 'independent',
      port: null,
      connected: false,
      reading: false,
      error: null,
      data: '',
      portInfo: null
    }

    // 创建独立的 useSerial 实例
    serialInstances.set(id, useSerial())
    ports.value.push(newPort)

    return id
  }

  /**
   * 移除串口
   */
  async function removePort(id: string): Promise<void> {
    const index = ports.value.findIndex(p => p.id === id)
    if (index === -1) return

    // 断开连接
    await disconnect(id)

    // 清理实例
    serialInstances.delete(id)
    ports.value.splice(index, 1)

    // 如果移除的是主串口，清除主串口引用
    if (masterId.value === id) {
      masterId.value = null
    }
  }

  /**
   * 设置串口角色
   */
  function setRole(id: string, role: SerialRole): void {
    const port = ports.value.find(p => p.id === id)
    if (!port) return

    port.role = role

    // 如果设置为主串口，更新 masterId
    if (role === 'master') {
      // 将其他主串口降级为独立
      ports.value.forEach(p => {
        if (p.id !== id && p.role === 'master') {
          p.role = 'independent'
        }
      })
      masterId.value = id
    } else if (masterId.value === id) {
      masterId.value = null
    }
  }

  /**
   * 设置工作模式
   */
  function setMode(newMode: WorkMode): void {
    mode.value = newMode
  }
```

- [ ] **Step 3: Add connection management methods**

```typescript
// Add inside useSerialManager function, before the return statement

  /**
   * 获取串口实例
   */
  function getSerialInstance(id: string) {
    return serialInstances.get(id)
  }

  /**
   * 连接串口
   */
  async function connect(id: string, port: SerialPort, options?: SerialConnectionOptions): Promise<void> {
    const instance = getSerialInstance(id)
    const config = ports.value.find(p => p.id === id)

    if (!instance || !config) return

    try {
      await instance.connect(port, options)
      config.connected = true
      config.port = port
      config.portInfo = instance.portInfo.value
    } catch (e) {
      config.error = (e as Error).message
      throw e
    }
  }

  /**
   * 断开串口
   */
  async function disconnect(id: string): Promise<void> {
    const instance = getSerialInstance(id)
    const config = ports.value.find(p => p.id === id)

    if (!instance || !config) return

    await instance.disconnect()
    config.connected = false
    config.reading = false
    config.port = null
    config.portInfo = null
    config.data = ''
    config.error = null
  }

  /**
   * 开始读取
   */
  function startRead(id: string): void {
    const instance = getSerialInstance(id)
    const config = ports.value.find(p => p.id === id)

    if (!instance || !config || !config.connected) return

    instance.startRead()
    config.reading = true

    // 监听数据变化
    const unwatch = watch(instance.data, (newData) => {
      config.data = newData

      // 根据模式处理数据转发
      handleDataFlow(id, newData)
    })
  }

  /**
   * 停止读取
   */
  function stopRead(id: string): void {
    const instance = getSerialInstance(id)
    const config = ports.value.find(p => p.id === id)

    if (!instance || !config) return

    instance.stopRead()
    config.reading = false
  }

  /**
   * 发送数据
   */
  async function write(id: string, data: string | Uint8Array): Promise<void> {
    const instance = getSerialInstance(id)
    if (!instance) return

    await instance.write(data)
  }

  /**
   * 清空数据
   */
  function clearData(id: string): void {
    const instance = getSerialInstance(id)
    const config = ports.value.find(p => p.id === id)

    if (instance) instance.clearData()
    if (config) config.data = ''
  }

  /**
   * 清除错误
   */
  function clearError(id: string): void {
    const instance = getSerialInstance(id)
    const config = ports.value.find(p => p.id === id)

    if (instance) instance.clearError()
    if (config) config.error = null
  }
```

- [ ] **Step 4: Add data flow methods for master-slave modes**

```typescript
// Add inside useSerialManager function, before the return statement

  /**
   * 处理数据流（主从模式）
   */
  async function handleDataFlow(sourceId: string, data: string): Promise<void> {
    if (mode.value === 'independent') return

    const sourcePort = ports.value.find(p => p.id === sourceId)
    if (!sourcePort) return

    switch (mode.value) {
      case 'broadcast':
        // 主串口接收数据 → 广播到所有从串口
        if (sourcePort.role === 'master') {
          for (const slave of slavePorts.value) {
            if (slave.connected) {
              await write(slave.id, data)
            }
          }
        }
        break

      case 'gather':
        // 从串口接收数据 → 发送到主串口
        if (sourcePort.role === 'slave' && masterPort.value?.connected) {
          await write(masterPort.value.id, data)
        }
        break

      case 'master-slave':
        // 双向：主广播，从汇聚
        if (sourcePort.role === 'master') {
          for (const slave of slavePorts.value) {
            if (slave.connected) {
              await write(slave.id, data)
            }
          }
        } else if (sourcePort.role === 'slave' && masterPort.value?.connected) {
          await write(masterPort.value.id, data)
        }
        break
    }
  }

  /**
   * 广播数据到所有从串口
   */
  async function broadcast(data: string | Uint8Array): Promise<void> {
    for (const slave of slavePorts.value) {
      if (slave.connected) {
        await write(slave.id, data)
      }
    }
  }
```

- [ ] **Step 5: Add imports and watch**

```typescript
// Update the imports at the top of the file
import { ref, computed, watch } from 'vue'
import type { SerialPort, SerialPortInfo, SerialRole, WorkMode, SerialConnectionOptions } from '@/types/serial'
import { useSerial } from './useSerial'
```

- [ ] **Step 6: Update return statement**

```typescript
// Update the return statement to include all methods

  return {
    // 状态
    ports,
    mode,
    masterId,
    connectedCount,
    masterPort,
    slavePorts,

    // 串口管理
    addPort,
    removePort,
    setRole,
    setMode,

    // 连接管理
    connect,
    disconnect,
    startRead,
    stopRead,
    write,
    clearData,
    clearError,

    // 数据流
    broadcast,

    // 内部方法
    getSerialInstance,
    generateId
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add src/composables/useSerialManager.ts
git commit -m "feat: add useSerialManager for multi-port state management"
```

---

## Phase 3: UI Components

### Task 3: Create SerialPanel Component

**Files:**
- Create: `src/components/SerialPanel.vue`

- [ ] **Step 1: Create the component template and script**

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSerial } from '@/composables/useSerial'
import ScanButton from '@/components/ScanButton.vue'
import ConnectionStatus from '@/components/ConnectionStatus.vue'
import DataDisplay from '@/components/DataDisplay.vue'
import DataSender from '@/components/DataSender.vue'
import type { SerialPort, SerialRole } from '@/types/serial'

const props = defineProps<{
  id: string
  name: string
  role: SerialRole
}>()

const emit = defineEmits<{
  (e: 'roleChange', id: string, role: SerialRole): void
}>()

const {
  connected,
  reading,
  error,
  data,
  portInfo,
  isSupported,
  scanPorts,
  connect,
  startRead,
  stopRead,
  write,
  disconnect,
  clearData,
  clearError
} = useSerial()

const baudRate = ref(9600)
const dataBits = ref<7 | 8>(8)
const stopBits = ref<1 | 2>(1)
const parity = ref<'none' | 'even' | 'odd'>('none')
const selectedPort = ref<SerialPort | null>(null)
const availablePorts = ref<SerialPort[]>([])

// 获取已授权的串口列表
async function loadAuthorizedPorts() {
  try {
    const ports = await navigator.serial.getPorts()
    availablePorts.value = ports
    if (ports.length > 0 && !selectedPort.value) {
      selectedPort.value = ports[0]
    }
  } catch (e) {
    console.error('获取已授权串口失败:', e)
  }
}

// 组件挂载时加载已授权的串口
onMounted(() => {
  if (isSupported.value) {
    loadAuthorizedPorts()
  }
})

// 获取串口显示名称
function getPortLabel(port: SerialPort, index: number): string {
  const info = port.getInfo()
  if (info.usbVendorId && info.usbProductId) {
    return `串口 ${index + 1} (VID:${info.usbVendorId.toString(16).padStart(4, '0')} / PID:${info.usbProductId.toString(16).padStart(4, '0')})`
  }
  return `串口 ${index + 1}`
}

// 判断是否为当前选中的串口
function isPortSelected(port: SerialPort): boolean {
  return selectedPort.value === port
}

// 选择串口
async function selectPort(port: SerialPort) {
  if (connected.value) {
    await disconnect()
  }
  selectedPort.value = port
  clearError()
}

async function handleScan(port: SerialPort) {
  selectedPort.value = port
  await loadAuthorizedPorts()
  clearError()
}

async function handleConnect() {
  if (!selectedPort.value) {
    try {
      const ports = await scanPorts()
      if (ports.length > 0) {
        selectedPort.value = ports[0]
      }
    } catch (e) {
      return
    }
  }

  if (selectedPort.value) {
    try {
      await connect(selectedPort.value, {
        baudRate: baudRate.value,
        dataBits: dataBits.value,
        stopBits: stopBits.value,
        parity: parity.value
      })
    } catch (e) {
      // error 已在 composable 中处理
    }
  }
}

async function handleDisconnect() {
  await disconnect()
  selectedPort.value = null
}

function handleStartRead() {
  startRead()
}

function handleStopRead() {
  stopRead()
}

async function handleSend(data: string | Uint8Array) {
  try {
    await write(data)
  } catch (e) {
    // error 已在 composable 中处理
  }
}

// 角色变更
function handleRoleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const newRole = target.value as SerialRole
  emit('roleChange', props.id, newRole)
}

// 角色显示名称
const roleLabel = computed(() => {
  switch (props.role) {
    case 'master': return '主'
    case 'slave': return '从'
    default: return '独立'
  }
})
</script>

<template>
  <div class="serial-panel">
    <!-- 面板头部 -->
    <div class="panel-header">
      <div class="panel-title">
        <span class="panel-name">{{ name }}</span>
        <span class="panel-role" :class="role">{{ roleLabel }}</span>
      </div>
      <div class="role-selector">
        <label>角色:</label>
        <select :value="role" @change="handleRoleChange" :disabled="connected">
          <option value="independent">独立</option>
          <option value="master">主</option>
          <option value="slave">从</option>
        </select>
      </div>
    </div>

    <!-- 串口参数配置 -->
    <div class="config-panel">
      <div class="config-grid">
        <div class="config-item">
          <label>波特率</label>
          <select v-model="baudRate" :disabled="connected">
            <option :value="9600">9600</option>
            <option :value="19200">19200</option>
            <option :value="38400">38400</option>
            <option :value="57600">57600</option>
            <option :value="115200">115200</option>
          </select>
        </div>

        <div class="config-item">
          <label>数据位</label>
          <select v-model="dataBits" :disabled="connected">
            <option :value="8">8</option>
            <option :value="7">7</option>
          </select>
        </div>

        <div class="config-item">
          <label>停止位</label>
          <select v-model="stopBits" :disabled="connected">
            <option :value="1">1</option>
            <option :value="2">2</option>
          </select>
        </div>

        <div class="config-item">
          <label>校验位</label>
          <select v-model="parity" :disabled="connected">
            <option value="none">无</option>
            <option value="even">偶</option>
            <option value="odd">奇</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 扫描和连接 -->
    <div class="control-row">
      <ScanButton
        :disabled="connected"
        @scan="handleScan"
        @error="clearError"
      >
        {{ connected ? '已连接' : '扫描串口' }}
      </ScanButton>

      <button
        v-if="!connected"
        class="btn btn-primary"
        @click="handleConnect"
      >
        连接
      </button>
      <button
        v-else
        class="btn btn-danger"
        @click="handleDisconnect"
      >
        断开
      </button>

      <button
        v-if="connected && !reading"
        class="btn btn-success"
        @click="handleStartRead"
      >
        开始读取
      </button>
      <button
        v-if="reading"
        class="btn btn-warning"
        @click="handleStopRead"
      >
        停止读取
      </button>
    </div>

    <!-- 已授权的串口列表 -->
    <div v-if="availablePorts.length > 0" class="port-list">
      <div class="port-list-header">已授权的串口设备</div>
      <div class="port-list-items">
        <button
          v-for="(port, index) in availablePorts"
          :key="index"
          class="port-item"
          :class="{ active: isPortSelected(port) }"
          :disabled="connected && !isPortSelected(port)"
          @click="selectPort(port)"
        >
          <span class="port-icon">🔌</span>
          <span class="port-label">{{ getPortLabel(port, index) }}</span>
          <span v-if="isPortSelected(port) && connected" class="port-status connected">已连接</span>
          <span v-else-if="isPortSelected(port)" class="port-status selected">已选中</span>
        </button>
      </div>
    </div>

    <!-- 状态显示 -->
    <ConnectionStatus
      :connected="connected"
      :reading="reading"
      :error="error"
    />

    <!-- 设备信息 -->
    <div v-if="portInfo" class="port-info">
      <span>VID: {{ portInfo.usbVendorId?.toString(16) || 'N/A' }}</span>
      <span>PID: {{ portInfo.usbProductId?.toString(16) || 'N/A' }}</span>
    </div>

    <!-- 数据显示 -->
    <DataDisplay :data="data" @clear="clearData" />

    <!-- 数据发送 -->
    <DataSender :disabled="!connected" @send="handleSend" />
  </div>
</template>

<style scoped>
.serial-panel {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.panel-role {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  background: #e0e0e0;
  color: #666;
}

.panel-role.master {
  background: #fff3e0;
  color: #e65100;
}

.panel-role.slave {
  background: #e3f2fd;
  color: #1565c0;
}

.role-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-selector label {
  font-size: 12px;
  color: #666;
}

.role-selector select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.config-panel {
  background: #f9f9f9;
  border-radius: 6px;
  padding: 12px;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

@media (max-width: 600px) {
  .config-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.config-item label {
  font-size: 11px;
  color: #666;
}

.config-item select {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  background: white;
}

.config-item select:disabled {
  background: #f0f0f0;
}

.control-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  font-size: 13px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #42b883;
  color: white;
}

.btn-primary:hover {
  background: #35a070;
}

.btn-danger {
  background: #f44336;
  color: white;
}

.btn-danger:hover {
  background: #d32f2f;
}

.btn-success {
  background: #4caf50;
  color: white;
}

.btn-success:hover {
  background: #43a047;
}

.btn-warning {
  background: #ff9800;
  color: white;
}

.btn-warning:hover {
  background: #f57c00;
}

.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.port-list {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.port-list-header {
  padding: 6px 10px;
  background: #f5f5f5;
  font-size: 11px;
  color: #666;
  border-bottom: 1px solid #e0e0e0;
}

.port-list-items {
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.port-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.port-item:hover:not(:disabled) {
  border-color: #42b883;
  background: #f9fff9;
}

.port-item.active {
  border-color: #42b883;
  background: #e8f5e9;
}

.port-item:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.port-icon {
  font-size: 14px;
}

.port-label {
  flex: 1;
  font-size: 12px;
  color: #333;
  font-family: monospace;
}

.port-status {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
}

.port-status.selected {
  background: #e3f2fd;
  color: #1976d2;
}

.port-status.connected {
  background: #e8f5e9;
  color: #2e7d32;
}

.port-info {
  display: flex;
  gap: 12px;
  padding: 6px 10px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 11px;
  color: #666;
  font-family: monospace;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SerialPanel.vue
git commit -m "feat: create SerialPanel component extracted from App.vue"
```

---

### Task 4: Create GlobalToolbar Component

**Files:**
- Create: `src/components/GlobalToolbar.vue`

- [ ] **Step 1: Create the component**

```vue
<script setup lang="ts">
import type { WorkMode } from '@/types/serial'

const props = defineProps<{
  mode: WorkMode
  portCount: number
}>()

const emit = defineEmits<{
  (e: 'modeChange', mode: WorkMode): void
  (e: 'addPort'): void
  (e: 'removePort'): void
}>()

function handleModeChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('modeChange', target.value as WorkMode)
}

const modeOptions = [
  { value: 'independent', label: '独立模式' },
  { value: 'broadcast', label: '广播模式 (主→从)' },
  { value: 'gather', label: '汇聚模式 (从→主)' },
  { value: 'master-slave', label: '主从控制' }
]
</script>

<template>
  <div class="global-toolbar">
    <div class="toolbar-left">
      <h1 class="app-title">Web Serial API</h1>
      <span class="port-count">{{ portCount }} 个串口</span>
    </div>

    <div class="toolbar-right">
      <div class="mode-selector">
        <label>模式:</label>
        <select :value="mode" @change="handleModeChange">
          <option v-for="opt in modeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <button class="toolbar-btn add" @click="$emit('addPort')">
        <span class="icon">+</span>
        添加串口
      </button>

      <button
        class="toolbar-btn remove"
        @click="$emit('removePort')"
        :disabled="portCount <= 1"
      >
        <span class="icon">−</span>
        移除串口
      </button>
    </div>
  </div>
</template>

<style scoped>
.global-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #42b883;
  color: white;
  border-radius: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.port-count {
  font-size: 12px;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.mode-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mode-selector label {
  font-size: 13px;
}

.mode-selector select {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  background: white;
  color: #333;
  cursor: pointer;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn .icon {
  font-size: 16px;
  font-weight: bold;
}

.toolbar-btn.add {
  background: white;
  color: #42b883;
}

.toolbar-btn.add:hover {
  background: #e8f5e9;
}

.toolbar-btn.remove {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.toolbar-btn.remove:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
}

.toolbar-btn.remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .global-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-right {
    justify-content: center;
  }
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/GlobalToolbar.vue
git commit -m "feat: create GlobalToolbar component for mode and port management"
```

---

### Task 5: Refactor App.vue

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: Replace App.vue content**

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useSerialManager } from '@/composables/useSerialManager'
import GlobalToolbar from '@/components/GlobalToolbar.vue'
import SerialPanel from '@/components/SerialPanel.vue'
import type { WorkMode, SerialRole } from '@/types/serial'

const {
  ports,
  mode,
  masterId,
  connectedCount,
  addPort,
  removePort,
  setRole,
  setMode
} = useSerialManager()

// 初始化两个串口
onMounted(async () => {
  await addPort()
  await addPort()
})

// 处理模式变更
function handleModeChange(newMode: WorkMode) {
  setMode(newMode)
}

// 处理角色变更
function handleRoleChange(portId: string, role: SerialRole) {
  setRole(portId, role)
}

// 移除最后一个串口
async function handleRemovePort() {
  if (ports.value.length > 1) {
    const lastPort = ports.value[ports.value.length - 1]
    await removePort(lastPort.id)
  }
}
</script>

<template>
  <div class="app">
    <!-- 不支持提示 -->
    <div v-if="!('serial' in navigator)" class="not-supported">
      <h2>浏览器不支持</h2>
      <p>您的浏览器不支持 Web Serial API</p>
      <p>请使用 Chrome 89+、Edge 89+ 或 Opera 76+</p>
    </div>

    <template v-else>
      <!-- 全局工具栏 -->
      <GlobalToolbar
        :mode="mode"
        :port-count="ports.length"
        @mode-change="handleModeChange"
        @add-port="addPort"
        @remove-port="handleRemovePort"
      />

      <!-- 串口面板容器 -->
      <div class="serial-container">
        <SerialPanel
          v-for="port in ports"
          :key="port.id"
          :id="port.id"
          :name="port.name"
          :role="port.role"
          @role-change="handleRoleChange"
        />
      </div>

      <!-- 页脚 -->
      <footer class="footer">
        <p>需要 HTTPS 环境或 localhost 运行</p>
      </footer>
    </template>
  </div>
</template>

<style scoped>
.app {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.not-supported {
  text-align: center;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.not-supported h2 {
  color: #f44336;
  margin-bottom: 12px;
}

.not-supported p {
  color: #666;
  margin: 8px 0;
}

.serial-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.serial-container > * {
  flex: 1 1 calc(50% - 8px);
  min-width: 320px;
}

@media (max-width: 768px) {
  .serial-container > * {
    flex: 1 1 100%;
  }
}

@media (min-width: 1200px) {
  .serial-container > * {
    flex: 1 1 calc(33.33% - 11px);
  }
}

.footer {
  text-align: center;
  margin-top: 20px;
  color: #999;
  font-size: 12px;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/App.vue
git commit -m "refactor: App.vue to use SerialPanel and GlobalToolbar"
```

---

## Phase 4: Testing and Verification

### Task 6: Run Development Server and Verify

**Files:**
- None (verification task)

- [ ] **Step 1: Start development server**

```bash
npm run dev
```

Expected: Server starts without errors

- [ ] **Step 2: Verify in browser**

1. Open the dev server URL in Chrome/Edge
2. Verify two serial panels appear side by side
3. Verify GlobalToolbar shows at top
4. Verify responsive layout (resize browser window)
5. Verify "Add Port" button adds new panel
6. Verify "Remove Port" button removes last panel
7. Verify mode selector works
8. Verify role selector in each panel works

- [ ] **Step 3: Commit if all tests pass**

```bash
git add -A
git commit -m "test: verify multi-serial layout works correctly"
```

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1 | Add type definitions |
| 2 | 2 | Create useSerialManager composable |
| 3 | 3-5 | Create UI components (SerialPanel, GlobalToolbar, refactor App.vue) |
| 4 | 6 | Testing and verification |

**Total: 6 tasks, ~20 steps**
