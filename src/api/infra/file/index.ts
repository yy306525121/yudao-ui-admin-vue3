import request from '@/config/axios'

// 文件预签名地址 Response VO
export interface FilePresignedUrlRespVO {
  // 文件配置编号
  configId: number
  // 文件上传 URL
  uploadUrl: string
  // 文件 URL
  url: string
  // 文件路径
  path: string
}

// 存储文件 Response VO
export interface FileStorageItemVO {
  name: string
  path: string
  directory: boolean
  size?: number
  lastModifiedTime?: Date
  url?: string
}

// 查询文件列表
export const getFilePage = (params: PageParam) => {
  return request.get({ url: '/infra/file/page', params })
}

// 删除文件
export const deleteFile = (id: number) => {
  return request.delete({ url: '/infra/file/delete?id=' + id })
}

// 批量删除文件
export const deleteFileList = (ids: number[]) => {
  return request.delete({ url: '/infra/file/delete-list', params: { ids: ids.join(',') } })
}

// 获取文件预签名地址
export const getFilePresignedUrl = (name: string, directory?: string) => {
  return request.get<FilePresignedUrlRespVO>({
    url: '/infra/file/presigned-url',
    params: { name, directory }
  })
}

// 创建文件
export const createFile = (data: any) => {
  return request.post({ url: '/infra/file/create', data })
}

// 上传文件
export const updateFile = (data: any, onUploadProgress?: Function) => {
  return request.upload({ url: '/infra/file/upload', data, onUploadProgress })
}

// 查询存储文件列表
export const getStorageFileList = (params: {
  configId: number
  path?: string
  keyword?: string
}) => {
  return request.get<FileStorageItemVO[]>({ url: '/infra/file/storage/list', params })
}

// 上传文件到指定存储配置
export const uploadStorageFile = (data: any, onUploadProgress?: Function) => {
  return request.upload({ url: '/infra/file/storage/upload', data, onUploadProgress })
}

// 下载存储文件
export const downloadStorageFile = (params: { configId: number; path: string }) => {
  return request.download({ url: '/infra/file/storage/download', params })
}

// 重命名存储文件
export const renameStorageFile = (data: { configId: number; path: string; newName: string }) => {
  return request.put({ url: '/infra/file/storage/rename', data })
}

// 删除存储文件
export const deleteStorageFile = (params: { configId: number; path: string }) => {
  return request.delete({ url: '/infra/file/storage/delete', params })
}
