<template>
  <div class="equipment-page">
    <Card title="📋 设备查询">
      <div class="toolbar">
        <div class="toolbar-left">
          <FormItem
            v-model="equipmentStore.keyword"
            type="input"
            placeholder="搜索设备编号、型号或车间"
            style="flex: 1; min-width: 250px"
            @enter="handleSearch"
          />
          <FormItem
            v-model="equipmentStore.status"
            type="select"
            placeholder="所有状态"
            :options="statusOptions"
            style="width: 150px"
            @change="handleSearch"
          />
        </div>
        <div class="toolbar-right">
          <button class="btn btn-primary" @click="handleSearch">🔍 查询</button>
        </div>
      </div>

      <DataTable
        :data="equipmentStore.paginatedList"
        :columns="tableColumns"
        :loading="equipmentStore.loading"
        row-key="equipment_id"
      >
        <template #cell-status="{ value }">
          <span :class="getStatusClass(value)">{{ value }}</span>
        </template>
        <template #cell-factory_date="{ value }">
          {{ formatDate(value) }}
        </template>
        <template #cell-purchase_price="{ value }">
          {{ value ? `¥${value.toLocaleString()}` : "-" }}
        </template>
        <template #actions="{ row }">
          <button class="btn btn-primary btn-sm" @click="handleEdit(row)">
            编辑
          </button>
          <button class="btn btn-danger btn-sm" @click="handleDelete(row)">
            删除
          </button>
          <button
            class="btn btn-default btn-sm"
            @click="handleViewMaintenance(row)"
          >
            维修记录
          </button>
        </template>
      </DataTable>

      <Pagination
        v-model:current-page="equipmentStore.currentPage"
        :total="equipmentStore.total"
        :page-size="equipmentStore.pageSize"
        @change="handlePageChange"
      />
    </Card>

    <Card
      :title="equipmentStore.editing ? '📝 编辑设备' : '➕ 添加设备'"
      style="margin-top: 24px"
    >
      <div class="form-row">
        <FormItem
          v-model="equipmentStore.form.equipment_id"
          label="设备编号"
          placeholder="请输入设备编号"
          :disabled="equipmentStore.editing"
          required
          style="flex: 1"
        />
        <FormItem
          v-model="equipmentStore.form.model"
          label="设备型号"
          placeholder="请输入设备型号"
          required
          style="flex: 1"
        />
        <FormItem
          v-model="equipmentStore.form.factory_date"
          type="date"
          label="出厂日期"
          style="flex: 1"
        />
      </div>
      <div class="form-row" style="margin-top: 16px">
        <FormItem
          v-model="equipmentStore.form.purchase_price"
          type="number"
          label="购置价格"
          placeholder="请输入购置价格"
          style="flex: 1"
        />
        <FormItem
          v-model="equipmentStore.form.workshop_id"
          type="select"
          label="所属车间"
          placeholder="请选择车间"
          :options="workshopOptions"
          style="flex: 1"
        />
        <FormItem
          v-model="equipmentStore.form.person_in_charge"
          label="负责人"
          placeholder="请输入负责人"
          style="flex: 1"
        />
        <FormItem
          v-model="equipmentStore.form.status"
          type="select"
          label="设备状态"
          :options="statusOptions"
          required
          style="flex: 1"
        />
      </div>
      <div class="form-actions" style="margin-top: 20px">
        <button class="btn btn-primary" @click="handleSave">
          {{ equipmentStore.editing ? "更新设备" : "添加设备" }}
        </button>
        <button class="btn btn-default" @click="handleReset">重置</button>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import {
  useEquipmentStore,
  useWorkshopStore,
  useMaintenanceStore,
} from "@stores";
import { Card, DataTable, Pagination, FormItem } from "@components/common";

const router = useRouter();
const equipmentStore = useEquipmentStore();
const workshopStore = useWorkshopStore();
const maintenanceStore = useMaintenanceStore();

const statusOptions = [
  { value: "", label: "所有状态" },
  { value: "在用", label: "在用" },
  { value: "维修中", label: "维修中" },
  { value: "报废", label: "报废" },
];

const workshopOptions = computed(() => [
  { value: "", label: "请选择车间" },
  ...workshopStore.workshopList.map((w) => ({
    value: w.workshop_id,
    label: w.workshop_name,
  })),
]);

const tableColumns = [
  { key: "equipment_id", title: "设备编号", width: "120px" },
  { key: "model", title: "设备型号", width: "150px" },
  { key: "factory_date", title: "出厂日期", width: "120px" },
  { key: "purchase_price", title: "购置价格", width: "120px", align: "right" },
  { key: "workshop_name", title: "所属车间", width: "120px" },
  { key: "person_in_charge", title: "负责人", width: "100px" },
  { key: "status", title: "状态", width: "100px", align: "center" },
];

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toISOString().slice(0, 10);
};

const getStatusClass = (status) => {
  const classMap = {
    在用: "status-badge status-active",
    维修中: "status-badge status-repair",
    报废: "status-badge status-scrap",
  };
  return classMap[status] || "status-badge";
};

const handleSearch = () => {
  equipmentStore.loadEquipment();
};

const handlePageChange = (page) => {
  equipmentStore.jumpToPage(page);
};

const handleEdit = (row) => {
  equipmentStore.editEquipment(row);
};

const handleDelete = async (row) => {
  if (!confirm(`确定删除设备 ${row.equipment_id} 吗？`)) return;
  try {
    await equipmentStore.removeEquipment(row.equipment_id);
    alert("设备已删除");
  } catch (error) {
    alert("删除失败: " + error.message);
  }
};

const handleViewMaintenance = (row) => {
  maintenanceStore.currentEquipmentId = row.equipment_id;
  router.push("/maintenance");
};

const handleSave = async () => {
  try {
    await equipmentStore.saveEquipment();
    alert(equipmentStore.editing ? "设备已更新" : "设备已添加");
  } catch (error) {
    alert(error.message);
  }
};

const handleReset = () => {
  equipmentStore.resetForm();
};

onMounted(() => {
  equipmentStore.loadEquipment();
  workshopStore.loadWorkshops();
});
</script>

<style scoped>
.equipment-page {
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
