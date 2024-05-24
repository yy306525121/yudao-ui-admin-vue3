import request from '@/config/axios'

// 课程节次 VO
export interface TimeSlotVO {
  id: number // 主键
  type: number // 节次类型
  sort: number // 节次序号
  startTime: string // 开始时间
  endTime: string // 结束时间
}

// 课程节次 API
export const TimeSlotApi = {
  // 查询课程节次分页
  getTimeSlotPage: async (params: any) => {
    return await request.get({ url: `/school/time-slot/page`, params })
  },

  // 查询课程节次列表
  getTimeSlotList: async (params: any) => {
    return await request.get({ url: `/school/time-slot/list`, params })
  },

  // 查询课程节次详情
  getTimeSlot: async (id: number) => {
    return await request.get({ url: `/school/time-slot/get?id=` + id })
  },

  // 新增课程节次
  createTimeSlot: async (data: TimeSlotVO) => {
    return await request.post({ url: `/school/time-slot/create`, data })
  },

  // 修改课程节次
  updateTimeSlot: async (data: TimeSlotVO) => {
    return await request.put({ url: `/school/time-slot/update`, data })
  },

  // 删除课程节次
  deleteTimeSlot: async (id: number) => {
    return await request.delete({ url: `/school/time-slot/delete?id=` + id })
  },

  // 导出课程节次 Excel
  exportTimeSlot: async (params) => {
    return await request.download({ url: `/school/time-slot/export-excel`, params })
  }
}
