---
name: Multi-Serial Port Layout Design
description: Design for left-right layout with multiple serial ports, supporting master-slave modes
type: project
---

# 多串口布局设计

## 概述

将现有的单串口界面改造为支持多串口的左右布局，支持独立模式、广播模式、汇聚模式和主从控制模式。

## 需求

1. **左右布局**：页面分为左右两个区域，各连接一个串口
2. **响应式**：宽屏左右排列，窄屏上下堆叠
3. **多串口支持**：未来可扩展支持更多串口
4. **主从模式**：
   - 独立模式：各串口独立工作
   - 广播模式：主串口数据广播到所有从串口
   - 汇聚模式：所有从串口数据汇聚到主串口
   - 主从控制模式：主串口发送命令，从串口响应/上报
5. **角色指定**：用户在全局工具栏手动指定主从角色

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      App.vue                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              GlobalToolbar.vue                       │    │
│  │  [模式: 独立 ▼]  [添加串口]  [移除串口]              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────┐    ┌────────────────────┐           │
│  │   SerialPanel.vue  │    │   SerialPanel.vue  │  ...      │
│  │   (串口 1 - 主)    │    │   (串口 2 - 从)    │           │
│  │                    │    │                    │           │
│  │  [配置] [连接]     │    │  [配置] [连接]     │           │
│  │  [数据显示]        │    │  [数据显示]        │           │
│  │  [发送]            │    │  [发送]            │           │
│  └────────────────────┘    └────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  useSerialManager()                         │
│  - ports: SerialPortConfig[]  (支持动态增删)                │
│  - mode: WorkMode                                           │
│  - masterId: string | null                                  │
│  - setRole(portId, role)                                    │
│  - setMode(mode)                                            │
│  - broadcast(data)  // 主→从                                │
│  - gather()         // 从→主                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    useSerial()                              │
│  (每个串口实例独立，保持现有功能)                            │
└─────────────────────────────────────────────────────────────┘
```

### 组件结构

| 组件 | 职责 |
|------|------|
| `GlobalToolbar.vue` | 模式切换、添加/移除串口、角色分配 |
| `SerialPanel.vue` | 单个串口的完整控制面板 |
| `App.vue` | 布局容器，响应式处理 |

### 目录结构

```
src/
├── App.vue                    # 根组件（重构）
├── main.ts                    # 应用入口
├── components/
│   ├── GlobalToolbar.vue      # 全局工具栏（新建）
│   ├── SerialPanel.vue        # 串口面板组件（新建）
│   ├── ScanButton.vue         # 扫描按钮组件（保留）
│   ├── DataDisplay.vue        # 数据展示组件（保留）
│   ├── DataSender.vue         # 数据发送组件（保留）
│   └── ConnectionStatus.vue   # 连接状态组件（保留）
├── composables/
│   ├── useSerial.ts           # 单串口组合式函数（保留）
│   └── useSerialManager.ts    # 多串口管理器（新建）
├── services/
│   └── SerialService.ts       # 串口服务核心逻辑（保留）
├── types/
│   └── serial.d.ts            # TypeScript 类型定义（修改）
└── styles/
    └── main.css               # 全局样式（修改）
```

## 类型定义

```typescript
// 串口角色
type SerialRole = 'master' | 'slave' | 'independent'

// 工作模式
type WorkMode = 'independent' | 'broadcast' | 'gather' | 'master-slave'

// 串口配置
interface SerialPortConfig {
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

// 模式配置
interface ModeConfig {
  mode: WorkMode
  masterId: string | null
}
```

## useSerialManager 接口

```typescript
interface UseSerialManager {
  // 状态
  ports: Ref<SerialPortConfig[]>
  mode: Ref<WorkMode>
  masterId: Ref<string | null>

  // 串口管理
  addPort(): Promise<void>
  removePort(id: string): void
  setRole(id: string, role: SerialRole): void

  // 模式管理
  setMode(mode: WorkMode): void

  // 数据操作
  broadcast(data: string | Uint8Array): Promise<void>
  gather(): void

  // 连接管理
  connect(id: string, options?: SerialOptions): Promise<void>
  disconnect(id: string): Promise<void>
  startRead(id: string): void
  stopRead(id: string): void
  write(id: string, data: string | Uint8Array): Promise<void>
}
```

## 主从模式数据流

### 广播模式（主→从）

```
主串口接收数据 → 自动发送到所有从串口
```

实现：主串口的 `onData` 回调中，遍历所有从串口并调用 `write()`

### 汇聚模式（从→主）

```
从串口接收数据 → 自动发送到主串口
```

实现：从串口的 `onData` 回调中，找到主串口并调用 `write()`

### 主从控制模式

```
主串口发送命令 → 从串口响应
从串口上报数据 → 主串口接收
```

实现：双向数据流，主串口发送时广播，从串口接收时汇聚

## 响应式布局

```css
/* 宽屏：左右排列 */
.serial-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.serial-panel {
  flex: 1 1 calc(50% - 8px);  /* 两列 */
  min-width: 300px;
}

/* 窄屏：自动堆叠 */
@media (max-width: 768px) {
  .serial-panel {
    flex: 1 1 100%;  /* 单列 */
  }
}

/* 三列及以上 */
@media (min-width: 1200px) {
  .serial-panel {
    flex: 1 1 calc(33.33% - 11px);  /* 三列 */
  }
}
```

## 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/composables/useSerialManager.ts` | 新建 | 多串口管理器 |
| `src/components/GlobalToolbar.vue` | 新建 | 全局工具栏 |
| `src/components/SerialPanel.vue` | 新建 | 串口面板组件 |
| `src/types/serial.d.ts` | 修改 | 添加新类型 |
| `src/App.vue` | 重构 | 使用新组件 |
| `src/styles/main.css` | 修改 | 响应式样式 |

## 实现优先级

1. **Phase 1**：基础布局改造
   - 提取 SerialPanel 组件
   - 实现左右布局
   - 响应式适配

2. **Phase 2**：多串口管理
   - 实现 useSerialManager
   - 动态添加/移除串口

3. **Phase 3**：主从模式
   - 实现角色分配
   - 实现广播/汇聚/主从控制模式

## 兼容性

- 保持现有 `useSerial` 和 `SerialService` 不变
- 新功能通过 `useSerialManager` 组合使用
- 向后兼容单串口使用场景
