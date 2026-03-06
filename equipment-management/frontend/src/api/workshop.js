import request from '@utils/request'

export const getWorkshopList = () => {
  return request({
    url: '/api/workshops',
    method: 'get',
  })
}

export const createWorkshop = (data) => {
  return request({
    url: '/api/workshops',
    method: 'post',
    data,
  })
}

export const getWorkshopStats = () => {
  return request({
    url: '/api/stats/workshops',
    method: 'get',
  })
}
