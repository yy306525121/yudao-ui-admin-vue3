import request from '@/config/axios'

// 班级 VO
export interface GradeVO {
  id: number // 编号
  name: string // 班级名称
  parentId: number // 所属年级编号
  sort: number // 显示排序
}

// 班级 API
export const GradeApi = {
  // 查询班级列表
  getGradeList: async (params) => {
    return await request.get({ url: `/school/grade/list`, params })
  },

  // 查询班级树形列表
  getGradeTree: async () => {
    return await request.get({ url: `/school/grade/tree` })
  },

  // 查询班级详情
  getGrade: async (id: number) => {
    return await request.get({ url: `/school/grade/get?id=` + id })
  },

  // 新增班级
  createGrade: async (data: GradeVO) => {
    return await request.post({ url: `/school/grade/create`, data })
  },

  // 修改班级
  updateGrade: async (data: GradeVO) => {
    return await request.put({ url: `/school/grade/update`, data })
  },

  // 删除班级
  deleteGrade: async (id: number) => {
    return await request.delete({ url: `/school/grade/delete?id=` + id })
  },

  // 导出班级 Excel
  exportGrade: async (params) => {
    return await request.download({ url: `/school/grade/export-excel`, params })
  }
}
