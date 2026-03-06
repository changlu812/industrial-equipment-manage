<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-title">工业设备台账管理系统</div>
      <div class="login-form">
        <FormItem
          v-model="authStore.loginForm.username"
          label="用户名"
          placeholder="请输入用户名"
          @enter="handleLogin"
        />
        <FormItem
          v-model="authStore.loginForm.password"
          label="密码"
          input-type="password"
          placeholder="请输入密码"
          @enter="handleLogin"
        />
        <button class="btn btn-primary btn-login" @click="handleLogin">
          登录
        </button>
        <div v-if="authStore.loginError" class="login-error">
          {{ authStore.loginError }}
        </div>
      </div>
    </div>
    <div class="login-tip">
      <p>管理员账号：admin</p>
      <p>密码：123456</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@stores/auth";
import { FormItem } from "@components/common";

const router = useRouter();
const authStore = useAuthStore();

const handleLogin = async () => {
  const success = await authStore.handleLogin();
  if (success) {
    router.push("/");
  }
};

onMounted(() => {
  authStore.initAuth();
  if (authStore.isAuthenticated) {
    router.push("/");
  }
});
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary) 0%, #096dd9 100%);
  padding: 20px;
}

.login-box {
  background: var(--bg-surface);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-title {
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 32px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn-login {
  width: 100%;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
}

.login-error {
  color: var(--danger);
  font-size: 14px;
  text-align: center;
  padding: 8px;
  background: rgba(255, 77, 79, 0.1);
  border-radius: 4px;
}

.login-tip {
  background: rgba(24, 144, 255, 0.1);
  border: 1px solid rgba(24, 144, 255, 0.3);
  border-radius: 4px;
  padding: 12px;
  margin-top: 16px;
  font-size: 13px;
  color: white;
  text-align: center;
}

.login-tip p {
  margin: 4px 0;
}
</style>
