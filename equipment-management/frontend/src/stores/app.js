import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const activeTab = ref('equipment')

  const tabs = [
    { id: 'equipment', name: '设备管理', icon: '📦' },
    { id: 'maintenance', name: '维修管理', icon: '🔧' },
    { id: 'statistics', name: '统计分析', icon: '📊' },
    { id: 'workshop', name: '车间管理', icon: '🏭' },
  ]

  const switchTab = (tabId) => {
    activeTab.value = tabId
  }

  return {
    activeTab,
    tabs,
    switchTab,
  }
})
