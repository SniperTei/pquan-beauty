import { get, post, put, del } from '@/utils/request'

/**
 * 获取消费记录列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function fetchPurchaseRecords(params) {
  return get('/api/v1/purchaseRecords', params)
}

/**
 * 创建消费记录
 * @param {Object} data - 消费记录数据
 * @returns {Promise}
 */
export function createPurchaseRecord(data) {
  return post('/api/v1/purchaseRecords', data)
}

/**
 * 更新消费记录
 * @param {string} id - 消费记录ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export function updatePurchaseRecord(id, data) {
  return put(`/api/v1/purchaseRecords/${id}`, data)
}

/**
 * 删除消费记录
 * @param {string} id - 消费记录ID
 * @returns {Promise}
 */
export function deletePurchaseRecord(id) {
  return del(`/api/v1/purchaseRecords/${id}`)
}

/**
 * 导入消费记录
 * @param {FormData} formData - 包含Excel文件的FormData对象
 * @returns {Promise}
 */
export function importPurchaseRecords(formData) {
  return post('/api/v1/purchaseRecords/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
} 