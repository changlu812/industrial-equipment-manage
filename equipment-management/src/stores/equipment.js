import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  getEquipmentList,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} from "@api/equipment";

export const useEquipmentStore = defineStore('equipment',()=>{
  const equipmentList = ref([]);
  const loading = ref(false);
  const keyword = ref('');
  const status = ref('');
  const currentPage = ref(1);
  const pageSize = ref(10)

  const total = computed(()=>equipmentList.value.length)
  const totalPages = computed(()=>Math.ceil(total.value/pageSize.value) || 1);

  const paginatedList = computed(()=>{
    const start = (currentPage.value-1)*pageSize.value;
    return equipmentList.value.slice(start,start + pageSize.value);
  })

  const form = ref({
    equipment_id:'',
    model:'',
    factory_date:'',
    purchase_price:null,
    workshop_id:'',
    person_in_charge:'',
    status:'在用',
  });

  const editing = ref(false);

  const loadEquipment = async()=>{
    loading.value = true;
    try {
      const params = {}
      if (keyword.value) params.keyword = keyword.value
      if (status.value) params.status = status.value

      const data = await getEquipmentList(params)
      equipmentList.value = data
      currentPage.value = 1
    } catch (error) {
      console.error('加载设备列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  const saveEquipment = async () => {
    if (!form.value.equipment_id || !form.value.model) {
      throw new Error('设备编号和型号为必填项')
    }

    const payload = { ...form.value }

    if (editing.value) {
      await updateEquipment(form.value.equipment_id, payload)
    } else {
      await createEquipment(payload)
    }

    await loadEquipment()
    resetForm()
  }

  const editEquipment = (equipment) => {
    form.value = {
      equipment_id: equipment.equipment_id,
      model: equipment.model,
      factory_date: equipment.factory_date ? equipment.factory_date.slice(0, 10) : '',
      purchase_price: equipment.purchase_price,
      workshop_id: equipment.workshop_id || '',
      person_in_charge: equipment.person_in_charge,
      status: equipment.status,
    }
    editing.value = true
  }

  const resetForm = () => {
    form.value = {
      equipment_id: '',
      model: '',
      factory_date: '',
      purchase_price: null,
      workshop_id: '',
      person_in_charge: '',
      status: '在用',
    }
    editing.value = false
  }

  const removeEquipment = async (equipmentId) => {
    await deleteEquipment(equipmentId)
    await loadEquipment()
  }

  const jumpToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  return {
    equipmentList,
    loading,
    keyword,
    status,
    currentPage,
    pageSize,
    total,
    totalPages,
    paginatedList,
    form,
    editing,
    loadEquipment,
    saveEquipment,
    editEquipment,
    resetForm,
    removeEquipment,
    jumpToPage,
  }
})