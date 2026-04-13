<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Tab state
const activeTab = ref<'concept' | 'demo' | 'code'>('concept')

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
    const devices = await navigator.hid.requestDevice({ filters: [] })
    if (devices.length > 0) {
      const device = devices[0]
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
      console.error(t('common.closeDeviceFailed'), e)
    }
  }
  connected.value = false
  reading.value = false
}

async function handleSend(_data: string | Uint8Array) {
  error.value = t('serial.sendDataNotImplemented', { api: 'HID' })
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
      <h1>{{ t('hid.title') }}</h1>
      <p class="subtitle">{{ t('hid.subtitle') }}</p>
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
          <h2>{{ t('hid.concept.whatIs') }}</h2>
          <p>{{ t('hid.concept.whatIsDesc') }}</p>

          <h3>{{ t('hid.concept.coreConcepts') }}</h3>
          <div class="concept-grid">
            <div class="concept-card">
              <h4>{{ t('hid.concept.hidDevice') }}</h4>
              <p>{{ t('hid.concept.hidDeviceDesc') }}</p>
            </div>
            <div class="concept-card">
              <h4>{{ t('hid.concept.report') }}</h4>
              <p>{{ t('hid.concept.reportDesc') }}</p>
            </div>
            <div class="concept-card">
              <h4>{{ t('hid.concept.collection') }}</h4>
              <p>{{ t('hid.concept.collectionDesc') }}</p>
            </div>
            <div class="concept-card">
              <h4>{{ t('hid.concept.usage') }}</h4>
              <p>{{ t('hid.concept.usageDesc') }}</p>
            </div>
          </div>

          <h3>{{ t('hid.concept.reportTypes') }}</h3>
          <table class="param-table">
            <thead>
              <tr>
                <th>{{ t('usb.concept.type') }}</th>
                <th>{{ t('hid.concept.direction') }}</th>
                <th>{{ t('common.description') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ t('hid.concept.inputReport') }}</td>
                <td>{{ t('hid.concept.inputReportDir') }}</td>
                <td>{{ t('hid.concept.inputReportDesc') }}</td>
              </tr>
              <tr>
                <td>{{ t('hid.concept.outputReport') }}</td>
                <td>{{ t('hid.concept.outputReportDir') }}</td>
                <td>{{ t('hid.concept.outputReportDesc') }}</td>
              </tr>
              <tr>
                <td>{{ t('hid.concept.featureReport') }}</td>
                <td>{{ t('hid.concept.featureReportDir') }}</td>
                <td>{{ t('hid.concept.featureReportDesc') }}</td>
              </tr>
            </tbody>
          </table>

          <h3>{{ t('hid.concept.commonDevices') }}</h3>
          <div class="device-examples">
            <ul>
              <li><strong>{{ t('hid.concept.keyboard') }}：</strong>{{ t('hid.concept.keyboardDesc') }}</li>
              <li><strong>{{ t('hid.concept.mouse') }}：</strong>{{ t('hid.concept.mouseDesc') }}</li>
              <li><strong>{{ t('hid.concept.gamepad') }}：</strong>{{ t('hid.concept.gamepadDesc') }}</li>
              <li><strong>{{ t('hid.concept.touchscreen') }}：</strong>{{ t('hid.concept.touchscreenDesc') }}</li>
              <li><strong>{{ t('hid.concept.scanner') }}：</strong>{{ t('hid.concept.scannerDesc') }}</li>
            </ul>
          </div>

          <h3>{{ t('serial.concept.compatibility') }}</h3>
          <div class="compat-info">
            <p><strong>{{ t('serial.concept.supported') }}：</strong>Chrome 89+、Edge 89+、Opera 75+</p>
            <p><strong>{{ t('serial.concept.notSupported') }}：</strong>Firefox、Safari</p>
            <p><strong>{{ t('serial.concept.requirement') }}：</strong>{{ t('common.httpsOrLocalhost') }}</p>
          </div>
        </section>
      </div>

      <!-- 交互演示 Tab -->
      <div v-if="activeTab === 'demo'" class="tab-content">
        <div v-if="!isSupported" class="not-supported">
          <p>{{ t('common.notSupported') }}</p>
          <p>{{ t('common.browserRequired', { browsers: t('common.browserHid') }) }}</p>
        </div>

        <template v-else>
          <section class="control-panel">
            <div class="control-row">
              <button
                class="btn btn-scan"
                :disabled="connected"
                @click="scanDevices"
              >
                {{ t('hid.scanDevice') }}
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
              <p><strong>{{ t('usb.product') }}:</strong> {{ selectedDevice.productName }}</p>
              <p><strong>{{ t('usb.manufacturer') }}:</strong> {{ selectedDevice.manufacturerName }}</p>
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
          <h3>{{ t('codeExamples.hid.requestDevice') }}</h3>
          <pre class="code-block"><code>// {{ t('codeExamples.hid.requestDeviceComment') }}
const devices = await navigator.hid.requestDevice({
  filters: [{ vendorId: 0x1234 }]
});

// {{ t('codeExamples.hid.getDevicesComment') }}
const devices = await navigator.hid.getDevices();</code></pre>

          <h3>{{ t('codeExamples.hid.openDevice') }}</h3>
          <pre class="code-block"><code>// {{ t('codeExamples.hid.openDeviceComment') }}
const device = devices[0];
await device.open();

// {{ t('codeExamples.hid.openDeviceComment2') }}
console.log('Product:', device.productName);
console.log('Collections:', device.collections);</code></pre>

          <h3>{{ t('codeExamples.hid.inputReport') }}</h3>
          <pre class="code-block"><code>// {{ t('codeExamples.hid.inputReportComment') }}
device.addEventListener('inputreport', (event) => {
  const { data, reportId, device } = event;

  // {{ t('codeExamples.hid.inputReportComment2') }}
  const dataArray = new Uint8Array(data.buffer);
  console.log('Report ID:', reportId);
  console.log('Data:', dataArray);
});</code></pre>

          <h3>{{ t('codeExamples.hid.outputReport') }}</h3>
          <pre class="code-block"><code>// {{ t('codeExamples.hid.outputReportComment') }}
const reportId = 1;
const data = new Uint8Array([0x01, 0x02, 0x03]);
await device.sendReport(reportId, data);</code></pre>

          <h3>{{ t('codeExamples.hid.featureReport') }}</h3>
          <pre class="code-block"><code>// {{ t('codeExamples.hid.featureReportComment') }}
const featureData = new Uint8Array([0x00, 0x01]);
await device.sendFeatureReport(reportId, featureData);

// {{ t('codeExamples.hid.featureReportComment2') }}
const featureReport = await device.receiveFeatureReport(reportId);
console.log('Feature:', new Uint8Array(featureReport.buffer));</code></pre>

          <h3>{{ t('codeExamples.hid.closeDevice') }}</h3>
          <pre class="code-block"><code>// {{ t('codeExamples.hid.closeDevice') }}
await device.close();</code></pre>

          <h3>{{ t('codeExamples.hid.listenEvents') }}</h3>
          <pre class="code-block"><code>// {{ t('common.deviceConnect') }}
navigator.hid.addEventListener('connect', (e) => {
  console.log('Device connected:', e.device);
});

// {{ t('common.deviceDisconnect') }}
navigator.hid.addEventListener('disconnect', (e) => {
  console.log('Device disconnected:', e.device);
});</code></pre>
        </section>
      </div>
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
  color: #9c27b0;
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

.device-examples {
  background: #f3e5f5;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

.device-examples ul {
  margin: 0;
  padding-left: 20px;
}

.device-examples li {
  margin: 6px 0;
  font-size: 13px;
  color: #555;
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
