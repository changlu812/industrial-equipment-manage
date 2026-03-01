import { defineStore } from "pinia";
import { ref } from "vue";

export const useAppStore = defineStore('app',()=>{
  const activeTab = ref('equipment');

  const tabs = [
    {id: 'equipment',name: '设备管理'},
    {id: 'maintenance',name: '维修管理'},
    {id: 'statistics',name: '统计分析'},
    {id: 'workshop',name: '车间管理'},
  ]
  const switchTab =(tabId)=>{
    activeTab.value = tabId;
  }
  return{
    activeTab,
    tabs,
    switchTab,
  }
})