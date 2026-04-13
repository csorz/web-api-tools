<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSerial } from '@/composables/useSerial'
import ScanButton from '@/components/ScanButton.vue'
import ConnectionStatus from '@/components/ConnectionStatus.vue'
import DataDisplay from '@/components/DataDisplay.vue'
import DataSender from '@/components/DataSender.vue'
import type { SerialPort } from '@/types/serial'

const { t } = useI18n()

// Tab state
const activeTab = ref<'concept' | 'demo' | 'code'>('concept')

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
    console.error(t('serial.getAuthorizedPortsFailed'), e)
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
    return t('serial.portLabelWithVidPid', {
      index: index + 1,
      vid: info.usbVendorId.toString(16).padStart(4, '0'),
      pid: info.usbProductId.toString(16).padStart(4, '0')
    })
  }
  return t('serial.portLabel', { index: index + 1 })
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
      <h1>{{ t('serial.title') }}</h1>
      <p class="subtitle">{{ t('serial.subtitle') }}</p>
    </header>

    <!-- Tab Navigation -->
    <div class="tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'concept' }"
        @click="activeTab = 'concept'"
      >
        {{ t('tabs.concept') }}
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'demo' }"
        @click="activeTab = 'demo'"
      >
        {{ t('tabs.demo') }}
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'code' }"
        @click="activeTab = 'code'"
      >
        {{ t('tabs.code') }}
      </button>
    </div>

    <main class="main-content">
      <!-- 概念详解 Tab -->
      <div v-if="activeTab === 'concept'" class="tab-content">
        <section class="concept-section">
          <h2>{{ t('serial.concept.whatIs') }}</h2>
          <p>{{ t('serial.concept.whatIsDesc') }}</p>

          <h3>{{ t('serial.concept.coreConcepts') }}</h3>
          <div class="concept-grid">
            <div class="concept-card">
              <h4>{{ t('serial.concept.serialPort') }}</h4>
              <p>{{ t('serial.concept.serialPortDesc') }}</p>
            </div>
            <div class="concept-card">
              <h4>{{ t('serial.concept.serialOptions') }}</h4>
              <p>{{ t('serial.concept.serialOptionsDesc') }}</p>
            </div>
            <div class="concept-card">
              <h4>{{ t('serial.concept.readableStream') }}</h4>
              <p>{{ t('serial.concept.readableStreamDesc') }}</p>
            </div>
            <div class="concept-card">
              <h4>{{ t('serial.concept.writableStream') }}</h4>
              <p>{{ t('serial.concept.writableStreamDesc') }}</p>
            </div>
          </div>

          <h3>{{ t('serial.concept.params') }}</h3>
          <table class="param-table">
            <thead>
              <tr>
                <th>{{ t('serial.concept.param') }}</th>
                <th>{{ t('serial.concept.description') }}</th>
                <th>{{ t('serial.concept.commonValues') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>baudRate</td>
                <td>{{ t('serial.concept.baudRateDesc') }}</td>
                <td>9600, 115200</td>
              </tr>
              <tr>
                <td>dataBits</td>
                <td>{{ t('serial.concept.dataBitsDesc') }}</td>
                <td>7, 8</td>
              </tr>
              <tr>
                <td>stopBits</td>
                <td>{{ t('serial.concept.stopBitsDesc') }}</td>
                <td>1, 2</td>
              </tr>
              <tr>
                <td>parity</td>
                <td>{{ t('serial.concept.parityDesc') }}</td>
                <td>none, even, odd</td>
              </tr>
            </tbody>
          </table>

          <h3>{{ t('serial.concept.compatibility') }}</h3>
          <div class="compat-info">
            <p><strong>{{ t('serial.concept.supported') }}：</strong>Chrome 89+、Edge 89+、Opera 76+</p>
            <p><strong>{{ t('serial.concept.notSupported') }}：</strong>Firefox、Safari</p>
            <p><strong>{{ t('serial.concept.requirement') }}：</strong>{{ t('common.httpsOrLocalhost') }}</p>
          </div>
        </section>
      </div>

      <!-- 交互演示 Tab -->
      <div v-if="activeTab === 'demo'" class="tab-content">
        <div v-if="!isSupported" class="not-supported">
          <p>{{ t('common.notSupported') }}</p>
          <p>{{ t('common.browserRequired', { browsers: t('common.browserSerial') }) }}</p>
        </div>

        <template v-else>
          <section class="control-panel">
            <div class="config-panel">
              <h3 class="config-title">{{ t('serial.configTitle') }}</h3>
              <div class="config-grid">
                <div class="config-item">
                  <label for="baudRate">{{ t('serial.baudRate') }}</label>
                  <select id="baudRate" v-model="baudRate" :disabled="connected">
                    <option :value="9600">9600</option>
                    <option :value="19200">19200</option>
                    <option :value="38400">38400</option>
                    <option :value="57600">57600</option>
                    <option :value="115200">115200</option>
                  </select>
                </div>

                <div class="config-item">
                  <label for="dataBits">{{ t('serial.dataBits') }}</label>
                  <select id="dataBits" v-model="dataBits" :disabled="connected">
                    <option :value="8">8</option>
                    <option :value="7">7</option>
                  </select>
                </div>

                <div class="config-item">
                  <label for="stopBits">{{ t('serial.stopBits') }}</label>
                  <select id="stopBits" v-model="stopBits" :disabled="connected">
                    <option :value="1">1</option>
                    <option :value="2">2</option>
                  </select>
                </div>

                <div class="config-item">
                  <label for="parity">{{ t('serial.parity') }}</label>
                  <select id="parity" v-model="parity" :disabled="connected">
                    <option value="none">{{ t('serial.parityNone') }}</option>
                    <option value="even">{{ t('serial.parityEven') }}</option>
                    <option value="odd">{{ t('serial.parityOdd') }}</option>
                  </select>
                </div>
              </div>
              <p class="config-hint">{{ t('serial.defaultConfig') }}</p>
            </div>

            <div class="control-row">
              <ScanButton
                :disabled="connected"
                @scan="handleScan"
                @error="clearError"
              >
                {{ connected ? t('common.connected') : t('serial.scanPort') }}
              </ScanButton>
            </div>

            <div v-if="availablePorts.length > 0" class="port-list">
              <div class="port-list-header">{{ t('serial.authorizedPorts') }}</div>
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
                  <span v-if="isPortSelected(port) && connected" class="port-status connected">{{ t('common.connected') }}</span>
                  <span v-else-if="isPortSelected(port)" class="port-status selected">{{ t('common.selected') }}</span>
                </button>
              </div>
            </div>

            <div class="control-row">
              <button
                v-if="!connected"
                class="btn btn-primary"
                @click="handleConnect"
              >
                {{ t('common.connect') }}
              </button>
              <button
                v-else
                class="btn btn-danger"
                @click="handleDisconnect"
              >
                {{ t('common.disconnect') }}
              </button>

              <button
                v-if="connected && !reading"
                class="btn btn-success"
                @click="handleStartRead"
              >
                {{ t('serial.startRead') }}
              </button>
              <button
                v-if="reading"
                class="btn btn-warning"
                @click="handleStopRead"
              >
                {{ t('serial.stopRead') }}
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
      </div>

      <!-- 代码示例 Tab -->
      <div v-if="activeTab === 'code'" class="tab-content">
        <section class="code-section">
          <h3>{{ t('codeExamples.serial.requestPort') }}</h3>
          <pre class="code-block"><code>// {{ t('codeExamples.serial.requestPortComment') }}
const port = await navigator.serial.requestPort();

// {{ t('codeExamples.serial.getPortsComment') }}
const ports = await navigator.serial.getPorts();</code></pre>

          <h3>{{ t('codeExamples.serial.openPort') }}</h3>
          <pre class="code-block"><code>// {{ t('codeExamples.serial.openPortComment') }}
await port.open({
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none'
});</code></pre>

          <h3>{{ t('codeExamples.serial.readData') }}</h3>
          <pre class="code-block"><code>// {{ t('codeExamples.serial.readDataComment') }}
const reader = port.readable.getReader();

try {
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    // {{ t('codeExamples.serial.readDataComment2') }}
    console.log('Received:', value);
  }
} finally {
  reader.releaseLock();
}</code></pre>

          <h3>{{ t('codeExamples.serial.writeData') }}</h3>
          <pre class="code-block"><code>// {{ t('codeExamples.serial.writeDataComment') }}
const writer = port.writable.getWriter();

// {{ t('codeExamples.serial.writeDataComment2') }}
const encoder = new TextEncoder();
await writer.write(encoder.encode('Hello Serial!'));

// {{ t('codeExamples.serial.writeDataComment3') }}
await writer.write(new Uint8Array([0x01, 0x02, 0x03]));

writer.releaseLock();</code></pre>

          <h3>{{ t('codeExamples.serial.closePort') }}</h3>
          <pre class="code-block"><code>// {{ t('codeExamples.serial.closePortComment') }}
await reader.cancel();
await writer.close();

// {{ t('codeExamples.serial.closePortComment2') }}
await port.close();</code></pre>

          <h3>{{ t('codeExamples.serial.listenEvents') }}</h3>
          <pre class="code-block"><code>// {{ t('codeExamples.serial.listenConnect') }}
navigator.serial.addEventListener('connect', (e) => {
  console.log('Device connected:', e.target);
});

// {{ t('codeExamples.serial.listenDisconnect') }}
navigator.serial.addEventListener('disconnect', (e) => {
  console.log('Device disconnected:', e.target);
});</code></pre>
        </section>
      </div>
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

/* Tabs */
.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  background: #f0f0f0;
  padding: 4px;
  border-radius: 8px;
}

.tab-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #333;
}

.tab-btn.active {
  background: #fff;
  color: #42b883;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.main-content {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.tab-content {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Concept Section */
.concept-section h2 {
  margin: 0 0 16px;
  font-size: 20px;
  color: #333;
}

.concept-section h3 {
  margin: 24px 0 12px;
  font-size: 16px;
  color: #333;
}

.concept-section p {
  color: #555;
  line-height: 1.7;
}

.concept-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.concept-card {
  background: #f9f9f9;
  border-radius: 6px;
  padding: 12px;
}

.concept-card h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #42b883;
}

.concept-card p {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.param-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.param-table th,
.param-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.param-table th {
  background: #f5f5f5;
  font-weight: 500;
  color: #333;
}

.param-table td {
  color: #666;
}

.compat-info {
  background: #e3f2fd;
  border-radius: 6px;
  padding: 12px;
}

.compat-info p {
  margin: 4px 0;
  font-size: 13px;
}

/* Code Section */
.code-section h3 {
  margin: 20px 0 8px;
  font-size: 15px;
  color: #333;
}

.code-section h3:first-child {
  margin-top: 0;
}

.code-block {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.code-block code {
  color: inherit;
}

/* Demo Section */
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
