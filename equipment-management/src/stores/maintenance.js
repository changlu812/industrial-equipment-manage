import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getEquipmentMaintenance,
  createMaintenance,
  searchMaintenance,
  getEquipmentTrend,
  getWorkshopTrend,
} from '@api/maintenance'

export const useMaintenanceStore = defineStore('maintenance', () => {
  const maintenanceList = ref([])
  const searchList = ref([])
  const trendList = ref([])
  const loading = ref(false)
  const searchLoading = ref(false)
  const trendLoading = ref(false)

  const currentEquipmentId = ref('')
  const trendEquipmentId = ref('')
  const trendWorkshopId = ref('')

  const maintenanceCurrentPage = ref(1)
  const searchCurrentPage = ref(1)
  const trendCurrentPage = ref(1)
  const pageSize = ref(10)

  const maintenanceTotalPages = computed(() => Math.ceil(maintenanceList.value.length / pageSize.value) || 1)
  const searchTotalPages = computed(() => Math.ceil(searchList.value.length / pageSize.value) || 1)
  const trendTotalPages = computed(() => Math.ceil(trendList.value.length / pageSize.value) || 1)

  const paginatedMaintenanceList = computed(() => {
    const start = (maintenanceCurrentPage.value - 1) * pageSize.value
    return maintenanceList.value.slice(start, start + pageSize.value)
  })

  const paginatedSearchList = computed(() => {
    const start = (searchCurrentPage.value - 1) * pageSize.value
    return searchList.value.slice(start, start + pageSize.value)
  })

  const paginatedTrendList = computed(() => {
    const start = (trendCurrentPage.value - 1) * pageSize.value
    return trendList.value.slice(start, start + pageSize.value)
  })

  const form = ref({
    equipment_id: '',
    maintenance_time: '',
    fault_type: '主轴异响',
    fault_desc: '',
    maintenance_cost: null,
    workshop_id: '',
  })

  const searchForm = ref({
    start: '',
    end: '',
    faultType: '',
  })

  const faultTypes = [
    '主轴异响',
    '电机故障',
    '液压系统漏油',
    '控制系统失灵',
    '传动带断裂',
    '轴承磨损',
    '其他',
  ]

  const loadEquipmentMaintenance = async (equipmentId) => {
    if (!equipmentId) return
    loading.value = true
    try {
      const data = await getEquipmentMaintenance(equipmentId)
      maintenanceList.value = data
      maintenanceCurrentPage.value = 1
    } catch (error) {
      console.error('加载维修记录失败:', error)
    } finally {
      loading.value = false
    }
  }

  const saveMaintenance = async () => {
    if (!form.value.equipment_id) {
      throw new Error('设备编号为必填项')
    }

    const payload = { ...form.value }
    await createMaintenance(payload)

    if (currentEquipmentId.value === form.value.equipment_id) {
      await loadEquipmentMaintenance(currentEquipmentId.value)
    }
    resetForm()
  }

  const resetForm = () => {
    form.value = {
      equipment_id: currentEquipmentId.value || '',
      maintenance_time: '',
      fault_type: '主轴异响',
      fault_desc: '',
      maintenance_cost: null,
      workshop_id: '',
    }
  }

  const searchMaintenanceRecords = async () => {
    searchLoading.value = true
    try {
      const params = {}
      if (searchForm.value.start) params.start = searchForm.value.start
      if (searchForm.value.end) params.end = searchForm.value.end
      if (searchForm.value.faultType) params.faultType = searchForm.value.faultType

      const data = await searchMaintenance(params)
      searchList.value = data
      searchCurrentPage.value = 1
    } catch (error) {
      console.error('搜索维修记录失败:', error)
    } finally {
      searchLoading.value = false
    }
  }

  const loadEquipmentTrend = async () => {
    if (!trendEquipmentId.value) return
    trendLoading.value = true
    try {
      const data = await getEquipmentTrend(trendEquipmentId.value)
      trendList.value = data
      trendCurrentPage.value = 1
    } catch (error) {
      console.error('加载设备维修趋势失败:', error)
    } finally {
      trendLoading.value = false
    }
  }

  const loadWorkshopTrend = async () => {
    if (!trendWorkshopId.value) return
    trendLoading.value = true
    try {
      const data = await getWorkshopTrend(trendWorkshopId.value)
      trendList.value = data
      trendCurrentPage.value = 1
    } catch (error) {
      console.error('加载车间维修趋势失败:', error)
    } finally {
      trendLoading.value = false
    }
  }

  const jumpToMaintenancePage = (page) => {
    if (page >= 1 && page <= maintenanceTotalPages.value) {
      maintenanceCurrentPage.value = page
    }
  }

  const jumpToSearchPage = (page) => {
    if (page >= 1 && page <= searchTotalPages.value) {
      searchCurrentPage.value = page
    }
  }

  const jumpToTrendPage = (page) => {
    if (page >= 1 && page <= trendTotalPages.value) {
      trendCurrentPage.value = page
    }
  }

  return {
    maintenanceList,
    searchList,
    trendList,
    loading,
    searchLoading,
    trendLoading,
    currentEquipmentId,
    trendEquipmentId,
    trendWorkshopId,
    maintenanceCurrentPage,
    searchCurrentPage,
    trendCurrentPage,
    maintenanceTotalPages,
    searchTotalPages,
    trendTotalPages,
    paginatedMaintenanceList,
    paginatedSearchList,
    paginatedTrendList,
    form,
    searchForm,
    faultTypes,
    loadEquipmentMaintenance,
    saveMaintenance,
    resetForm,
    searchMaintenanceRecords,
    loadEquipmentTrend,
    loadWorkshopTrend,
    jumpToMaintenancePage,
    jumpToSearchPage,
    jumpToTrendPage,
  }
})
