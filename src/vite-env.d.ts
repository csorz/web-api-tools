/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface SerialOptions {
  baudRate?: number
  dataBits?: 7 | 8
  stopBits?: 1 | 2
  parity?: 'none' | 'even' | 'odd'
  bufferSize?: number
  flowControl?: 'none' | 'hardware'
}

interface SerialPortInfo {
  usbVendorId?: number
  usbProductId?: number
}

// WebUSB API types
interface Navigator {
  usb: USB
}

interface USB {
  getDevices(): Promise<USBDevice[]>
  requestDevice(options: USBDeviceRequestOptions): Promise<USBDevice>
}

interface USBDeviceRequestOptions {
  filters: USBDeviceFilter[]
}

interface USBDeviceFilter {
  vendorId?: number
  productId?: number
  classCode?: number
  subclassCode?: number
  protocolCode?: number
  serialNumber?: string
}

interface USBDevice {
  vendorId: number
  productId: number
  deviceClass: number
  deviceSubclass: number
  deviceProtocol: number
  deviceVersionMajor: number
  deviceVersionMinor: number
  deviceVersionSubminor: number
  manufacturerName?: string
  productName?: string
  serialNumber?: string
  configuration: USBConfiguration | null
  configurations: USBConfiguration[]
  opened: boolean
  open(): Promise<void>
  close(): Promise<void>
  selectConfiguration(configurationValue: number): Promise<void>
  claimInterface(interfaceNumber: number): Promise<void>
  releaseInterface(interfaceNumber: number): Promise<void>
  selectAlternateInterface(interfaceNumber: number, alternateSetting: number): Promise<void>
  controlTransferIn(setup: USBControlTransferParameters, length: number): Promise<USBInTransferResult>
  controlTransferOut(setup: USBControlTransferParameters, data?: BufferSource): Promise<USBOutTransferResult>
  clearHalt(direction: USBDirection, endpointNumber: number): Promise<void>
  transferIn(endpointNumber: number, length: number): Promise<USBInTransferResult>
  transferOut(endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>
  isochronousTransferIn(endpointNumber: number, packetLengths: number[]): Promise<USBIsochronousInTransferResult>
  isochronousTransferOut(endpointNumber: number, data: BufferSource, packetLengths: number[]): Promise<USBIsochronousOutTransferResult>
  reset(): Promise<void>
}

interface USBConfiguration {
  configurationValue: number
  configurationName?: string
  interfaces: USBInterface[]
}

interface USBInterface {
  interfaceNumber: number
  alternate: USBAlternateInterface
  alternates: USBAlternateInterface[]
  claimed: boolean
}

interface USBAlternateInterface {
  alternateSetting: number
  interfaceClass: number
  interfaceSubclass: number
  interfaceProtocol: number
  interfaceName?: string
  endpoints: USBEndpoint[]
}

interface USBEndpoint {
  endpointNumber: number
  direction: USBDirection
  type: USBEndpointType
  packetSize: number
}

type USBDirection = 'in' | 'out'
type USBEndpointType = 'bulk' | 'interrupt' | 'isochronous'

interface USBControlTransferParameters {
  requestType: USBRequestType
  recipient: USBRecipient
  request: number
  value: number
  index: number
}

type USBRequestType = 'standard' | 'class' | 'vendor'
type USBRecipient = 'device' | 'interface' | 'endpoint' | 'other'

interface USBInTransferResult {
  data?: DataView
  status: USBTransferStatus
}

interface USBOutTransferResult {
  bytesWritten: number
  status: USBTransferStatus
}

interface USBIsochronousInTransferResult {
  data?: DataView
  packets: USBIsochronousInTransferPacket[]
}

interface USBIsochronousInTransferPacket {
  bytesWritten: number
  data?: DataView
  status: USBTransferStatus
}

interface USBIsochronousOutTransferResult {
  packets: USBIsochronousOutTransferPacket[]
}

interface USBIsochronousOutTransferPacket {
  bytesWritten: number
  status: USBTransferStatus
}

type USBTransferStatus = 'ok' | 'stall' | 'babble'

// WebHID API types
interface Navigator {
  hid: HID
}

interface HID {
  getDevices(): Promise<HIDDevice[]>
  requestDevice(options: HIDDeviceRequestOptions): Promise<HIDDevice[]>
}

interface HIDDeviceRequestOptions {
  filters: HIDDeviceFilter[]
}

interface HIDDeviceFilter {
  vendorId?: number
  productId?: number
  usagePage?: number
  usage?: number
}

interface HIDDevice {
  vendorId: number
  productId: number
  productName?: string
  manufacturerName?: string
  serialNumber?: string
  collections: HIDCollectionInfo[]
  opened: boolean
  open(): Promise<void>
  close(): Promise<void>
  sendReport(reportId: number, data: BufferSource): Promise<void>
  sendFeatureReport(reportId: number, data: BufferSource): Promise<void>
  receiveFeatureReport(reportId: number): Promise<DataView>
  oninputreport: ((this: HIDDevice, ev: HIDInputReportEvent) => any) | null
  addEventListener(type: 'inputreport', listener: (this: HIDDevice, ev: HIDInputReportEvent) => any): void
  removeEventListener(type: 'inputreport', listener: (this: HIDDevice, ev: HIDInputReportEvent) => any): void
}

interface HIDCollectionInfo {
  usagePage: number
  usage: number
  collections: HIDCollectionInfo[]
  inputReports: HIDReportInfo[]
  outputReports: HIDReportInfo[]
  featureReports: HIDReportInfo[]
}

interface HIDReportInfo {
  reportId: number
  items: HIDReportItem[]
}

interface HIDReportItem {
  isAbsolute: boolean
  hasNull: boolean
  usageMinimum: number
  usageMaximum: number
  reportSize: number
  reportCount: number
  unitExponent: number
  unit: number
  logicalMinimum: number
  logicalMaximum: number
  physicalMinimum: number
  physicalMaximum: number
  usages: number[]
}

interface HIDInputReportEvent extends Event {
  data: DataView
  device: HIDDevice
  reportId: number
}

// Web Bluetooth API types
interface Navigator {
  bluetooth: Bluetooth
}

interface Bluetooth {
  getAvailability(): Promise<boolean>
  requestDevice(options?: RequestOptions): Promise<BluetoothDevice>
}

interface RequestOptions {
  filters?: BluetoothLEScanFilter[]
  optionalServices?: string[]
  acceptAllDevices?: boolean
}

interface BluetoothLEScanFilter {
  services?: string[]
  name?: string
  namePrefix?: string
}

interface BluetoothDevice {
  id: string
  name?: string
  gatt?: BluetoothRemoteGATTServer
  watchingAdvertisements: boolean
  watchAdvertisements(): Promise<void>
  unwatchAdvertisements(): void
  addEventListener(type: 'advertisementreceived', listener: (ev: BluetoothAdvertisingEvent) => any): void
  removeEventListener(type: 'advertisementreceived', listener: (ev: BluetoothAdvertisingEvent) => any): void
  addEventListener(type: 'gattserverdisconnected', listener: (ev: Event) => any): void
  removeEventListener(type: 'gattserverdisconnected', listener: (ev: Event) => any): void
}

interface BluetoothRemoteGATTServer {
  device: BluetoothDevice
  connected: boolean
  connect(): Promise<BluetoothRemoteGATTServer>
  disconnect(): void
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>
  getPrimaryServices(service?: string): Promise<BluetoothRemoteGATTService[]>
}

interface BluetoothRemoteGATTService {
  device: BluetoothDevice
  uuid: string
  isPrimary: boolean
  getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>
  getCharacteristics(characteristic?: string): Promise<BluetoothRemoteGATTCharacteristic[]>
}

interface BluetoothRemoteGATTCharacteristic {
  service: BluetoothRemoteGATTService
  uuid: string
  properties: BluetoothCharacteristicProperties
  value?: DataView
  readValue(): Promise<DataView>
  writeValue(value: BufferSource): Promise<void>
  writeValueWithResponse(value: BufferSource): Promise<void>
  writeValueWithoutResponse(value: BufferSource): Promise<void>
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>
  stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>
  addEventListener(type: 'characteristicvaluechanged', listener: (ev: Event) => any): void
  removeEventListener(type: 'characteristicvaluechanged', listener: (ev: Event) => any): void
}

interface BluetoothCharacteristicProperties {
  broadcast: boolean
  read: boolean
  writeWithoutResponse: boolean
  write: boolean
  notify: boolean
  indicate: boolean
  authenticatedSignedWrites: boolean
  reliableWrite: boolean
  writableAuxiliaries: boolean
}

interface BluetoothAdvertisingEvent extends Event {
  device: BluetoothDevice
  uuids: string[]
  name?: string
  appearance?: number
  txPower?: number
  rssi?: number
  manufacturerData: Map<number, DataView>
  serviceData: Map<string, DataView>
}
