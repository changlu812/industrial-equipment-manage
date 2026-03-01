import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getWorkshopList, createWorkshop, getWorkshopStats } from '@api/workshop'

export const useWorkshopStore = defineStore('workshop', () => {
  const workshopList = ref([])
  const loading = ref(false)
  const statsLoading = ref(false)
  const workshopStats = ref([])
  const statsCurrentPage = ref(1)
  const pageSize = ref(10)

  const statsTotalPages = computed(() => Math.ceil(workshopStats.value.length / pageSize.value) || 1)

  const paginatedStats = computed(() => {
    const start = (statsCurrentPage.value - 1) * pageSize.value
    return workshopStats.value.slice(start, start + pageSize.value)
  })

  const form = ref({
    workshop_id: '',
    workshop_name: '',
    manager: '',
  })

  const editing = ref(false)

  const loadWorkshops = async () => {
    loading.value = true
    try {
      const data = await getWorkshopList()
      workshopList.value = data
    } catch (error) {
      console.error('加载车间列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  const loadWorkshopStats = async () => {
    statsLoading.value = true
    try {
      const data = await getWorkshopStats()
      workshopStats.value = data
      statsCurrentPage.value = 1
    } catch (error) {
      console.error('加载车间统计失败:', error)
    } finally {
      statsLoading.value = false
    }
  }

  const saveWorkshop = async () => {
    if (!form.value.workshop_id || !form.value.workshop_name) {
      throw new Error('车间编号和名称为必填项')
    }

    const payload = { ...form.value }
    await createWorkshop(payload)
    await loadWorkshops()
    resetForm()
  }

  const resetForm = () => {
    form.value = {
      workshop_id: '',
      workshop_name: '',
      manager: '',
    }
    editing.value = false
  }

  const jumpToStatsPage = (page) => {
    if (page >= 1 && page <= statsTotalPages.value) {
      statsCurrentPage.value = page
    }
  }

  return {
    workshopList,
    loading,
    statsLoading,
    workshopStats,
    statsCurrentPage,
    statsTotalPages,
    paginatedStats,
    form,
    editing,
    loadWorkshops,
    loadWorkshopStats,
    saveWorkshop,
    resetForm,
    jumpToStatsPage,
  }
})
