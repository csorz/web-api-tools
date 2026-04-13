<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Tab state
const activeTab = ref<'concept' | 'demo' | 'code'>('concept')

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
  error.value = t('serial.sendDataNotImplemented', { api: 'Bluetooth' })
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
      <h1>{{ t('bluetooth.title') }}</h1>
      <p class="subtitle">{{ t('bluetooth.subtitle') }}</p>
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
          <h2>{{ t('bluetooth.concept.whatIs') }}</h2>
          <p>{{ t('bluetooth.concept.whatIsDesc') }}</p>

          <h3>{{ t('bluetooth.concept.coreConcepts') }}</h3>
          <div class="concept-grid">
            <div class="concept-card">
              <h4>{{ t('bluetooth.concept.bluetoothDevice') }}</h4>
              <p>{{ t('bluetooth.concept.bluetoothDeviceDesc') }}</p>
            </div>
            <div class="concept-card">
              <h4>{{ t('bluetooth.concept.gattServer') }}</h4>
              <p>{{ t('bluetooth.concept.gattServerDesc') }}</p>
            </div>
            <div class="concept-card">
              <h4>{{ t('bluetooth.concept.service') }}</h4>
              <p>{{ t('bluetooth.concept.serviceDesc') }}</p>
            </div>
            <div class="concept-card">
              <h4>{{ t('bluetooth.concept.characteristic') }}</h4>
              <p>{{ t('bluetooth.concept.characteristicDesc') }}</p>
            </div>
          </div>

          <h3>{{ t('bluetooth.concept.gattHierarchy') }}</h3>
          <div class="gatt-hierarchy">
            <div class="hierarchy-item">
              <span class="hierarchy-icon">📱</span>
              <span>{{ t('bluetooth.concept.device') }}</span>
            </div>
            <div class="hierarchy-arrow">↓</div>
            <div class="hierarchy-item">
              <span class="hierarchy-icon">🖥️</span>
              <span>GATT Server</span>
            </div>
            <div class="hierarchy-arrow">↓</div>
            <div class="hierarchy-item">
              <span class="hierarchy-icon">📦</span>
              <span>{{ t('bluetooth.concept.service') }}</span>
            </div>
            <div class="hierarchy-arrow">↓</div>
            <div class="hierarchy-item">
              <span class="hierarchy-icon">📝</span>
              <span>{{ t('bluetooth.concept.characteristic') }}</span>
            </div>
          </div>

          <h3>{{ t('bluetooth.concept.commonServices') }}</h3>
          <table class="param-table">
            <thead>
              <tr>
                <th>{{ t('bluetooth.concept.serviceName') }}</th>
                <th>{{ t('bluetooth.concept.uuid') }}</th>
                <th>{{ t('usb.concept.usage') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ t('bluetooth.concept.genericAccess') }}</td>
                <td>0x1800</td>
                <td>{{ t('bluetooth.concept.genericAccessDesc') }}</td>
              </tr>
              <tr>
                <td>{{ t('bluetooth.concept.deviceInfo') }}</td>
                <td>0x180A</td>
                <td>{{ t('bluetooth.concept.deviceInfoDesc') }}</td>
              </tr>
              <tr>
                <td>{{ t('bluetooth.concept.batteryService') }}</td>
                <td>0x180F</td>
                <td>{{ t('bluetooth.concept.batteryServiceDesc') }}</td>
              </tr>
              <tr>
                <td>{{ t('bluetooth.concept.heartRate') }}</td>
                <td>0x180D</td>
                <td>{{ t('bluetooth.concept.heartRateDesc') }}</td>
              </tr>
            </tbody>
          </table>

          <h3>{{ t('serial.concept.compatibility') }}</h3>
          <div class="compat-info">
            <p><strong>{{ t('serial.concept.supported') }}：</strong>Chrome 56+、Edge 79+、Opera 43+</p>
            <p><strong>{{ t('serial.concept.notSupported') }}：</strong>{{ t('common.browserBluetoothNote') }}</p>
            <p><strong>{{ t('serial.concept.requirement') }}：</strong>{{ t('common.httpsOrLocalhost') }}</p>
          </div>
        </section>
      </div>

      <!-- 交互演示 Tab -->
      <div v-if="activeTab === 'demo'" class="tab-content">
        <div v-if="!isSupported" class="not-supported">
          <p>{{ t('common.notSupported') }}</p>
          <p>{{ t('common.browserRequired', { browsers: t('common.browserBluetooth') }) }}</p>
        </div>

        <template v-else>
          <section class="control-panel">
            <div class="control-row">
              <button
                class="btn btn-scan"
                :disabled="connected"
                @click="scanDevices"
              >
                {{ t('bluetooth.scanDevice') }}
              </button>

              <button
                v-if="!connected"
                class="btn btn-primary"
                :disabled="!selectedDevice"
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
            </div>

            <div v-if="selectedDevice" class="device-info">
              <h3>{{ t('usb.selectedDevice') }}</h3>
              <p><strong>{{ t('bluetooth.deviceName') }}:</strong> {{ selectedDevice.name }}</p>
            </div>

            <div v-if="error" class="error-message">
              {{ error }}
              <button class="btn-clear" @click="clearError">×</button>
            </div>

            <div v-if="connected" class="status-connected">
              {{ t('common.connected') }}
            </div>
          </section>

          <section class="data-section">
            <div class="data-display">
              <h3>{{ t('usb.receiveData') }}</h3>
              <pre class="data-content">{{ data || t('common.noData') }}</pre>
              <button class="btn btn-secondary" @click="clearData">{{ t('common.clear') }}</button>
            </div>
          </section>

          <section class="sender-section">
            <div class="data-sender">
              <h3>{{ t('usb.sendData') }}</h3>
              <textarea
                v-model="data"
                :placeholder="t('usb.inputPlaceholder')"
                :disabled="!connected"
              ></textarea>
              <button
                class="btn btn-primary"
                :disabled="!connected"
                @click="handleSend(data)"
              >
                {{ t('common.send') }}
              </button>
            </div>
          </section>
        </template>
      </div>

      <!-- 代码示例 Tab -->
      <div v-if="activeTab === 'code'" class="tab-content">
        <section class="code-section">
          <h3>{{ t('codeExamples.bluetooth.requestDevice') }}</h3>
          <pre class="code-block"><code>// {{ t('codeExamples.bluetooth.requestDeviceComment') }}
const device = await navigator.bluetooth.requestDevice({
  filters: [{ services: ['battery_service'] }],
  optionalServices: ['generic_access']
});

// {{ t('codeExamples.bluetooth.listenDisconnect') }}
device.addEventListener('gattserverdisconnected', () => {
  console.log('Device disconnected');
});</code></pre>

          <h3>{{ t('codeExamples.bluetooth.connectGatt') }}</h3>
          <pre class="code-block"><code>// {{ t('codeExamples.bluetooth.connectGattComment') }}
const server = await device.gatt.connect();

// {{ t('codeExamples.bluetooth.connectGattComment2') }}
device.gatt.disconnect();

// {{ t('codeExamples.bluetooth.connectGattComment3') }}
if (device.gatt.connected) {
  console.log('Device is connected');
}</code></pre>

          <h3>{{ t('codeExamples.bluetooth.getService') }}</h3>
          <pre class="code-block"><code>// {{ t('codeExamples.bluetooth.getServiceComment') }}
const service = await server.getPrimaryService('battery_service');

// {{ t('codeExamples.bluetooth.getServiceComment2') }}
const characteristic = await service.getCharacteristic('battery_level');

// {{ t('codeExamples.bluetooth.getServiceComment3') }}
const services = await server.getPrimaryServices();

// {{ t('codeExamples.bluetooth.getServiceComment4') }}
const characteristics = await service.getCharacteristics();</code></pre>

          <h3>{{ t('codeExamples.bluetooth.readChar') }}</h3>
          <pre class="code-block"><code>// {{ t('codeExamples.bluetooth.readCharComment') }}
const value = await characteristic.readValue();
console.log('Battery level:', value.getUint8(0));</code></pre>

          <h3>{{ t('codeExamples.bluetooth.writeChar') }}</h3>
          <pre class="code-block"><code>// {{ t('codeExamples.bluetooth.writeCharComment') }}
const data = new Uint8Array([0x01]);
await characteristic.writeValueWithResponse(data);

// {{ t('codeExamples.bluetooth.writeCharComment2') }}
await characteristic.writeValueWithoutResponse(data);</code></pre>

          <h3>{{ t('codeExamples.bluetooth.notifications') }}</h3>
          <pre class="code-block"><code>// {{ t('codeExamples.bluetooth.notificationsComment') }}
await characteristic.startNotifications();

// {{ t('codeExamples.bluetooth.notificationsComment2') }}
characteristic.addEventListener('characteristicvaluechanged', (event) => {
  const value = event.target.value;
  console.log('Value changed:', value.getUint8(0));
});

// {{ t('codeExamples.bluetooth.notificationsComment3') }}
await characteristic.stopNotifications();</code></pre>

          <h3>{{ t('codeExamples.bluetooth.checkAvailability') }}</h3>
          <pre class="code-block"><code>// {{ t('codeExamples.bluetooth.checkAvailabilityComment') }}
const available = await navigator.bluetooth.getAvailability();
if (available) {
  console.log('Bluetooth is available');
}</code></pre>
        </section>
      </div>
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
  color: #00bcd4;
}

.concept-card p {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.gatt-hierarchy {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: #e0f7fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.hierarchy-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fff;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
}

.hierarchy-icon {
  font-size: 18px;
}

.hierarchy-arrow {
  font-size: 16px;
  color: #00bcd4;
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
