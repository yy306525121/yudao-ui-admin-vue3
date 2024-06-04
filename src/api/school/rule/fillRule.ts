import request from '@/config/axios'

// 补课规则 VO
export interface FillRuleVO {
  id: number // ID
  gradeIds: string // 班级ID
  date: Date // 补课日期
  week: number // 补周几的课
  startTimeSlotId: number // 开始补课节次
  endTimeSlotId: number // 结束补课节次
}

// 补课规则 API
export const FillRuleApi = {
  // 查询补课规则分页
  getFillRulePage: async (params: any) => {
    return await request.get({ url: `/school/fill-rule/page`, params })
  },

  // 查询补课规则详情
  getFillRule: async (id: number) => {
    return await request.get({ url: `/school/fill-rule/get?id=` + id })
  },

  // 新增补课规则
  createFillRule: async (data: FillRuleVO) => {
    return await request.post({ url: `/school/fill-rule/create`, data })
  },

  // 修改补课规则
  updateFillRule: async (data: FillRuleVO) => {
    return await request.put({ url: `/school/fill-rule/update`, data })
  },

  // 删除补课规则
  deleteFillRule: async (id: number) => {
    return await request.delete({ url: `/school/fill-rule/delete?id=` + id })
  },

  // 导出补课规则 Excel
  exportFillRule: async (params) => {
    return await request.download({ url: `/school/fill-rule/export-excel`, params })
  }
}