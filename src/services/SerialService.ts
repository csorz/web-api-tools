import type { SerialPort, SerialOptions, SerialPortInfo } from '@/types/serial'

export class SerialService {
  private port: SerialPort | null = null
  private isReading = false

  /**
   * 检查浏览器是否支持 Web Serial API
   */
  static isSupported(): boolean {
    return 'serial' in navigator
  }

  /**
   * 获取已授权的串口列表
   */
  async getPorts(): Promise<SerialPort[]> {
    return navigator.serial.getPorts()
  }

  /**
   * 请求用户选择串口
   */
  async requestPort(): Promise<SerialPort> {
    this.port = await navigator.serial.requestPort()
    return this.port
  }

  /**
   * 连接串口
   */
  async connect(port: SerialPort, options: SerialOptions): Promise<void> {
    this.port = port
    console.log('[SerialService] 正在连接串口...')
    console.log('[SerialService] 配置参数:', options)
    const info = port.getInfo()
    console.log('[SerialService] 串口信息:', info)
    console.log(`[SerialService] VID: ${info.usbVendorId?.toString(16)}, PID: ${info.usbProductId?.toString(16)}`)
    try {
      await this.port.open(options)
      console.log('[SerialService] 串口连接成功')
    } catch (error) {
      const err = error as Error
      console.error('[SerialService] 串口连接失败:', err.message)
      console.error('[SerialService] 错误类型:', err.name)

      // 提供更友好的错误信息
      if (err.message.includes('Failed to open serial port')) {
        throw new Error(
          '无法打开串口。可能原因：\n' +
          '1. 串口被其他程序占用（请关闭串口调试助手、Arduino IDE等）\n' +
          '2. 串口驱动未正确安装\n' +
          '3. 设备权限问题'
        )
      }
      throw error
    }
  }

  /**
   * 获取串口信息
   */
  getPortInfo(): SerialPortInfo | null {
    return this.port?.getInfo() ?? null
  }

  /**
   * 读取串口数据
   */
  async readData(
    onData: (data: string) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    if (!this.port?.readable) {
      throw new Error('串口未连接或不可读')
    }

    this.isReading = true
    const decoder = new TextDecoderStream()
    const reader = this.port.readable.pipeThrough(decoder).getReader()

    try {
      while (this.isReading) {
        const { value, done } = await reader.read()
        if (done) {
          break
        }
        if (value) {
          console.log('[Serial] 接收:', value)
          onData(value)
        }
      }
    } catch (error) {
      onError(error as Error)
    } finally {
      reader.releaseLock()
    }
  }

  /**
   * 停止读取
   */
  stopRead(): void {
    this.isReading = false
  }

  /**
   * 发送数据
   */
  async writeData(data: string | Uint8Array): Promise<void> {
    if (!this.port?.writable) {
      throw new Error('串口未连接或不可写')
    }

    const writer = this.port.writable.getWriter()
    try {
      if (typeof data === 'string') {
        // 文本模式：转换为 Uint8Array
        const encoder = new TextEncoder()
        const bytes = encoder.encode(data)
        console.log('[Serial] 发送:', data, '| Hex:', this.bytesToHex(bytes))
        await writer.write(bytes)
      } else {
        // 十六进制模式：直接写入
        console.log('[Serial] 发送 Hex:', this.bytesToHex(data))
        await writer.write(data)
      }
    } finally {
      writer.releaseLock()
    }
  }

  /**
   * 字节数组转十六进制字符串
   */
  private bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ')
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    this.stopRead()

    if (this.port) {
      try {
        await this.port.close()
      } catch {
        // ignore
      }
      this.port = null
    }
  }

  /**
   * 监听断开事件
   */
  onDisconnect(callback: () => void): void {
    this.port?.addEventListener('disconnect', callback)
  }

  /**
   * 移除断开事件监听
   */
  offDisconnect(callback: () => void): void {
    this.port?.removeEventListener('disconnect', callback)
  }

  /**
   * 获取当前串口
   */
  getPort(): SerialPort | null {
    return this.port
  }

  /**
   * 是否正在读取
   */
  getIsReading(): boolean {
    return this.isReading
  }
}

export const serialService = new SerialService()
