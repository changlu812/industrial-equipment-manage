<template>
  <div class="statistics-page">
    <Card title="📊 车间设备统计">
      <DataTable
        :data="workshopStore.paginatedStats"
        :columns="statsColumns"
        :loading="workshopStore.statsLoading"
      >
        <template #cell-total_equipment="{ value }">
          <span class="stat-number">{{ value }}</span>
        </template>
        <template #cell-active_count="{ value }">
          <span class="stat-number success">{{ value }}</span>
        </template>
        <template #cell-repair_count="{ value }">
          <span class="stat-number warning">{{ value }}</span>
        </template>
        <template #cell-scrap_count="{ value }">
          <span class="stat-number danger">{{ value }}</span>
        </template>
        <template #cell-total_maintenance_cost="{ value }">
          <span class="stat-number">{{ value ? `¥${value.toLocaleString()}` : '¥0' }}</span>
        </template>
      </DataTable>

      <Pagination
        v-if="workshopStore.workshopStats.length > 0"
        v-model:current-page="workshopStore.statsCurrentPage"
        :total="workshopStore.workshopStats.length"
        :page-size="10"
        @change="workshopStore.jumpToStatsPage"
      />
    </Card>

    <Card title="📈 设备维修趋势分析" style="margin-top: 24px;">
      <div class="toolbar">
        <div class="toolbar-left">
          <FormItem
            v-model="maintenanceStore.trendEquipmentId"
            type="select"
            placeholder="选择设备查看维修趋势"
            :options="equipmentOptions"
            style="min-width: 250px;"
          />
          <button class="btn btn-primary" @click="handleLoadEquipmentTrend">
            查询设备趋势
          </button>
        </div>
        <div class="toolbar-right">
          <FormItem
            v-model="maintenanceStore.trendWorkshopId"
            type="select"
            placeholder="选择车间查看维修趋势"
            :options="workshopOptions"
            style="min-width: 200px;"
          />
          <button class="btn btn-primary" @click="handleLoadWorkshopTrend">
            查询车间趋势
          </button>
        </div>
      </div>

      <DataTable
        :data="maintenanceStore.paginatedTrendList"
        :columns="trendColumns"
        :loading="maintenanceStore.trendLoading"
        empty-text="请选择设备或车间查看维修趋势"
      >
        <template #cell-maintenance_time="{ value }">
          {{ formatDateTime(value) }}
        </template>
        <template #cell-maintenance_cost="{ value }">
          {{ value ? `¥${value.toLocaleString()}` : '-' }}
        </template>
      </DataTable>

      <Pagination
        v-if="maintenanceStore.trendList.length > 0"
        v-model:current-page="maintenanceStore.trendCurrentPage"
        :total="maintenanceStore.trendList.length"
        :page-size="10"
        @change="maintenanceStore.jumpToTrendPage"
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

const statsColumns = [
  { key: 'workshop_id', title: '车间编号', width: '120px' },
  { key: 'workshop_name', title: '车间名称', width: '150px' },
  { key: 'manager', title: '负责人', width: '120px' },
  { key: 'total_equipment', title: '设备总数', width: '100px', align: 'center' },
  { key: 'active_count', title: '在用', width: '80px', align: 'center' },
  { key: 'repair_count', title: '维修中', width: '80px', align: 'center' },
  { key: 'scrap_count', title: '报废', width: '80px', align: 'center' },
  { key: 'total_maintenance_cost', title: '维修总费用', width: '150px', align: 'right' },
]

const trendColumns = [
  { key: 'equipment_id', title: '设备编号', width: '120px' },
  { key: 'model', title: '设备型号', width: '150px' },
  { key: 'maintenance_time', title: '维修时间', width: '160px' },
  { key: 'fault_type', title: '故障类型', width: '120px' },
  { key: 'fault_desc', title: '故障描述', width: '200px' },
  { key: 'maintenance_cost', title: '维修费用', width: '120px', align: 'right' },
  { key: 'workshop_name', title: '维修车间', width: '120px' },
]

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toISOString().replace('T', ' ').slice(0, 19)
}

const handleLoadEquipmentTrend = () => {
  maintenanceStore.loadEquipmentTrend()
}

const handleLoadWorkshopTrend = () => {
  maintenanceStore.loadWorkshopTrend()
}

onMounted(() => {
  equipmentStore.loadEquipment()
  workshopStore.loadWorkshops()
  workshopStore.loadWorkshopStats()
})
</script>

<style scoped>
.statistics-page {
  animation: slide-up 0.3s ease;
}

.stat-number {
  font-weight: 600;
  font-size: 16px;
}

.stat-number.success {
  color: var(--success);
}

.stat-number.warning {
  color: var(--warning);
}

.stat-number.danger {
  color: var(--danger);
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
