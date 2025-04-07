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

/**
 * 上传治疗记录文件
 * @param {FormData} formData - 包含治疗记录文件的表单数据
 * @returns {Promise} - 返回上传结果
 */
export function uploadTreatmentRecord(formData) {
  return post('/api/v1/common/upload/treatment', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}