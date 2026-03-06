<template>
  <div class="data-table-wrapper">
    <div v-if="loading" class="table-loading">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>

    <div v-else-if="!data || data.length === 0" class="table-empty">
      <span class="empty-icon">📭</span>
      <span>{{ emptyText }}</span>
    </div>

    <table v-else class="data-table">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :style="{ width: column.width, textAlign: column.align || 'left' }"
            :class="{ sortable: column.sortable }"
            @click="handleSort(column)"
          >
            {{ column.title }}
            <span v-if="column.sortable" class="sort-icon">
              {{ getSortIcon(column) }}
            </span>
          </th>
          <th v-if="$slots.actions" style="width: 150px; text-align: center;">
            操作
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in data"
          :key="getRowKey(row, index)"
          :class="{ 'row-highlight': highlightRow && highlightRow(row) }"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            :style="{ textAlign: column.align || 'left' }"
          >
            <slot
              :name="`cell-${column.key}`"
              :row="row"
              :value="row[column.key]"
              :index="index"
            >
              <template v-if="column.formatter">
                {{ column.formatter(row[column.key], row) }}
              </template>
              <template v-else-if="column.render">
                <component :is="column.render(row[column.key], row)" />
              </template>
              <template v-else>
                {{ row[column.key] ?? '-' }}
              </template>
            </slot>
          </td>
          <td v-if="$slots.actions" class="actions-cell">
            <slot name="actions" :row="row" :index="index" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  emptyText: {
    type: String,
    default: '暂无数据',
  },
  rowKey: {
    type: [String, Function],
    default: 'id',
  },
  highlightRow: {
    type: Function,
    default: null,
  },
})

const emit = defineEmits(['sort'])

const sortKey = ref('')
const sortOrder = ref('asc')

const getRowKey = (row, index) => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(row)
  }
  return row[props.rowKey] || index
}

const handleSort = (column) => {
  if (!column.sortable) return

  if (sortKey.value === column.key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = column.key
    sortOrder.value = 'asc'
  }

  emit('sort', { key: sortKey.value, order: sortOrder.value })
}

const getSortIcon = (column) => {
  if (sortKey.value !== column.key) return '⇅'
  return sortOrder.value === 'asc' ? '↑' : '↓'
}
</script>

<style scoped>
.data-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color, #e8e8e8);
}

.data-table th {
  background: var(--table-header-bg, #fafafa);
  font-weight: 600;
  color: var(--text-primary, #262626);
  white-space: nowrap;
}

.data-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.data-table th.sortable:hover {
  background: var(--table-header-hover-bg, #f0f0f0);
}

.sort-icon {
  margin-left: 4px;
  font-size: 12px;
  color: var(--text-secondary, #8c8c8c);
}

.data-table tbody tr:hover {
  background: var(--table-row-hover-bg, #f5f5f5);
}

.data-table tbody tr.row-highlight {
  background: var(--table-row-highlight-bg, #e6f7ff);
}

.actions-cell {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.table-loading,
.table-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: var(--text-secondary, #8c8c8c);
  gap: 12px;
}

.empty-icon {
  font-size: 48px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color, #e8e8e8);
  border-top-color: var(--primary, #1890ff);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
