import request from '@/config/axios'
import {CourseTypeVO} from "@/api/school/coursetype";
import {GradeVO} from "@/api/school/grade";
import {SubjectVO} from "@/api/school/subject";
import {TeacherVO} from "@/api/school/teacher";
import {TimeSlotVO} from "@/api/school/timeSlot";

// 排课计划设置 VO
export interface TimetableResultVO {
  id: number // 主键
  timetableId: number // 排课计划主键
  week: number // 星期
  courseType: CourseTypeVO
  grade: GradeVO
  subject: SubjectVO
  teacher: TeacherVO
  timeSlot: TimeSlotVO
}

// 排课计划设置 API
export const TimetableResultApi = {
  // 查询排课计划设置分页
  getTimetableResultList: async (params: any) => {
    return await request.get({ url: `/school/timetable-result/list`, params })
  },
}
