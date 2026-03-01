<template>
  <div class="card" :class="{ 'card-shadow': shadow, 'card-bordered': bordered }">
    <div v-if="title || $slots.header" class="card-header">
      <slot name="header">
        <h3 class="card-title">{{ title }}</h3>
        <span v-if="subtitle" class="card-subtitle">{{ subtitle }}</span>
      </slot>
    </div>
    <div class="card-body" :style="bodyStyle">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  shadow: {
    type: Boolean,
    default: true,
  },
  bordered: {
    type: Boolean,
    default: false,
  },
  bodyStyle: {
    type: Object,
    default: () => ({}),
  },
})
</script>

<style scoped>
.card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.card-shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-bordered {
  border: 1px solid var(--border-color, #e8e8e8);
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color, #e8e8e8);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #262626);
}

.card-subtitle {
  font-size: 13px;
  color: var(--text-secondary, #8c8c8c);
}

.card-body {
  padding: 20px;
}

.card-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--border-color, #e8e8e8);
  background: var(--bg-light, #fafafa);
}
</style>
