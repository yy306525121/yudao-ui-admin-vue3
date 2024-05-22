import request from '@/config/axios'

// 科目信息 VO
export interface SubjectVO {
  id: number // ID
  name: string // 科目名称
  sort: number // 排序
}

// 科目信息 API
export const SubjectApi = {
  // 查询科目信息分页
  getSubjectPage: async (params: any) => {
    return await request.get({ url: `/school/subject/page`, params })
  },

  // 获取科目精简信息列表
  getSimpleSubjectList: async ()=> {
    return await request.get({ url: `/school/subject/simple-list`})
  },

  // 查询科目信息详情
  getSubject: async (id: number) => {
    return await request.get({ url: `/school/subject/get?id=` + id })
  },

  // 新增科目信息
  createSubject: async (data: SubjectVO) => {
    return await request.post({ url: `/school/subject/create`, data })
  },

  // 修改科目信息
  updateSubject: async (data: SubjectVO) => {
    return await request.put({ url: `/school/subject/update`, data })
  },

  // 删除科目信息
  deleteSubject: async (id: number) => {
    return await request.delete({ url: `/school/subject/delete?id=` + id })
  },

  // 导出科目信息 Excel
  exportSubject: async (params) => {
    return await request.download({ url: `/school/subject/export-excel`, params })
  }
}
