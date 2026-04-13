# Web API Tools

[English](./README_EN.md) | 简体中文

基于 Vue 3 的 Web API 交互工具集，提供串口、USB、HID、蓝牙等设备的浏览器端通信能力。

## 功能模块

| 模块 | API | 描述 |
|------|-----|------|
| Web 串口 | Web Serial API | 串口设备通信 |
| WebUSB | WebUSB API | USB 设备通信 |
| WebHID | WebHID API | HID 设备通信 |
| Web Bluetooth | Web Bluetooth API | BLE 设备通信 |

## 页面结构

每个模块包含三个 Tab：

- **概念详解** - API 介绍、核心概念、参数说明
- **交互演示** - 设备扫描、连接、数据读写
- **代码示例** - API 使用代码片段

## 技术栈

- **框架**: Vue 3 (Composition API)
- **路由**: Vue Router 4
- **语言**: TypeScript
- **构建**: Vite

## 浏览器支持

| API | Chrome | Edge | Opera | Firefox | Safari |
|-----|--------|------|-------|---------|--------|
| Web Serial | 89+ | 89+ | 76+ | ❌ | ❌ |
| WebUSB | 61+ | 79+ | 48+ | ❌ | ❌ |
| WebHID | 89+ | 89+ | 75+ | ❌ | ❌ |
| Web Bluetooth | 56+ | 79+ | 43+ | ❌ | 部分 |

> 注意：所有 API 均需要 HTTPS 环境或 localhost 运行

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 项目结构

```
src/
├── App.vue                    # 根组件（布局容器）
├── main.ts                    # 应用入口
├── router/
│   └── index.ts               # 路由配置
├── views/
│   ├── WebSerial.vue          # 串口页面
│   ├── WebUsb.vue             # USB 页面
│   ├── WebHid.vue             # HID 页面
│   └── WebBluetooth.vue       # 蓝牙页面
├── components/
│   ├── Sidebar.vue            # 侧边栏导航
│   ├── ScanButton.vue         # 扫描按钮
│   ├── DataDisplay.vue        # 数据展示
│   ├── DataSender.vue         # 数据发送
│   └── ConnectionStatus.vue   # 连接状态
├── composables/
│   └── useSerial.ts           # 串口组合式函数
├── services/
│   └── SerialService.ts       # 串口服务
├── types/
│   └── serial.d.ts            # 类型定义
├── vite-env.d.ts              # Web API 类型声明
└── styles/
    └── main.css               # 全局样式
```

## API 概览

### Web Serial API

串口通信，适用于 Arduino、传感器等串口设备。

```typescript
// 请求串口
const port = await navigator.serial.requestPort();

// 打开连接
await port.open({ baudRate: 9600 });

// 读取数据
const reader = port.readable.getReader();
const { value } = await reader.read();
```

### WebUSB API

USB 设备通信，支持自定义 USB 设备。

```typescript
// 请求 USB 设备
const device = await navigator.usb.requestDevice({ filters: [] });

// 打开连接
await device.open();
await device.claimInterface(0);

// 数据传输
await device.transferOut(1, data);
```

### WebHID API

HID 设备通信，适用于键盘、鼠标、游戏手柄等。

```typescript
// 请求 HID 设备
const devices = await navigator.hid.requestDevice({ filters: [] });

// 打开连接
await device.open();

// 监听输入报告
device.addEventListener('inputreport', (event) => {
  console.log(event.data);
});
```

### Web Bluetooth API

蓝牙低功耗设备通信。

```typescript
// 请求蓝牙设备
const device = await navigator.bluetooth.requestDevice({
  filters: [{ services: ['battery_service'] }]
});

// 连接 GATT 服务器
const server = await device.gatt.connect();

// 读取特征值
const characteristic = await service.getCharacteristic('battery_level');
const value = await characteristic.readValue();
```

## 开发说明

### 环境要求

- Node.js 18+
- 现代浏览器（Chrome/Edge 推荐）

### 本地开发

由于 Web API 安全限制，需要 HTTPS 或 localhost 环境：

```bash
# 开发服务器自动使用 localhost
npm run dev
```

### 生产部署

确保部署环境使用 HTTPS，否则 Web API 将无法使用。

## License

MIT
