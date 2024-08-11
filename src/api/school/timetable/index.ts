import request from '@/config/axios'

// 排课 VO
export interface TimetableVO {
  id: number // 编号
  name: string // 排课名称
}

// 排课 API
export const TimetableApi = {
  solve: async (id: number) => {
    return await request.get( { url: `/school/timetable/solve?id=` + id} )
  },

  // 查询排课分页
  getTimetablePage: async (params: any) => {
    return await request.get({ url: `/school/timetable/page`, params })
  },

  getSimpleTimetableList: async () => {
    return await request.get({ url: '/school/timetable/simple-list' })
  },

  // 查询排课详情
  getTimetable: async (id: number) => {
    return await request.get({ url: `/school/timetable/get?id=` + id })
  },

  // 新增排课
  createTimetable: async (data: TimetableVO) => {
    return await request.post({ url: `/school/timetable/create`, data })
  },

  // 修改排课
  updateTimetable: async (data: TimetableVO) => {
    return await request.put({ url: `/school/timetable/update`, data })
  },

  // 删除排课
  deleteTimetable: async (id: number) => {
    return await request.delete({ url: `/school/timetable/delete?id=` + id })
  },

  // 导出排课 Excel
  exportTimetable: async (params) => {
    return await request.download({ url: `/school/timetable/export-excel`, params })
  }
}
