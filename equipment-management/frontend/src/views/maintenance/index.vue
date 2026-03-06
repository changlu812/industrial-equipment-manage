<template>
  <div class="maintenance-page">
    <Card title="🔧 维修记录管理">
      <div class="toolbar">
        <div class="toolbar-left">
          <FormItem
            v-model="maintenanceStore.currentEquipmentId"
            type="select"
            placeholder="选择设备查看维修记录"
            :options="equipmentOptions"
            style="min-width: 250px;"
            @change="handleEquipmentChange"
          />
        </div>
      </div>

      <DataTable
        :data="maintenanceStore.paginatedMaintenanceList"
        :columns="maintenanceColumns"
        :loading="maintenanceStore.loading"
        empty-text="请选择设备查看维修记录"
      >
        <template #cell-maintenance_time="{ value }">
          {{ formatDateTime(value) }}
        </template>
        <template #cell-maintenance_cost="{ value }">
          {{ value ? `¥${value.toLocaleString()}` : '-' }}
        </template>
      </DataTable>

      <Pagination
        v-if="maintenanceStore.maintenanceList.length > 0"
        v-model:current-page="maintenanceStore.maintenanceCurrentPage"
        :total="maintenanceStore.maintenanceList.length"
        :page-size="10"
        @change="maintenanceStore.jumpToMaintenancePage"
      />
    </Card>

    <Card title="➕ 添加维修记录" style="margin-top: 24px;">
      <div class="form-row">
        <FormItem
          v-model="maintenanceStore.form.equipment_id"
          type="select"
          label="设备编号"
          placeholder="请选择设备"
          :options="equipmentOptions"
          required
          style="flex: 1;"
        />
        <FormItem
          v-model="maintenanceStore.form.maintenance_time"
          type="date"
          label="维修时间"
          style="flex: 1;"
        />
        <FormItem
          v-model="maintenanceStore.form.fault_type"
          type="select"
          label="故障类型"
          :options="faultTypeOptions"
          required
          style="flex: 1;"
        />
      </div>
      <div class="form-row" style="margin-top: 16px;">
        <FormItem
          v-model="maintenanceStore.form.fault_desc"
          type="textarea"
          label="故障描述"
          placeholder="请输入故障描述"
          :rows="3"
          style="flex: 2;"
        />
        <div style="flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <FormItem
            v-model="maintenanceStore.form.maintenance_cost"
            type="number"
            label="维修费用"
            placeholder="请输入维修费用"
          />
          <FormItem
            v-model="maintenanceStore.form.workshop_id"
            type="select"
            label="维修车间"
            placeholder="请选择车间"
            :options="workshopOptions"
          />
        </div>
      </div>
      <div class="form-actions" style="margin-top: 20px;">
        <button class="btn btn-primary" @click="handleSaveMaintenance">
          添加维修记录
        </button>
        <button class="btn btn-default" @click="handleResetMaintenance">
          重置
        </button>
      </div>
    </Card>

    <Card title="🔍 维修记录查询" style="margin-top: 24px;">
      <div class="toolbar">
        <div class="toolbar-left">
          <FormItem
            v-model="maintenanceStore.searchForm.start"
            type="date"
            label="开始日期"
          />
          <FormItem
            v-model="maintenanceStore.searchForm.end"
            type="date"
            label="结束日期"
          />
          <FormItem
            v-model="maintenanceStore.searchForm.faultType"
            type="select"
            label="故障类型"
            placeholder="所有类型"
            :options="faultTypeOptions"
          />
        </div>
        <div class="toolbar-right">
          <button class="btn btn-primary" @click="handleSearchMaintenance">
            🔍 查询
          </button>
        </div>
      </div>

      <DataTable
        :data="maintenanceStore.paginatedSearchList"
        :columns="searchColumns"
        :loading="maintenanceStore.searchLoading"
      >
        <template #cell-maintenance_time="{ value }">
          {{ formatDateTime(value) }}
        </template>
        <template #cell-maintenance_cost="{ value }">
          {{ value ? `¥${value.toLocaleString()}` : '-' }}
        </template>
      </DataTable>

      <Pagination
        v-if="maintenanceStore.searchList.length > 0"
        v-model:current-page="maintenanceStore.searchCurrentPage"
        :total="maintenanceStore.searchList.length"
        :page-size="10"
        @change="maintenanceStore.jumpToSearchPage"
      />
    </Card>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useEquipmentStore, useWorkshopStore, useMaintenanceStore } from '@stores'
import { Card, DataTable, Pagination, FormItem } from '@components/common'

const equipmentStore = useEquipmentStore()
const workshopStore = useWorkshopStore()
const maintenanceStore = useMaintenanceStore()

const equipmentOptions = computed(() => [
  { value: '', label: '请选择设备' },
  ...equipmentStore.equipmentList.map(e => ({
    value: e.equipment_id,
    label: `${e.equipment_id} - ${e.model}`,
  })),
])

const workshopOptions = computed(() => [
  { value: '', label: '请选择车间' },
  ...workshopStore.workshopList.map(w => ({
    value: w.workshop_id,
    label: w.workshop_name,
  })),
])

const faultTypeOptions = computed(() => [
  { value: '', label: '所有类型' },
  ...maintenanceStore.faultTypes.map(type => ({
    value: type,
    label: type,
  })),
])

const maintenanceColumns = [
  { key: 'equipment_id', title: '设备编号', width: '120px' },
  { key: 'maintenance_time', title: '维修时间', width: '160px' },
  { key: 'fault_type', title: '故障类型', width: '120px' },
  { key: 'fault_desc', title: '故障描述', width: '200px' },
  { key: 'maintenance_cost', title: '维修费用', width: '120px', align: 'right' },
  { key: 'workshop_name', title: '维修车间', width: '120px' },
]

const searchColumns = [
  { key: 'equipment_id', title: '设备编号', width: '120px' },
  { key: 'model', title: '设备型号', width: '150px' },
  { key: 'maintenance_time', title: '维修时间', width: '160px' },
  { key: 'fault_type', title: '故障类型', width: '120px' },
  { key: 'fault_desc', title: '故障描述', width: '200px' },
  { key: 'maintenance_cost', title: '维修费用', width: '120px', align: 'right' },
]

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toISOString().replace('T', ' ').slice(0, 19)
}

const handleEquipmentChange = () => {
  if (maintenanceStore.currentEquipmentId) {
    maintenanceStore.loadEquipmentMaintenance(maintenanceStore.currentEquipmentId)
    maintenanceStore.form.equipment_id = maintenanceStore.currentEquipmentId
  }
}

const handleSaveMaintenance = async () => {
  try {
    await maintenanceStore.saveMaintenance()
    alert('维修记录已添加')
  } catch (error) {
    alert(error.message)
  }
}

const handleResetMaintenance = () => {
  maintenanceStore.resetForm()
}

const handleSearchMaintenance = () => {
  maintenanceStore.searchMaintenanceRecords()
}

onMounted(() => {
  equipmentStore.loadEquipment()
  workshopStore.loadWorkshops()
  if (maintenanceStore.currentEquipmentId) {
    maintenanceStore.loadEquipmentMaintenance(maintenanceStore.currentEquipmentId)
  }
})
</script>

<style scoped>
.maintenance-page {
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
