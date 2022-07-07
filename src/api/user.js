import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/login/admin/acl/index/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/login/admin/acl/index/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/login/admin/acl/index/logout',
    method: 'post'
  })
}
