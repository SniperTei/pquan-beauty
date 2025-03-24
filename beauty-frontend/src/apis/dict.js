import { post, get } from '../utils/request';

export function getDictList() {
  return get('/api/v1/common/dicts');
}

export function createDict(data) {
  return post('/api/v1/common/dicts', data);
}