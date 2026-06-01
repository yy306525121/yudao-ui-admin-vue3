import request from '@/config/axios'

export interface BackendModelVO {
  id?: number | string
  name: string
  dataSourceConfigId: number | string | undefined
  sqlText: string
  status: number
  remark?: string
  createTime?: Date
  fields?: BackendModelField[]
}

export interface BackendModelField {
  id?: number | string
  fieldName: string
  fieldLabel: string
  fieldOrder: number
  listVisible: boolean
  listType?: string
  searchable: boolean
  searchType: string
  searchOperator: string
  dictType?: string
  status: number
  name?: string
  label?: string
}

export interface BackendModelQueryRespVO {
  fields: BackendModelField[]
  pageResult: {
    list: Record<string, any>[]
    total: number
  }
}

export const getBackendModelPage = (params: any) => {
  return request.get({ url: '/infra/backend-model/page', params })
}

export const getBackendModel = (id: number | string) => {
  return request.get({ url: '/infra/backend-model/get?id=' + id })
}

export const createBackendModel = (data: BackendModelVO) => {
  return request.post({ url: '/infra/backend-model/create', data })
}

export const updateBackendModel = (data: BackendModelVO) => {
  return request.put({ url: '/infra/backend-model/update', data })
}

export const updateBackendModelFields = (data: {
  id: number | string
  fields: BackendModelField[]
}) => {
  return request.put({ url: '/infra/backend-model/update-fields', data })
}

export const deleteBackendModel = (id: number) => {
  return request.delete({ url: '/infra/backend-model/delete?id=' + id })
}

export const deleteBackendModelList = (ids: Array<number | string>) => {
  return request.delete({ url: '/infra/backend-model/delete-list', params: { ids: ids.join(',') } })
}

export const previewBackendModel = (data: {
  dataSourceConfigId: number | string | undefined
  sqlText: string
  pageNo: number
  pageSize: number
}) => {
  return request.post({ url: '/infra/backend-model/preview', data })
}

export const queryBackendModelPage = (params: {
  id: string
  pageNo: number
  pageSize: number
  [key: string]: any
}) => {
  return request.get({ url: '/infra/backend-model/page', params })
}

export const exportBackendModel = (params: { id: string; [key: string]: any }) => {
  return request.download({ url: '/infra/backend-model/export-excel', params })
}
