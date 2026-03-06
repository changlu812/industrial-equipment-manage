<template>
  <div class="layout">
    <header class="header">
      <div class="header-content">
        <div class="header-title">
          <span class="header-icon">⚙️</span>
          <span>工业设备台账管理系统</span>
        </div>
        <div class="header-right">
          <nav class="tab-nav">
            <router-link
              v-for="tab in appStore.tabs"
              :key="tab.id"
              :to="`/${tab.id}`"
              class="tab-btn"
              :class="{ active: route.path === `/${tab.id}` }"
            >
              {{ tab.icon }} {{ tab.name }}
            </router-link>
          </nav>
          <div class="user-info">
            <span v-if="authStore.isAdmin" class="admin-badge"
              >管理员 {{ authStore.username }}</span
            >
          </div>
          <button class="btn-logout" @click="handleLogout">退出系统</button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore, useAppStore } from "@stores";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const appStore = useAppStore();

const handleLogout = () => {
  authStore.handleLogout();
  router.push("/login");
};

onMounted(() => {
  authStore.initAuth();
});
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.header {
  background: linear-gradient(135deg, var(--primary) 0%, #096dd9 100%);
  color: white;
  padding: 24px 0;
  box-shadow: var(--shadow-lg);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 28px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tab-nav {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px;
  border-radius: 8px;
}

.tab-btn {
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s;
  text-decoration: none;
  white-space: nowrap;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.tab-btn.active {
  background: white;
  color: var(--primary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-badge {
  background: rgba(255, 215, 0, 0.3);
  color: #ffd700;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  border: 1px solid rgba(255, 215, 0, 0.5);
  font-size: 13px;
}

.btn-logout {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.3);
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}
</style>
