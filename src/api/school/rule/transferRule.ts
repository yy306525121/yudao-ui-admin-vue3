import request from '@/config/axios'

// 临时调课 VO
export interface TransferRuleVO {
  id: number // 主键
  date: Date // 调课时间
  timeSlotId: number // 调课节次
  fromTeacherId: number // 调课教师ID
  toTeacherId: number // 调课教师ID
  fromSubjectId: number // 调课课程
  toSubjectId: number // 调课课程
  fromCourseTypeId: number // 调课课程类型
  toCourseTypeId: number // 调课课程类型
}

// 临时调课 API
export const TransferRuleApi = {
  // 查询临时调课分页
  getTransferRulePage: async (params: any) => {
    return await request.get({ url: `/school/transfer-rule/page`, params })
  },

  // 查询临时调课详情
  getTransferRule: async (id: number) => {
    return await request.get({ url: `/school/transfer-rule/get?id=` + id })
  },

  // 新增临时调课
  createTransferRule: async (data: TransferRuleVO) => {
    return await request.post({ url: `/school/transfer-rule/create`, data })
  },

  // 修改临时调课
  updateTransferRule: async (data: TransferRuleVO) => {
    return await request.put({ url: `/school/transfer-rule/update`, data })
  },

  // 删除临时调课
  deleteTransferRule: async (id: number) => {
    return await request.delete({ url: `/school/transfer-rule/delete?id=` + id })
  },

  // 导出临时调课 Excel
  exportTransferRule: async (params) => {
    return await request.download({ url: `/school/transfer-rule/export-excel`, params })
  }
}