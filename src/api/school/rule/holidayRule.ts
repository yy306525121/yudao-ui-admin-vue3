import request from '@/config/axios'

// 放假时间规则 VO
export interface HolidayRuleVO {
  id: number // ID
  gradeId: string // 班级ID的数组json
  startDate: Date // 开始日期
  startTimeSlotId: number // 开始节次
  endDate: Date // 结束日期
  endTimeSlotId: number // 结束节次
}

// 放假时间规则 API
export const HolidayRuleApi = {
  // 查询放假时间规则分页
  getHolidayRulePage: async (params: any) => {
    return await request.get({ url: `/rule/holiday-rule/page`, params })
  },

  // 查询放假时间规则详情
  getHolidayRule: async (id: number) => {
    return await request.get({ url: `/rule/holiday-rule/get?id=` + id })
  },

  // 新增放假时间规则
  createHolidayRule: async (data: HolidayRuleVO) => {
    return await request.post({ url: `/rule/holiday-rule/create`, data })
  },

  // 修改放假时间规则
  updateHolidayRule: async (data: HolidayRuleVO) => {
    return await request.put({ url: `/rule/holiday-rule/update`, data })
  },

  // 删除放假时间规则
  deleteHolidayRule: async (id: number) => {
    return await request.delete({ url: `/rule/holiday-rule/delete?id=` + id })
  },

  // 导出放假时间规则 Excel
  exportHolidayRule: async (params) => {
    return await request.download({ url: `/rule/holiday-rule/export-excel`, params })
  }
}