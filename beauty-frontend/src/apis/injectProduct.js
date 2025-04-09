import { get, post } from '@/utils/request'

/**
 * 获取注射产品列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function fetchInjectProducts(params) {
  return get('/api/v1/injectProducts', params)
}

/**
 * 创建注射产品记录
 * @param {Object} data - 产品数据
 * @returns {Promise}
 */
export function createInjectProducts(data) {
  return post('/api/v1/injectProducts', data)
} 