import { get, post, put, del } from '@/utils/request';

/**
 * 获取客户列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function fetchCustomers(params) {
  return get('/api/v1/customers', params);
}

/**
 * 创建客户
 * @param {Object} data - 客户数据
 * @returns {Promise}
 */
export function createCustomer(data) {
  return post('/api/v1/customers', data);
}

/**
 * 更新客户信息
 * @param {string} id - 客户ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export function updateCustomer(id, data) {
  return put(`/api/v1/customers/${id}`, data);
}

/**
 * 删除客户
 * @param {string} id - 客户ID
 * @returns {Promise}
 */
export function deleteCustomer(id) {
  return del(`/api/v1/customers/${id}`);
}