<template>
  <div class="workshop-page">
    <Card title="🏭 车间列表">
      <DataTable
        :data="workshopStore.workshopList"
        :columns="tableColumns"
        :loading="workshopStore.loading"
      >
        <template #actions="{ row }">
          <button class="btn btn-primary btn-sm" @click="handleEdit(row)">
            编辑
          </button>
        </template>
      </DataTable>
    </Card>

    <Card :title="workshopStore.editing ? '📝 编辑车间' : '➕ 添加车间'" style="margin-top: 24px;">
      <div class="form-row">
        <FormItem
          v-model="workshopStore.form.workshop_id"
          label="车间编号"
          placeholder="请输入车间编号"
          :disabled="workshopStore.editing"
          required
          style="flex: 1;"
        />
        <FormItem
          v-model="workshopStore.form.workshop_name"
          label="车间名称"
          placeholder="请输入车间名称"
          required
          style="flex: 1;"
        />
        <FormItem
          v-model="workshopStore.form.manager"
          label="负责人"
          placeholder="请输入负责人"
          style="flex: 1;"
        />
      </div>
      <div class="form-actions" style="margin-top: 20px;">
        <button class="btn btn-primary" @click="handleSave">
          {{ workshopStore.editing ? '更新车间' : '添加车间' }}
        </button>
        <button class="btn btn-default" @click="handleReset">
          重置
        </button>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useWorkshopStore } from '@stores'
import { Card, DataTable, FormItem } from '@components/common'

const workshopStore = useWorkshopStore()

const tableColumns = [
  { key: 'workshop_id', title: '车间编号', width: '150px' },
  { key: 'workshop_name', title: '车间名称', width: '200px' },
  { key: 'manager', title: '负责人', width: '150px' },
]

const handleEdit = (row) => {
  workshopStore.form = {
    workshop_id: row.workshop_id,
    workshop_name: row.workshop_name,
    manager: row.manager || '',
  }
  workshopStore.editing = true
}

const handleSave = async () => {
  try {
    await workshopStore.saveWorkshop()
    alert(workshopStore.editing ? '车间已更新' : '车间已添加')
  } catch (error) {
    alert(error.message)
  }
}

const handleReset = () => {
  workshopStore.resetForm()
}

onMounted(() => {
  workshopStore.loadWorkshops()
})
</script>

<style scoped>
.workshop-page {
  animation: slide-up 0.3s ease;
}

.form-actions {
  display: flex;
  gap: 12px;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
