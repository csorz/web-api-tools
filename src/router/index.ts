import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/web-serial'
  },
  {
    path: '/web-serial',
    name: 'WebSerial',
    component: () => import('@/views/WebSerial.vue'),
    meta: { title: 'Web 串口' }
  },
  {
    path: '/web-usb',
    name: 'WebUsb',
    component: () => import('@/views/WebUsb.vue'),
    meta: { title: 'WebUSB' }
  },
  {
    path: '/web-hid',
    name: 'WebHid',
    component: () => import('@/views/WebHid.vue'),
    meta: { title: 'WebHID' }
  },
  {
    path: '/web-bluetooth',
    name: 'WebBluetooth',
    component: () => import('@/views/WebBluetooth.vue'),
    meta: { title: 'Web Bluetooth' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta?.title || 'Web API'} - Web API Tools`
  next()
})

export default router
