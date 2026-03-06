import request from '@utils/request'

export const getEquipmentMaintenance = (equipmentId) => {
  return request({
    url: `/api/equipment/${encodeURIComponent(equipmentId)}/maintenance`,
    method: 'get',
  })
}

export const createMaintenance = (data) => {
  return request({
    url: '/api/maintenance',
    method: 'post',
    data,
  })
}

export const searchMaintenance = (params = {}) => {
  return request({
    url: '/api/maintenance/search',
    method: 'get',
    params,
  })
}

export const getEquipmentTrend = (equipmentId) => {
  return request({
    url: `/api/maintenance/trend/equipment/${encodeURIComponent(equipmentId)}`,
    method: 'get',
  })
}

export const getWorkshopTrend = (workshopId) => {
  return request({
    url: `/api/maintenance/trend/workshop/${encodeURIComponent(workshopId)}`,
    method: 'get',
  })
}
