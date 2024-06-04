import request from '@/config/axios'

// 考试时间规则 VO
export interface ExamRuleVO {
  id: number // ID
  gradeIds: string // 班级ID
  startDate: Date // 开始日期
  startTimeSlotId: number // 开始节次
  endDate: Date // 结束日期
  endTimeSlotId: number // 结束节次
}

// 考试时间规则 API
export const ExamRuleApi = {
  // 查询考试时间规则分页
  getExamRulePage: async (params: any) => {
    return await request.get({ url: `/school/exam-rule/page`, params })
  },

  // 查询考试时间规则详情
  getExamRule: async (id: number) => {
    return await request.get({ url: `/school/exam-rule/get?id=` + id })
  },

  // 新增考试时间规则
  createExamRule: async (data: ExamRuleVO) => {
    return await request.post({ url: `/school/exam-rule/create`, data })
  },

  // 修改考试时间规则
  updateExamRule: async (data: ExamRuleVO) => {
    return await request.put({ url: `/school/exam-rule/update`, data })
  },

  // 删除考试时间规则
  deleteExamRule: async (id: number) => {
    return await request.delete({ url: `/school/exam-rule/delete?id=` + id })
  },

  // 导出考试时间规则 Excel
  exportExamRule: async (params) => {
    return await request.download({ url: `/school/exam-rule/export-excel`, params })
  }
}