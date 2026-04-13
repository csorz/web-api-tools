import { ref, computed, onUnmounted } from 'vue'
import { SerialService } from '@/services/SerialService'
import type { SerialPort, SerialOptions, ConnectionStatus } from '@/types/serial'

export function useSerial() {
  // 状态
  const connected = ref(false)
  const reading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<string>('')
  const portInfo = ref<{ usbVendorId?: number; usbProductId?: number } | null>(null)

  // 服务实例
  const service = new SerialService()

  // 计算属性
  const status = computed<ConnectionStatus>(() => {
    if (error.value) return 'error'
    if (reading.value) return 'reading'
    if (connected.value) return 'connected'
    return 'disconnected'
  })

  const isSupported = computed(() => SerialService.isSupported())

  // 默认配置
  const defaultOptions: SerialOptions = {
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none'
  }

  /**
   * 扫描串口
   */
  async function scanPorts(): Promise<SerialPort[]> {
    error.value = null
    console.log('[useSerial] 开始扫描串口...')
    try {
      // 先获取已授权的端口
      const ports = await service.getPorts()
      console.log('[useSerial] 已授权端口数量:', ports.length)
      if (ports.length === 0) {
        // 没有已授权的端口，请求用户选择
        console.log('[useSerial] 请求用户选择串口...')
        const port = await service.requestPort()
        console.log('[useSerial] 用户已选择串口:', port.getInfo())
        return [port]
      }
      console.log('[useSerial] 返回已授权端口列表')
      return ports
    } catch (e) {
      console.error('[useSerial] 扫描串口失败:', e)
      error.value = (e as Error).message
      throw e
    }
  }

  /**
   * 连接串口
   */
  async function connect(port: SerialPort, options?: Partial<SerialOptions>): Promise<void> {
    error.value = null
    console.log('[useSerial] 开始连接串口...')
    console.log('[useSerial] 用户配置:', options)
    try {
      const finalOptions = { ...defaultOptions, ...options }
      console.log('[useSerial] 最终配置:', finalOptions)
      await service.connect(port, finalOptions)
      connected.value = true
      portInfo.value = service.getPortInfo()
      console.log('[useSerial] 连接成功, 端口信息:', portInfo.value)

      // 监听断开事件
      service.onDisconnect(() => {
        console.log('[useSerial] 串口断开事件触发')
        connected.value = false
        reading.value = false
        error.value = '串口已断开'
      })
    } catch (e) {
      console.error('[useSerial] 连接失败:', e)
      error.value = (e as Error).message
      throw e
    }
  }

  /**
   * 开始读取数据
   */
  function startRead(): void {
    if (!connected.value) {
      error.value = '请先连接串口'
      return
    }

    error.value = null
    reading.value = true
    data.value = ''

    service.readData(
      (chunk) => {
        data.value += chunk
      },
      (e) => {
        error.value = e.message
        reading.value = false
      }
    )
  }

  /**
   * 停止读取
   */
  function stopRead(): void {
    service.stopRead()
    reading.value = false
  }

  /**
   * 发送数据
   */
  async function write(data: string | Uint8Array): Promise<void> {
    if (!connected.value) {
      error.value = '请先连接串口'
      return
    }

    try {
      await service.writeData(data)
    } catch (e) {
      error.value = (e as Error).message
      throw e
    }
  }

  /**
   * 断开连接
   */
  async function disconnect(): Promise<void> {
    stopRead()
    await service.disconnect()
    connected.value = false
    reading.value = false
    portInfo.value = null
    data.value = ''
    error.value = null
  }

  /**
   * 清空数据
   */
  function clearData(): void {
    data.value = ''
  }

  /**
   * 清除错误
   */
  function clearError(): void {
    error.value = null
  }

  // 组件卸载时自动断开
  onUnmounted(() => {
    if (connected.value) {
      disconnect()
    }
  })

  return {
    // 状态
    connected,
    reading,
    error,
    data,
    portInfo,
    status,
    isSupported,

    // 方法
    scanPorts,
    connect,
    startRead,
    stopRead,
    write,
    disconnect,
    clearData,
    clearError
  }
}
