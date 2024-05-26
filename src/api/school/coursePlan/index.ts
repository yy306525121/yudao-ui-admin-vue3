import request from '@/config/axios'

// 课程计划 VO
export interface CoursePlanVO {
  id: number // 主键
  week: number // 星期
  gradeId: number // 年级
  courseTypeId: number // 课程类型
  subjectId: number // 科目
  teacherId: number // 教师
  timeSlotId: number // 课程节次
  start: Date // 课程生效日期
  end: Date // 课程失效日期
}

// 课程计划 API
export const CoursePlanApi = {
  // 查询课程计划分页
  getCoursePlanList: async (params: any) => {
    return await request.get({ url: `/school/course-plan/list`, params })
  },

  // 查询课程计划详情
  getCoursePlan: async (id: number) => {
    return await request.get({ url: `/school/course-plan/get?id=` + id })
  },

  // 新增课程计划
  createCoursePlan: async (data: CoursePlanVO) => {
    return await request.post({ url: `/school/course-plan/create`, data })
  },

  // 修改课程计划
  updateCoursePlan: async (data: CoursePlanVO) => {
    return await request.put({ url: `/school/course-plan/update`, data })
  },

  // 删除课程计划
  deleteCoursePlan: async (id: number) => {
    return await request.delete({ url: `/school/course-plan/delete?id=` + id })
  },

  // 导出课程计划 Excel
  exportCoursePlan: async (params) => {
    return await request.download({ url: `/school/course-plan/export-excel`, params })
  }
}
