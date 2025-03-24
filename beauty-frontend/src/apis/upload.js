import { post } from '@/utils/request'

/**
 * 上传图片
 * @param {FormData} formData - 包含图片的表单数据
 * @returns {Promise} - 返回上传结果
 */
export function uploadImages(formData) {
  return post('/api/v1/common/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
