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

/**
 * 获取总客户数
 * @returns {Promise}
 */
export function fetchTotalCustomers() {
  return get('/api/v1/customers/total')
}

/**
 * 获取某天新增客户数
 * @param {string} date - 日期，格式：YYYY-MM-DD
 * @returns {Promise}
 */
export function fetchNewCustomers(date) {
  return get('/api/v1/customers/new', { date })
}

/**
 * 获取客户统计数据
 * @param {Object} data - 查询参数
 * @param {string} data.year - 年份，如：2025
 * @param {number} data.month - 月份，如：1-12（需要同时提供year）
 * @param {string} data.date - 具体日期，格式：YYYY-MM-DD
 * @param {string} data.startDate - 开始日期，格式：YYYY-MM-DD
 * @param {string} data.endDate - 结束日期，格式：YYYY-MM-DD
 * @returns {Promise}
 */
export function fetchCustomerStatistics(data) {
  return get('/api/v1/customers/stats', data)
}

