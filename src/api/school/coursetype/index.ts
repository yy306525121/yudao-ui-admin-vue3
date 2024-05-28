import request from '@/config/axios'

// 课程类型 VO
export interface CourseTypeVO {
  id: number // 主键
  name: string // 课程类型名称
  type: number
  num: number // 每一节该类型的课按多少课时算
}

// 课程类型 API
export const CourseTypeApi = {
  // 查询课程类型分页
  getCourseTypePage: async (params: any) => {
    return await request.get({ url: `/school/course-type/page`, params })
  },

  getSimpleCourseTypeList: async (): Promise<CourseTypeVO[]> => {
    return await request.get({ url: `/school/course-type/simple-list` })
  },

  // 查询课程类型详情
  getCourseType: async (id: number) => {
    return await request.get({ url: `/school/course-type/get?id=` + id })
  },

  // 新增课程类型
  createCourseType: async (data: CourseTypeVO) => {
    return await request.post({ url: `/school/course-type/create`, data })
  },

  // 修改课程类型
  updateCourseType: async (data: CourseTypeVO) => {
    return await request.put({ url: `/school/course-type/update`, data })
  },

  // 删除课程类型
  deleteCourseType: async (id: number) => {
    return await request.delete({ url: `/school/course-type/delete?id=` + id })
  },

  // 导出课程类型 Excel
  exportCourseType: async (params) => {
    return await request.download({ url: `/school/course-type/export-excel`, params })
  }
}
