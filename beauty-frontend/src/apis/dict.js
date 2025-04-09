import { post, get } from '../utils/request';

export function getDictList(data) {
  return get('/api/v1/common/dicts', data);
}

export function createDict(data) {
  return post('/api/v1/common/dicts', data);
}