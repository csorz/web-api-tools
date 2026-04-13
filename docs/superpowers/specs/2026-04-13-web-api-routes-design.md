---
name: Web API Routes Design
description: Design for adding Vue Router with sidebar navigation for Serial, USB, HID, and Bluetooth pages
type: project
---

# Web API 路由设计

## 概述

为项目添加 Vue Router 路由系统，实现侧边栏导航布局，支持 Web Serial、WebUSB、WebHID、Web Bluetooth 四个独立页面。

## 需求

1. **路由系统**：使用 Vue Router 管理页面导航
2. **侧边栏导航**：左侧固定侧边栏，显示所有页面链接
3. **四个独立页面**：
   - `/web-serial` - Web 串口通信
   - `/web-usb` - WebUSB 通信
   - `/web-hid` - WebHID 通信
   - `/web-bluetooth` - Web Bluetooth 通信
4. **响应式布局**：宽屏侧边栏固定，窄屏可折叠

## 架构设计

### 整体布局

```
┌─────────────────────────────────────────────────┐
│  App.vue                                        │
│  ┌─────────┬──────────────────────────────────┐ │
│  │         │                                   │ │
│  │ Sidebar │                                   │ │
│  │         │      <router-view>               │ │
│  │ 导航菜单 │                                   │ │
│  │         │      当前页面内容                 │ │
│  │         │                                   │ │
│  └─────────┴──────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 目录结构

```
src/
├── App.vue                    # 布局容器（侧边栏 + 路由视图）
├── main.ts                    # 应用入口，添加路由初始化
├── router/
│   └── index.ts               # Vue Router 配置
├── views/                     # 页面组件
│   ├── WebSerial.vue          # Web 串口页
│   ├── WebUsb.vue             # WebUSB 页
│   ├── WebHid.vue             # WebHID 页
│   └── WebBluetooth.vue       # Web Bluetooth 页
├── components/
│   ├── Sidebar.vue            # 侧边栏导航（新建）
│   ├── ScanButton.vue         # 保留
│   ├── DataDisplay.vue        # 保留
│   ├── DataSender.vue         # 保留
│   └── ConnectionStatus.vue   # 保留
├── composables/
│   └── useSerial.ts           # 保留
├── services/
│   └── SerialService.ts       # 保留
├── types/
│   └── serial.d.ts            # 保留
└── styles/
    └── main.css               # 修改：添加布局样式
```

## 路由配置

| 路径 | 组件 | 描述 |
|------|------|------|
| `/` | 重定向 | 重定向到 `/web-serial` |
| `/web-serial` | WebSerial.vue | Web Serial API 串口通信 |
| `/web-usb` | WebUsb.vue | WebUSB API USB 通信 |
| `/web-hid` | WebHid.vue | WebHID API HID 通信 |
| `/web-bluetooth` | WebBluetooth.vue | Web Bluetooth API BLE 通信 |

## 组件设计

### Sidebar.vue

侧边栏导航组件，显示所有路由链接。

**Props:** 无

**功能:**
- 显示导航链接列表
- 高亮当前激活路由
- 响应式：窄屏可折叠

**导航项:**
```typescript
const navItems = [
  { to: '/web-serial', label: 'Web 串口', icon: '🔌', desc: '基于 Web Serial API 的串口通信' },
  { to: '/web-usb', label: 'WebUSB', icon: '🔌', desc: '基于 WebUSB API 的 USB 通信' },
  { to: '/web-hid', label: 'WebHID', icon: '⌨️', desc: '基于 WebHID API 的 HID 通信' },
  { to: '/web-bluetooth', label: 'Web Bluetooth', icon: '📶', desc: '基于 Web Bluetooth API 的 BLE 通信' }
]
```

### 页面组件

每个页面独立实现，功能类似但适配不同 Web API：

| 功能 | Serial | USB | HID | Bluetooth |
|------|--------|-----|-----|-----------|
| 扫描设备 | ✅ | ✅ | ✅ | ✅ |
| 连接/断开 | ✅ | ✅ | ✅ | ✅ |
| 配置参数 | 波特率等 | 端点配置 | 报告描述符 | 服务/特征 |
| 数据读取 | ✅ | ✅ | ✅ | ✅ |
| 数据发送 | ✅ | ✅ | ✅ | ✅ |

**WebSerial.vue**: 从现有 App.vue 迁移串口功能

**WebUsb.vue / WebHid.vue / WebBluetooth.vue**: 初始创建基础框架，包含：
- API 支持检测
- 扫描按钮
- 连接/断开按钮
- 数据显示区
- 数据发送区

## 响应式布局

```css
/* 布局容器 */
.app-layout {
  display: flex;
  min-height: 100vh;
}

/* 侧边栏 */
.sidebar {
  width: 220px;
  flex-shrink: 0;
}

/* 内容区 */
.main-content {
  flex: 1;
  min-width: 0;
}

/* 窄屏：侧边栏折叠 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -220px;
    transition: left 0.3s;
  }

  .sidebar.open {
    left: 0;
  }
}
```

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `package.json` | 修改 | 添加 vue-router 依赖 |
| `src/router/index.ts` | 新建 | Vue Router 配置 |
| `src/views/WebSerial.vue` | 新建 | 串口页（从 App.vue 迁移） |
| `src/views/WebUsb.vue` | 新建 | USB 页（基础框架） |
| `src/views/WebHid.vue` | 新建 | HID 页（基础框架） |
| `src/views/WebBluetooth.vue` | 新建 | 蓝牙页（基础框架） |
| `src/components/Sidebar.vue` | 新建 | 侧边栏导航组件 |
| `src/App.vue` | 重构 | 布局容器 |
| `src/main.ts` | 修改 | 添加路由初始化 |
| `src/styles/main.css` | 修改 | 添加布局样式 |

## 实现优先级

1. **Phase 1**：路由基础
   - 安装 vue-router
   - 创建路由配置
   - 创建基础页面组件
   - 重构 App.vue

2. **Phase 2**：侧边栏
   - 创建 Sidebar 组件
   - 实现导航链接
   - 响应式适配

3. **Phase 3**：页面完善
   - 迁移串口功能到 WebSerial.vue
   - 创建其他页面基础框架

## 兼容性

- 保持现有组件（ScanButton、DataDisplay 等）不变
- useSerial composable 保持不变
- 向后兼容现有功能
