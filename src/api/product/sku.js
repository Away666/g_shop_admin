import request from "@/utils/request"

// 获取sku列表
export const reqSkuList = (page, limit) => request({
  url: `/admin/product/list/${page}/${limit}`,
  method: "get"
})

// 上架
export const reqSale = (spuId) => request({
  url: `/admin/product/onSale/${spuId}`,
  method: "get"
})

// 下架
export const reqCancel = (spuId) => request({
  url: `/admin/product/cancelSale/${spuId}`,
  method: "get"
})

// 获取sku详情
export const reqSkuById = (skuId) => request({
  url: `/admin/product/getSkuById/${skuId}`,
  method: "get"
})
