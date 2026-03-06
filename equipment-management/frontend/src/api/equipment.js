import request from '@utils/request'

export const getEquipmentList = (params = {}) => {
  return request({
    url: '/api/equipment',
    method: 'get',
    params,
  })
}

export const getEquipmentById = (id) => {
  return request({
    url: `/api/equipment/${encodeURIComponent(id)}`,
    method: 'get',
  })
}

export const createEquipment = (data) => {
  return request({
    url: '/api/equipment',
    method: 'post',
    data,
  })
}

export const updateEquipment = (id, data) => {
  return request({
    url: `/api/equipment/${encodeURIComponent(id)}`,
    method: 'put',
    data,
  })
}

export const deleteEquipment = (id) => {
  return request({
    url: `/api/equipment/${encodeURIComponent(id)}`,
    method: 'delete',
  })
}
