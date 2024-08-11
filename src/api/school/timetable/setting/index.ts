import request from '@/config/axios'

// 排课计划设置 VO
export interface TimetableSettingVO {
  timetableId: number // 排课计划外键
  gradeId: number // 班级
  subjectId: number // 科目
  teacherId: number // 教师
  countEveryWeek: number // 每周几节课
  preferWeeks: Array<number> //偏好星期
  preferTimeSlotIds: Array<number> //偏好节次
}

// 排课计划设置 API
export const TimetableSettingApi = {
  // 查询排课计划设置分页
  getTimetableSettingPage: async (params: any) => {
    return await request.get({ url: `/school/timetable-setting/page`, params })
  },

  // 查询排课计划设置详情
  getTimetableSetting: async (id: number) => {
    return await request.get({ url: `/school/timetable-setting/get?id=` + id })
  },

  // 新增排课计划设置
  createTimetableSetting: async (data: TimetableSettingVO) => {
    return await request.post({ url: `/school/timetable-setting/create`, data })
  },

  // 修改排课计划设置
  updateTimetableSetting: async (data: TimetableSettingVO) => {
    return await request.put({ url: `/school/timetable-setting/update`, data })
  },

  // 删除排课计划设置
  deleteTimetableSetting: async (id: number) => {
    return await request.delete({ url: `/school/timetable-setting/delete?id=` + id })
  },

  // 导出排课计划设置 Excel
  exportTimetableSetting: async (params) => {
    return await request.download({ url: `/school/timetable-setting/export-excel`, params })
  }
}
