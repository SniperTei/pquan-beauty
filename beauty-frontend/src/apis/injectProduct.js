import { get, post, del } from '@/utils/request'

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

/**
 * 批量删除注射产品记录
 * @param {string[]} injectIds - 要删除的产品ID数组
 * @returns {Promise}
 */
export function deleteInjectProducts(injectIds) {
  return del('/api/v1/injectProducts', {
    injectIds  // 直接传入数据作为请求体
  })
}

/**
 * 获取注射产品用量统计
 * @param {Object} params - 查询参数
 * @param {string} params.yearMonth - 统计月份，格式：YYYY-MM
 * @returns {Promise}
 */
export function fetchInjectProductUsage(params) {
  return get('/api/v1/injectProducts/stats/usage', params)
} 
