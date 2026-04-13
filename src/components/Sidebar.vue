<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setLocale, getLocale } from '@/locales'

const { t } = useI18n()
const route = useRoute()

const navItems = computed(() => [
  { to: '/web-serial', label: t('nav.serial'), icon: '🔌', desc: t('nav.serialDesc') },
  { to: '/web-usb', label: t('nav.usb'), icon: '🔌', desc: t('nav.usbDesc') },
  { to: '/web-hid', label: t('nav.hid'), icon: '⌨️', desc: t('nav.hidDesc') },
  { to: '/web-bluetooth', label: t('nav.bluetooth'), icon: '📶', desc: t('nav.bluetoothDesc') }
])

const currentPath = computed(() => route.path)

const currentLocale = computed(() => getLocale())

function isActive(path: string): boolean {
  return currentPath.value === path
}

function toggleLocale() {
  const newLocale = currentLocale.value === 'zh-CN' ? 'en-US' : 'zh-CN'
  setLocale(newLocale)
}

const localeLabel = computed(() => currentLocale.value === 'zh-CN' ? 'EN' : '中文')
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2 class="app-title">{{ t('app.title') }}</h2>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: isActive(item.to) }"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <div class="nav-content">
          <span class="nav-label">{{ item.label }}</span>
          <span class="nav-desc">{{ item.desc }}</span>
        </div>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <button class="locale-btn" @click="toggleLocale">
        <span class="locale-icon">🌐</span>
        <span class="locale-label">{{ localeLabel }}</span>
      </button>
      <p class="footer-text">{{ t('app.footer') }}</p>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  height: 100vh;
  background: #1a1a2e;
  color: #fff;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
}

.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.app-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #42b883;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.nav-item.active {
  background: rgba(66, 184, 131, 0.15);
  color: #42b883;
  border-right: 3px solid #42b883;
}

.nav-icon {
  font-size: 20px;
  width: 28px;
  text-align: center;
}

.nav-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-label {
  font-size: 14px;
  font-weight: 500;
}

.nav-desc {
  font-size: 11px;
  opacity: 0.7;
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.locale-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.locale-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.locale-icon {
  font-size: 14px;
}

.locale-label {
  font-weight: 500;
}

.footer-text {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }

  .app-title {
    font-size: 14px;
  }

  .nav-content {
    display: none;
  }

  .nav-item {
    justify-content: center;
    padding: 12px;
  }

  .sidebar-footer {
    display: none;
  }
}
</style>
