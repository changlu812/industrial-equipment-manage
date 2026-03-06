<template>
  <div class="pagination">
    <button
      class="page-btn"
      :disabled="currentPage <= 1"
      @click="handlePrev"
    >
      上一页
    </button>

    <div class="page-numbers">
      <button
        v-for="page in displayPages"
        :key="page"
        class="page-number"
        :class="{ active: page === currentPage }"
        @click="handlePageChange(page)"
      >
        {{ page }}
      </button>
    </div>

    <button
      class="page-btn"
      :disabled="currentPage >= totalPages"
      @click="handleNext"
    >
      下一页
    </button>

    <div v-if="showJumper" class="page-jumper">
      <span>跳至</span>
      <input
        v-model.number="jumpPage"
        type="number"
        min="1"
        :max="totalPages"
        @keyup.enter="handleJump"
      />
      <span>页</span>
      <button class="btn-confirm" @click="handleJump">确定</button>
    </div>

    <span class="page-info">
      共 {{ total }} 条 / {{ totalPages }} 页
    </span>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  total: {
    type: Number,
    default: 0,
  },
  showJumper: {
    type: Boolean,
    default: true,
  },
  maxDisplayPages: {
    type: Number,
    default: 5,
  },
})

const emit = defineEmits(['update:currentPage', 'change'])

const totalPages = computed(() => Math.ceil(props.total / props.pageSize) || 1)

const jumpPage = ref(null)

watch(() => props.currentPage, (newPage) => {
  jumpPage.value = null
})

const displayPages = computed(() => {
  const pages = []
  const half = Math.floor(props.maxDisplayPages / 2)
  let start = Math.max(1, props.currentPage - half)
  let end = Math.min(totalPages.value, start + props.maxDisplayPages - 1)

  if (end - start + 1 < props.maxDisplayPages) {
    start = Math.max(1, end - props.maxDisplayPages + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const handlePrev = () => {
  if (props.currentPage > 1) {
    handlePageChange(props.currentPage - 1)
  }
}

const handleNext = () => {
  if (props.currentPage < totalPages.value) {
    handlePageChange(props.currentPage + 1)
  }
}

const handlePageChange = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('update:currentPage', page)
    emit('change', page)
  }
}

const handleJump = () => {
  const page = parseInt(jumpPage.value)
  if (page >= 1 && page <= totalPages.value) {
    handlePageChange(page)
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  flex-wrap: wrap;
}

.page-btn {
  padding: 6px 12px;
  border: 1px solid var(--border-color, #d9d9d9);
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--primary, #1890ff);
  color: var(--primary, #1890ff);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-number {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--border-color, #d9d9d9);
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.page-number:hover {
  border-color: var(--primary, #1890ff);
  color: var(--primary, #1890ff);
}

.page-number.active {
  background: var(--primary, #1890ff);
  border-color: var(--primary, #1890ff);
  color: white;
}

.page-jumper {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary, #666);
}

.page-jumper input {
  width: 50px;
  padding: 4px 8px;
  border: 1px solid var(--border-color, #d9d9d9);
  border-radius: 4px;
  text-align: center;
}

.page-jumper input:focus {
  outline: none;
  border-color: var(--primary, #1890ff);
}

.btn-confirm {
  padding: 4px 12px;
  background: var(--primary, #1890ff);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-confirm:hover {
  background: var(--primary-hover, #40a9ff);
}

.page-info {
  font-size: 14px;
  color: var(--text-secondary, #666);
  margin-left: 16px;
}
</style>
