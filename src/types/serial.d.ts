// Web Serial API 类型定义

export interface SerialOptions {
  baudRate: number
  dataBits?: 7 | 8
  stopBits?: 1 | 2
  parity?: 'none' | 'even' | 'odd'
  bufferSize?: number
  flowControl?: 'none' | 'hardware'
}

export interface SerialPortInfo {
  usbVendorId?: number
  usbProductId?: number
}

export interface SerialPort {
  readonly readable: ReadableStream | null
  readonly writable: WritableStream | null
  open(options: SerialOptions): Promise<void>
  close(): Promise<void>
  getInfo(): SerialPortInfo
  addEventListener(type: 'disconnect', listener: () => void): void
  removeEventListener(type: 'disconnect', listener: () => void): void
}

export interface Serial {
  getPorts(): Promise<SerialPort[]>
  requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>
  addEventListener(type: 'connect', listener: (e: { target: SerialPort }) => void): void
  addEventListener(type: 'disconnect', listener: (e: { target: SerialPort }) => void): void
}

export interface SerialPortRequestOptions {
  filters?: SerialPortFilter[]
}

export interface SerialPortFilter {
  usbVendorId: number
  usbProductId?: number
}

declare global {
  interface Navigator {
    serial: Serial
  }
}

export type ConnectionStatus = 'disconnected' | 'connected' | 'reading' | 'error'

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
