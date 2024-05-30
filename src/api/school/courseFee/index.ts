import request from '@/config/axios'

// 课时费明细 VO
export interface CourseFeeVO {
  id: number // 主键
  count: number // 课时费
  teacherId: number // 教师编号
  gradeId: number // 班级编号
  subjectId: number // 课程ID
  week: number // 星期
  timeSlotId: number // 课程节次编号
  date: Date // 日期
}

export interface CourseFeeCalculateVO {
  teacherId: number
  date: Date
}

export interface CourseFeeDetailListVO {
  date: string
  count: number
}

// 课时费明细 API
export const CourseFeeApi = {
  // 查询课时费明细分页
  getCourseFeePage: async (params: any) => {
    return await request.get({ url: `/school/course-fee/page`, params })
  },

  calculate: async (data: CourseFeeCalculateVO) => {
    return await request.post({ url: `/school/course-fee/calculate`, data })
  },

  getDetailList: async (params: any) => {
    return await request.get({ url: `/school/course-fee/detail`, params })
  },

  // 查询课时费明细详情
  getCourseFee: async (id: number) => {
    return await request.get({ url: `/school/course-fee/get?id=` + id })
  },

  // 新增课时费明细
  createCourseFee: async (data: CourseFeeVO) => {
    return await request.post({ url: `/school/course-fee/create`, data })
  },

  // 修改课时费明细
  updateCourseFee: async (data: CourseFeeVO) => {
    return await request.put({ url: `/school/course-fee/update`, data })
  },

  // 删除课时费明细
  deleteCourseFee: async (id: number) => {
    return await request.delete({ url: `/school/course-fee/delete?id=` + id })
  },

  // 导出课时费明细 Excel
  exportCourseFee: async (params) => {
    return await request.download({ url: `/school/course-fee/export-excel`, params })
  }
}
