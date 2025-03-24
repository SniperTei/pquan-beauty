import { post } from '../utils/request';

/**
 * 用户注册
 * @param {Object} userData - 用户注册数据
 * @param {string} userData.username - 用户名
 * @param {string} userData.password - 密码
 * @param {string} userData.email - 电子邮件
 * @param {boolean} autoShowError - 是否自动显示错误提示，默认为true
 * @returns {Promise} - 返回注册结果的Promise
 */
export function register(userData, autoShowError = true) {
  return post('api/v1/users/register', userData, autoShowError);
}

/**
 * 用户登录
 * @param {Object} loginData - 登录数据
 * @param {string} loginData.username - 用户名
 * @param {string} loginData.password - 密码
 * @param {boolean} autoShowError - 是否自动显示错误提示，默认为true
 * @returns {Promise} - 返回登录结果的Promise
 */
export function login(loginData, autoShowError = true) {
  return post('api/v1/users/login', loginData, autoShowError).then(response => {
    // 登录成功后保存token到localStorage
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  });
}

/**
 * 用户登出
 * @returns {void}
 */
export function logout() {
  // 清除本地存储的token
  localStorage.removeItem('token');
} 