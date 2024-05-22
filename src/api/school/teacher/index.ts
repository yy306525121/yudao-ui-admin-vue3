import request from '@/config/axios'

export interface TeacherVO {
  id?: number
  name: string
  status: number
  sort: number
  basicSalary?: number
  courseSalary?: number
  createTime?: Date
}

// 查询教师列表
export const getTeacherPage = async (params: PageParam) => {
  return await request.get({ url: '/school/teacher/page', params })
}

// 查询教师详情
export const getTeacher = async (id: number) => {
  return await request.get({ url: '/school/teacher/get?id=' + id })
}

// 新增教师
export const createTeacher = async (data: TeacherVO) => {
  return await request.post({ url: '/school/teacher/create', data })
}

// 修改教师
export const updateTeacher = async (data: TeacherVO) => {
  return await request.put({ url: '/school/teacher/update', data })
}

// 删除教师
export const deleteTeacher = async (id: number) => {
  return await request.delete({ url: '/school/teacher/delete?id=' + id })
}

// 导出教师列表
export const exportTeacher = async (params) => {
  return await request.download({ url: '/school/teacher/export', params })
}
