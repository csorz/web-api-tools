# Web API Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Vue Router with sidebar navigation for Serial, USB, HID, and Bluetooth pages.

**Architecture:** Create router configuration, extract current serial functionality to a view component, create sidebar navigation component, and refactor App.vue as layout container.

**Tech Stack:** Vue 3, Vue Router 4, TypeScript, Web Serial/USB/HID/Bluetooth APIs

---

## File Structure

```
src/
├── App.vue                    # Refactor: layout container
├── main.ts                    # Modify: add router
├── router/
│   └── index.ts               # Create: router config
├── views/
│   ├── WebSerial.vue          # Create: serial page
│   ├── WebUsb.vue             # Create: USB page
│   ├── WebHid.vue             # Create: HID page
│   └── WebBluetooth.vue       # Create: Bluetooth page
├── components/
│   └── Sidebar.vue            # Create: sidebar navigation
└── styles/
    └── main.css               # Modify: layout styles
```

---

## Phase 1: Router Setup

### Task 1: Install Vue Router

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install vue-router**

```bash
npm install vue-router@4
```

- [ ] **Step 2: Verify installation**

```bash
npm list vue-router
```

Expected: `vue-router@4.x.x`

---

### Task 2: Create Router Configuration

**Files:**
- Create: `src/router/index.ts`

- [ ] **Step 1: Create router directory and file**

```bash
mkdir -p src/router
```

- [ ] **Step 2: Write router configuration**

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/web-serial'
  },
  {
    path: '/web-serial',
    name: 'WebSerial',
    component: () => import('@/views/WebSerial.vue'),
    meta: { title: 'Web 串口' }
  },
  {
    path: '/web-usb',
    name: 'WebUsb',
    component: () => import('@/views/WebUsb.vue'),
    meta: { title: 'WebUSB' }
  },
  {
    path: '/web-hid',
    name: 'WebHid',
    component: () => import('@/views/WebHid.vue'),
    meta: { title: 'WebHID' }
  },
  {
    path: '/web-bluetooth',
    name: 'WebBluetooth',
    component: () => import('@/views/WebBluetooth.vue'),
    meta: { title: 'Web Bluetooth' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta?.title || 'Web API'} - Web API Tools`
  next()
})

export default router
```

- [ ] **Step 3: Commit**

```bash
git add src/router/index.ts
git commit -m "feat: add Vue Router configuration with four routes"
```

---

### Task 3: Update main.ts

**Files:**
- Modify: `src/main.ts`

- [ ] **Step 1: Add router to main.ts**

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/main.css'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

- [ ] **Step 2: Commit**

```bash
git add src/main.ts
git commit -m "feat: integrate Vue Router into app"
```

---

## Phase 2: View Components

### Task 4: Create WebSerial View

**Files:**
- Create: `src/views/WebSerial.vue`

- [ ] **Step 1: Create views directory**

```bash
mkdir -p src/views
```

- [ ] **Step 2: Create WebSerial.vue (migrate from App.vue)**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSerial } from '@/composables/useSerial'
import ScanButton from '@/components/ScanButton.vue'
import ConnectionStatus from '@/components/ConnectionStatus.vue'
import DataDisplay from '@/components/DataDisplay.vue'
import DataSender from '@/components/DataSender.vue'
import type { SerialPort } from '@/types/serial'

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

onMounted(() => {
  if (isSupported.value) {
    loadAuthorizedPorts()
  }
})

function getPortLabel(port: SerialPort, index: number): string {
  const info = port.getInfo()
  if (info.usbVendorId && info.usbProductId) {
    return `串口 ${index + 1} (VID:${info.usbVendorId.toString(16).padStart(4, '0')} / PID:${info.usbProductId.toString(16).padStart(4, '0')})`
  }
  return `串口 ${index + 1}`
}

function isPortSelected(port: SerialPort): boolean {
  return selectedPort.value === port
}

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
</script>

<template>
  <div class="web-serial">
    <header class="page-header">
      <h1>Web 串口</h1>
      <p class="subtitle">基于 Web Serial API 的串口通信工具</p>
    </header>

    <main class="main-content">
      <div v-if="!isSupported" class="not-supported">
        <p>您的浏览器不支持 Web Serial API</p>
        <p>请使用 Chrome 89+、Edge 89+ 或 Opera 76+</p>
      </div>

      <template v-else>
        <section class="control-panel">
          <div class="config-panel">
            <h3 class="config-title">串口参数配置</h3>
            <div class="config-grid">
              <div class="config-item">
                <label for="baudRate">波特率</label>
                <select id="baudRate" v-model="baudRate" :disabled="connected">
                  <option :value="9600">9600</option>
                  <option :value="19200">19200</option>
                  <option :value="38400">38400</option>
                  <option :value="57600">57600</option>
                  <option :value="115200">115200</option>
                </select>
              </div>

              <div class="config-item">
                <label for="dataBits">数据位</label>
                <select id="dataBits" v-model="dataBits" :disabled="connected">
                  <option :value="8">8</option>
                  <option :value="7">7</option>
                </select>
              </div>

              <div class="config-item">
                <label for="stopBits">停止位</label>
                <select id="stopBits" v-model="stopBits" :disabled="connected">
                  <option :value="1">1</option>
                  <option :value="2">2</option>
                </select>
              </div>

              <div class="config-item">
                <label for="parity">校验位</label>
                <select id="parity" v-model="parity" :disabled="connected">
                  <option value="none">无 (N)</option>
                  <option value="even">偶 (E)</option>
                  <option value="odd">奇 (O)</option>
                </select>
              </div>
            </div>
            <p class="config-hint">默认配置: 9600, 8, N, 1 (N81)</p>
          </div>

          <div class="control-row">
            <ScanButton
              :disabled="connected"
              @scan="handleScan"
              @error="clearError"
            >
              {{ connected ? '已连接' : '扫描串口' }}
            </ScanButton>
          </div>

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

          <div class="control-row">
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

          <ConnectionStatus
            :connected="connected"
            :reading="reading"
            :error="error"
          />

          <div v-if="portInfo" class="port-info">
            <span>VID: {{ portInfo.usbVendorId?.toString(16) || 'N/A' }}</span>
            <span>PID: {{ portInfo.usbProductId?.toString(16) || 'N/A' }}</span>
          </div>
        </section>

        <section class="data-section">
          <DataDisplay :data="data" @clear="clearData" />
        </section>

        <section class="sender-section">
          <DataSender :disabled="!connected" @send="handleSend" />
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped>
.web-serial {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  color: #42b883;
  font-size: 24px;
}

.subtitle {
  margin: 8px 0 0;
  color: #666;
  font-size: 14px;
}

.main-content {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.not-supported {
  text-align: center;
  padding: 40px;
  color: #f44336;
}

.not-supported p {
  margin: 8px 0;
}

.control-panel {
  margin-bottom: 20px;
}

.config-panel {
  background: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
}

.config-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.config-item label {
  font-size: 12px;
  color: #666;
}

.config-item select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.config-item select:focus {
  border-color: #42b883;
  outline: none;
}

.config-item select:disabled {
  background: #f0f0f0;
  cursor: not-allowed;
}

.config-hint {
  margin: 12px 0 0;
  font-size: 11px;
  color: #999;
}

.control-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.port-list {
  margin-bottom: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.port-list-header {
  padding: 8px 12px;
  background: #f5f5f5;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  border-bottom: 1px solid #e0e0e0;
}

.port-list-items {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.port-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
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
  font-size: 16px;
}

.port-label {
  flex: 1;
  font-size: 13px;
  color: #333;
  font-family: monospace;
}

.port-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
}

.port-status.selected {
  background: #e3f2fd;
  color: #1976d2;
}

.port-status.connected {
  background: #e8f5e9;
  color: #2e7d32;
}

.btn {
  padding: 10px 20px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
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

.port-info {
  display: flex;
  gap: 16px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  font-family: monospace;
}

.data-section {
  margin-top: 20px;
}

.sender-section {
  margin-top: 20px;
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/views/WebSerial.vue
git commit -m "feat: create WebSerial view migrated from App.vue"
```

---

### Task 5: Create WebUsb View

**Files:**
- Create: `src/views/WebUsb.vue`

- [ ] **Step 1: Create WebUsb.vue**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

interface USBDeviceInfo {
  device: USBDevice
  productName: string
  manufacturerName: string
}

const isSupported = computed(() => 'usb' in navigator)

const connected = ref(false)
const reading = ref(false)
const error = ref<string | null>(null)
const data = ref('')
const selectedDevice = ref<USBDeviceInfo | null>(null)
const availableDevices = ref<USBDevice[]>([])

async function scanDevices() {
  if (!isSupported.value) return

  try {
    const device = await navigator.usb.requestDevice({ filters: [] })
    selectedDevice.value = {
      device,
      productName: device.productName || 'Unknown Device',
      manufacturerName: device.manufacturerName || 'Unknown Manufacturer'
    }
    error.value = null
  } catch (e) {
    if ((e as Error).name !== 'NotFoundError') {
      error.value = (e as Error).message
    }
  }
}

async function handleConnect() {
  if (!selectedDevice.value) return

  try {
    await selectedDevice.value.device.open()
    if (selectedDevice.value.device.configuration === null) {
      await selectedDevice.value.device.selectConfiguration(1)
    }
    await selectedDevice.value.device.claimInterface(0)
    connected.value = true
    error.value = null
  } catch (e) {
    error.value = (e as Error).message
  }
}

async function handleDisconnect() {
  if (selectedDevice.value?.device.opened) {
    try {
      await selectedDevice.value.device.close()
    } catch (e) {
      console.error('关闭设备失败:', e)
    }
  }
  connected.value = false
  reading.value = false
}

async function handleSend(_data: string | Uint8Array) {
  // TODO: Implement USB data sending
  error.value = 'USB 数据发送功能待实现'
}

function clearData() {
  data.value = ''
}

function clearError() {
  error.value = null
}
</script>

<template>
  <div class="web-usb">
    <header class="page-header">
      <h1>WebUSB</h1>
      <p class="subtitle">基于 WebUSB API 的 USB 通信工具</p>
    </header>

    <main class="main-content">
      <div v-if="!isSupported" class="not-supported">
        <p>您的浏览器不支持 WebUSB API</p>
        <p>请使用 Chrome 61+ 或 Edge 79+</p>
      </div>

      <template v-else>
        <section class="control-panel">
          <div class="control-row">
            <button
              class="btn btn-scan"
              :disabled="connected"
              @click="scanDevices"
            >
              扫描 USB 设备
            </button>

            <button
              v-if="!connected"
              class="btn btn-primary"
              :disabled="!selectedDevice"
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
          </div>

          <div v-if="selectedDevice" class="device-info">
            <h3>已选设备</h3>
            <p><strong>产品:</strong> {{ selectedDevice.productName }}</p>
            <p><strong>厂商:</strong> {{ selectedDevice.manufacturerName }}</p>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
            <button class="btn-clear" @click="clearError">×</button>
          </div>

          <div v-if="connected" class="status-connected">
            已连接
          </div>
        </section>

        <section class="data-section">
          <div class="data-display">
            <h3>接收数据</h3>
            <pre class="data-content">{{ data || '(无数据)' }}</pre>
            <button class="btn btn-secondary" @click="clearData">清空</button>
          </div>
        </section>

        <section class="sender-section">
          <div class="data-sender">
            <h3>发送数据</h3>
            <textarea
              v-model="data"
              placeholder="输入要发送的数据..."
              :disabled="!connected"
            ></textarea>
            <button
              class="btn btn-primary"
              :disabled="!connected"
              @click="handleSend(data)"
            >
              发送
            </button>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped>
.web-usb {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  color: #42b883;
  font-size: 24px;
}

.subtitle {
  margin: 8px 0 0;
  color: #666;
  font-size: 14px;
}

.main-content {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.not-supported {
  text-align: center;
  padding: 40px;
  color: #f44336;
}

.control-panel {
  margin-bottom: 20px;
}

.control-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.btn {
  padding: 10px 20px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-scan {
  background: #2196f3;
  color: white;
}

.btn-scan:hover:not(:disabled) {
  background: #1976d2;
}

.btn-primary {
  background: #42b883;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #35a070;
}

.btn-danger {
  background: #f44336;
  color: white;
}

.btn-danger:hover {
  background: #d32f2f;
}

.btn-secondary {
  background: #757575;
  color: white;
}

.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.device-info {
  background: #f5f5f5;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

.device-info h3 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #333;
}

.device-info p {
  margin: 4px 0;
  font-size: 13px;
  color: #666;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-clear {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #c62828;
}

.status-connected {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 8px 12px;
  border-radius: 4px;
  text-align: center;
}

.data-section,
.sender-section {
  margin-top: 20px;
}

.data-display,
.data-sender {
  background: #f9f9f9;
  border-radius: 6px;
  padding: 16px;
}

.data-display h3,
.data-sender h3 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #333;
}

.data-content {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px;
  min-height: 100px;
  max-height: 300px;
  overflow: auto;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
}

.data-sender textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  resize: vertical;
  margin-bottom: 12px;
}

.data-sender textarea:disabled {
  background: #f0f0f0;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/views/WebUsb.vue
git commit -m "feat: create WebUsb view with basic USB device support"
```

---

### Task 6: Create WebHid View

**Files:**
- Create: `src/views/WebHid.vue`

- [ ] **Step 1: Create WebHid.vue**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

interface HIDDeviceInfo {
  device: HIDDevice
  productName: string
  manufacturerName: string
}

const isSupported = computed(() => 'hid' in navigator)

const connected = ref(false)
const reading = ref(false)
const error = ref<string | null>(null)
const data = ref('')
const selectedDevice = ref<HIDDeviceInfo | null>(null)

async function scanDevices() {
  if (!isSupported.value) return

  try {
    const device = await navigator.hid.requestDevice({ filters: [] })
    if (device) {
      selectedDevice.value = {
        device,
        productName: device.productName || 'Unknown Device',
        manufacturerName: device.manufacturerName || 'Unknown Manufacturer'
      }
      error.value = null
    }
  } catch (e) {
    if ((e as Error).name !== 'NotFoundError') {
      error.value = (e as Error).message
    }
  }
}

async function handleConnect() {
  if (!selectedDevice.value) return

  try {
    await selectedDevice.value.device.open()
    connected.value = true
    error.value = null
  } catch (e) {
    error.value = (e as Error).message
  }
}

async function handleDisconnect() {
  if (selectedDevice.value?.device.opened) {
    try {
      await selectedDevice.value.device.close()
    } catch (e) {
      console.error('关闭设备失败:', e)
    }
  }
  connected.value = false
  reading.value = false
}

async function handleSend(_data: string | Uint8Array) {
  error.value = 'HID 数据发送功能待实现'
}

function clearData() {
  data.value = ''
}

function clearError() {
  error.value = null
}
</script>

<template>
  <div class="web-hid">
    <header class="page-header">
      <h1>WebHID</h1>
      <p class="subtitle">基于 WebHID API 的 HID 通信工具</p>
    </header>

    <main class="main-content">
      <div v-if="!isSupported" class="not-supported">
        <p>您的浏览器不支持 WebHID API</p>
        <p>请使用 Chrome 89+ 或 Edge 89+</p>
      </div>

      <template v-else>
        <section class="control-panel">
          <div class="control-row">
            <button
              class="btn btn-scan"
              :disabled="connected"
              @click="scanDevices"
            >
              扫描 HID 设备
            </button>

            <button
              v-if="!connected"
              class="btn btn-primary"
              :disabled="!selectedDevice"
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
          </div>

          <div v-if="selectedDevice" class="device-info">
            <h3>已选设备</h3>
            <p><strong>产品:</strong> {{ selectedDevice.productName }}</p>
            <p><strong>厂商:</strong> {{ selectedDevice.manufacturerName }}</p>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
            <button class="btn-clear" @click="clearError">×</button>
          </div>

          <div v-if="connected" class="status-connected">
            已连接
          </div>
        </section>

        <section class="data-section">
          <div class="data-display">
            <h3>接收数据</h3>
            <pre class="data-content">{{ data || '(无数据)' }}</pre>
            <button class="btn btn-secondary" @click="clearData">清空</button>
          </div>
        </section>

        <section class="sender-section">
          <div class="data-sender">
            <h3>发送数据</h3>
            <textarea
              v-model="data"
              placeholder="输入要发送的数据..."
              :disabled="!connected"
            ></textarea>
            <button
              class="btn btn-primary"
              :disabled="!connected"
              @click="handleSend(data)"
            >
              发送
            </button>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped>
.web-hid {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  color: #42b883;
  font-size: 24px;
}

.subtitle {
  margin: 8px 0 0;
  color: #666;
  font-size: 14px;
}

.main-content {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.not-supported {
  text-align: center;
  padding: 40px;
  color: #f44336;
}

.control-panel {
  margin-bottom: 20px;
}

.control-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.btn {
  padding: 10px 20px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-scan {
  background: #9c27b0;
  color: white;
}

.btn-scan:hover:not(:disabled) {
  background: #7b1fa2;
}

.btn-primary {
  background: #42b883;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #35a070;
}

.btn-danger {
  background: #f44336;
  color: white;
}

.btn-danger:hover {
  background: #d32f2f;
}

.btn-secondary {
  background: #757575;
  color: white;
}

.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.device-info {
  background: #f5f5f5;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

.device-info h3 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #333;
}

.device-info p {
  margin: 4px 0;
  font-size: 13px;
  color: #666;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-clear {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #c62828;
}

.status-connected {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 8px 12px;
  border-radius: 4px;
  text-align: center;
}

.data-section,
.sender-section {
  margin-top: 20px;
}

.data-display,
.data-sender {
  background: #f9f9f9;
  border-radius: 6px;
  padding: 16px;
}

.data-display h3,
.data-sender h3 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #333;
}

.data-content {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px;
  min-height: 100px;
  max-height: 300px;
  overflow: auto;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
}

.data-sender textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  resize: vertical;
  margin-bottom: 12px;
}

.data-sender textarea:disabled {
  background: #f0f0f0;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/views/WebHid.vue
git commit -m "feat: create WebHid view with basic HID device support"
```

---

### Task 7: Create WebBluetooth View

**Files:**
- Create: `src/views/WebBluetooth.vue`

- [ ] **Step 1: Create WebBluetooth.vue**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

interface BluetoothDeviceInfo {
  device: BluetoothDevice
  name: string
}

const isSupported = computed(() => 'bluetooth' in navigator)

const connected = ref(false)
const error = ref<string | null>(null)
const data = ref('')
const selectedDevice = ref<BluetoothDeviceInfo | null>(null)

async function scanDevices() {
  if (!isSupported.value) return

  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['generic_access']
    })
    selectedDevice.value = {
      device,
      name: device.name || 'Unknown Device'
    }
    error.value = null
  } catch (e) {
    if ((e as Error).name !== 'NotFoundError') {
      error.value = (e as Error).message
    }
  }
}

async function handleConnect() {
  if (!selectedDevice.value) return

  try {
    const server = await selectedDevice.value.device.gatt?.connect()
    if (server) {
      connected.value = true
      error.value = null
    }
  } catch (e) {
    error.value = (e as Error).message
  }
}

async function handleDisconnect() {
  if (selectedDevice.value?.device.gatt?.connected) {
    selectedDevice.value.device.gatt.disconnect()
  }
  connected.value = false
}

async function handleSend(_data: string | Uint8Array) {
  error.value = 'Bluetooth 数据发送功能待实现'
}

function clearData() {
  data.value = ''
}

function clearError() {
  error.value = null
}
</script>

<template>
  <div class="web-bluetooth">
    <header class="page-header">
      <h1>Web Bluetooth</h1>
      <p class="subtitle">基于 Web Bluetooth API 的 BLE 通信工具</p>
    </header>

    <main class="main-content">
      <div v-if="!isSupported" class="not-supported">
        <p>您的浏览器不支持 Web Bluetooth API</p>
        <p>请使用 Chrome 56+、Edge 79+ 或 Opera 43+</p>
      </div>

      <template v-else>
        <section class="control-panel">
          <div class="control-row">
            <button
              class="btn btn-scan"
              :disabled="connected"
              @click="scanDevices"
            >
              扫描蓝牙设备
            </button>

            <button
              v-if="!connected"
              class="btn btn-primary"
              :disabled="!selectedDevice"
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
          </div>

          <div v-if="selectedDevice" class="device-info">
            <h3>已选设备</h3>
            <p><strong>名称:</strong> {{ selectedDevice.name }}</p>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
            <button class="btn-clear" @click="clearError">×</button>
          </div>

          <div v-if="connected" class="status-connected">
            已连接
          </div>
        </section>

        <section class="data-section">
          <div class="data-display">
            <h3>接收数据</h3>
            <pre class="data-content">{{ data || '(无数据)' }}</pre>
            <button class="btn btn-secondary" @click="clearData">清空</button>
          </div>
        </section>

        <section class="sender-section">
          <div class="data-sender">
            <h3>发送数据</h3>
            <textarea
              v-model="data"
              placeholder="输入要发送的数据..."
              :disabled="!connected"
            ></textarea>
            <button
              class="btn btn-primary"
              :disabled="!connected"
              @click="handleSend(data)"
            >
              发送
            </button>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped>
.web-bluetooth {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  color: #42b883;
  font-size: 24px;
}

.subtitle {
  margin: 8px 0 0;
  color: #666;
  font-size: 14px;
}

.main-content {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.not-supported {
  text-align: center;
  padding: 40px;
  color: #f44336;
}

.control-panel {
  margin-bottom: 20px;
}

.control-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.btn {
  padding: 10px 20px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-scan {
  background: #00bcd4;
  color: white;
}

.btn-scan:hover:not(:disabled) {
  background: #0097a7;
}

.btn-primary {
  background: #42b883;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #35a070;
}

.btn-danger {
  background: #f44336;
  color: white;
}

.btn-danger:hover {
  background: #d32f2f;
}

.btn-secondary {
  background: #757575;
  color: white;
}

.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.device-info {
  background: #f5f5f5;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

.device-info h3 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #333;
}

.device-info p {
  margin: 4px 0;
  font-size: 13px;
  color: #666;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-clear {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #c62828;
}

.status-connected {
  background: #e8f5e9;
  color: #2e7d32;
  padding: 8px 12px;
  border-radius: 4px;
  text-align: center;
}

.data-section,
.sender-section {
  margin-top: 20px;
}

.data-display,
.data-sender {
  background: #f9f9f9;
  border-radius: 6px;
  padding: 16px;
}

.data-display h3,
.data-sender h3 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #333;
}

.data-content {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px;
  min-height: 100px;
  max-height: 300px;
  overflow: auto;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
}

.data-sender textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  resize: vertical;
  margin-bottom: 12px;
}

.data-sender textarea:disabled {
  background: #f0f0f0;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/views/WebBluetooth.vue
git commit -m "feat: create WebBluetooth view with basic BLE device support"
```

---

## Phase 3: Sidebar and Layout

### Task 8: Create Sidebar Component

**Files:**
- Create: `src/components/Sidebar.vue`

- [ ] **Step 1: Create Sidebar.vue**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { to: '/web-serial', label: 'Web 串口', icon: '🔌', desc: '串口通信' },
  { to: '/web-usb', label: 'WebUSB', icon: '🔌', desc: 'USB 通信' },
  { to: '/web-hid', label: 'WebHID', icon: '⌨️', desc: 'HID 通信' },
  { to: '/web-bluetooth', label: 'Web Bluetooth', icon: '📶', desc: 'BLE 通信' }
]

const currentPath = computed(() => route.path)

function isActive(path: string): boolean {
  return currentPath.value === path
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2 class="app-title">Web API Tools</h2>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: isActive(item.to) }"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <div class="nav-content">
          <span class="nav-label">{{ item.label }}</span>
          <span class="nav-desc">{{ item.desc }}</span>
        </div>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <p>需要 HTTPS 或 localhost</p>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  height: 100vh;
  background: #1a1a2e;
  color: #fff;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.app-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #42b883;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.nav-item.active {
  background: rgba(66, 184, 131, 0.15);
  color: #42b883;
  border-right: 3px solid #42b883;
}

.nav-icon {
  font-size: 20px;
  width: 28px;
  text-align: center;
}

.nav-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-label {
  font-size: 14px;
  font-weight: 500;
}

.nav-desc {
  font-size: 11px;
  opacity: 0.7;
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }

  .app-title {
    font-size: 14px;
  }

  .nav-content {
    display: none;
  }

  .nav-item {
    justify-content: center;
    padding: 12px;
  }

  .sidebar-footer {
    display: none;
  }
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Sidebar.vue
git commit -m "feat: create Sidebar navigation component"
```

---

### Task 9: Refactor App.vue

**Files:**
- Modify: `src/App.vue`

- [ ] **Step 1: Replace App.vue with layout container**

```vue
<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
</script>

<template>
  <div class="app-layout">
    <Sidebar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.main-content {
  flex: 1;
  margin-left: 220px;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 60px;
  }
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/App.vue
git commit -m "refactor: App.vue as layout container with Sidebar"
```

---

### Task 10: Update Global Styles

**Files:**
- Modify: `src/styles/main.css`

- [ ] **Step 1: Add global layout styles**

Read the existing file first, then add these styles at the end:

```css
/* Global Layout Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
}

#app {
  height: 100%;
}

/* Scrollbar Styles */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/main.css
git commit -m "style: add global layout and scrollbar styles"
```

---

## Phase 4: Verification

### Task 11: Test and Verify

**Files:**
- None (verification task)

- [ ] **Step 1: Start development server**

```bash
npm run dev
```

Expected: Server starts without errors

- [ ] **Step 2: Verify in browser**

1. Open the dev server URL in Chrome/Edge
2. Verify sidebar appears on the left
3. Verify navigation links work:
   - Click "Web 串口" → `/web-serial`
   - Click "WebUSB" → `/web-usb`
   - Click "WebHID" → `/web-hid`
   - Click "Web Bluetooth" → `/web-bluetooth`
4. Verify active link is highlighted
5. Verify responsive layout (resize browser)

- [ ] **Step 3: Final commit if all tests pass**

```bash
git add -A
git commit -m "test: verify routing and layout work correctly"
```

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-3 | Install Vue Router, create config, update main.ts |
| 2 | 4-7 | Create view components (Serial, USB, HID, Bluetooth) |
| 3 | 8-10 | Create Sidebar, refactor App.vue, update styles |
| 4 | 11 | Testing and verification |

**Total: 11 tasks, ~22 steps**
