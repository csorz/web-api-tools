# Web API Tools

English | [简体中文](./README.md)

A Vue 3-based Web API interactive toolkit providing browser-side communication capabilities for serial, USB, HID, and Bluetooth devices.

## Features

| Module | API | Description |
|--------|-----|-------------|
| Web Serial | Web Serial API | Serial device communication |
| WebUSB | WebUSB API | USB device communication |
| WebHID | WebHID API | HID device communication |
| Web Bluetooth | Web Bluetooth API | BLE device communication |

## Page Structure

Each module contains three tabs:

- **Concept** - API introduction, core concepts, parameter descriptions
- **Demo** - Device scanning, connection, data read/write
- **Code Examples** - API usage code snippets

## Tech Stack

- **Framework**: Vue 3 (Composition API)
- **Routing**: Vue Router 4
- **Internationalization**: vue-i18n
- **Language**: TypeScript
- **Build**: Vite

## Browser Support

| API | Chrome | Edge | Opera | Firefox | Safari |
|-----|--------|------|-------|---------|--------|
| Web Serial | 89+ | 89+ | 76+ | ❌ | ❌ |
| WebUSB | 61+ | 79+ | 48+ | ❌ | ❌ |
| WebHID | 89+ | 89+ | 75+ | ❌ | ❌ |
| Web Bluetooth | 56+ | 79+ | 43+ | ❌ | Partial |

> Note: All APIs require HTTPS or localhost environment

## Quick Start

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
```

## Project Structure

```
src/
├── App.vue                    # Root component (layout container)
├── main.ts                    # Application entry
├── router/
│   └── index.ts               # Router configuration
├── views/
│   ├── WebSerial.vue          # Serial page
│   ├── WebUsb.vue             # USB page
│   ├── WebHid.vue             # HID page
│   └── WebBluetooth.vue       # Bluetooth page
├── components/
│   ├── Sidebar.vue            # Sidebar navigation
│   ├── ScanButton.vue         # Scan button
│   ├── DataDisplay.vue        # Data display
│   ├── DataSender.vue         # Data sender
│   └── ConnectionStatus.vue   # Connection status
├── composables/
│   └── useSerial.ts           # Serial composable
├── services/
│   └── SerialService.ts       # Serial service
├── types/
│   └── serial.d.ts            # Type definitions
├── locales/
│   ├── index.ts               # i18n configuration
│   ├── zh-CN.json             # Chinese translations
│   └── en-US.json             # English translations
├── vite-env.d.ts              # Web API type declarations
└── styles/
    └── main.css               # Global styles
```

## API Overview

### Web Serial API

Serial communication for Arduino, sensors, and other serial devices.

```typescript
// Request serial port
const port = await navigator.serial.requestPort();

// Open connection
await port.open({ baudRate: 9600 });

// Read data
const reader = port.readable.getReader();
const { value } = await reader.read();
```

### WebUSB API

USB device communication supporting custom USB devices.

```typescript
// Request USB device
const device = await navigator.usb.requestDevice({ filters: [] });

// Open connection
await device.open();
await device.claimInterface(0);

// Data transfer
await device.transferOut(1, data);
```

### WebHID API

HID device communication for keyboards, mice, gamepads, etc.

```typescript
// Request HID device
const devices = await navigator.hid.requestDevice({ filters: [] });

// Open connection
await device.open();

// Listen to input reports
device.addEventListener('inputreport', (event) => {
  console.log(event.data);
});
```

### Web Bluetooth API

Bluetooth Low Energy device communication.

```typescript
// Request Bluetooth device
const device = await navigator.bluetooth.requestDevice({
  filters: [{ services: ['battery_service'] }]
});

// Connect to GATT server
const server = await device.gatt.connect();

// Read characteristic value
const characteristic = await service.getCharacteristic('battery_level');
const value = await characteristic.readValue();
```

## Development

### Requirements

- Node.js 18+
- Modern browser (Chrome/Edge recommended)

### Local Development

Due to Web API security restrictions, HTTPS or localhost environment is required:

```bash
# Development server automatically uses localhost
npm run dev
```

### Production Deployment

Ensure your deployment environment uses HTTPS, otherwise Web APIs will not be available.

## Internationalization

The application supports both Chinese (zh-CN) and English (en-US). You can switch languages using the language toggle button in the sidebar.

## License

MIT
