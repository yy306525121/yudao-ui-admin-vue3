<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="班级" prop="gradeId">
        <el-tree-select
          v-model="formData.gradeId"
          :data="gradeList"
          :props="defaultProps"
          default-expand-all
          :render-after-expand="false"
          node-key="id"
          placeholder="请选择班级"
        />
      </el-form-item>
      <el-form-item label="科目" prop="subjectId">
        <el-select v-model="formData.subjectId" placeholder="请选择" clearable filterable>
          <el-option v-for="item in subjectList" :key="item.id" :label="item.name" :value="item.id ?? ''"/>
        </el-select>
      </el-form-item>
      <el-form-item label="教师" prop="teacherId">
        <el-select v-model="formData.teacherId" placeholder="请选择" filterable>
          <el-option v-for="item in teacherList" :key="item.id" :label="item.name" :value="item.id ?? ''"/>
        </el-select>
      </el-form-item>
      <el-form-item label="课程类型" prop="courseTypeId">
        <el-select v-model="formData.courseTypeId" placeholder="请选择" clearable>
          <el-option v-for="item in courseTypeList" :key="item.id" :label="item.name" :value="item.id ?? ''"/>
        </el-select>
      </el-form-item>
      <el-form-item label="每周课程数" prop="countEveryWeek">
        <el-input-number v-model="formData.countEveryWeek" :min="1" placeholder="请输入"/>
      </el-form-item>
      <el-form-item label="偏好星期" prop="likeWeeks">
        <el-select v-model="formData.preferWeeks" clearable placeholder="请选择" class="menu_option" multiple>
          <el-option label="周一" :value="1" :key="1"/>
          <el-option label="周二" :value="2" :key="2"/>
          <el-option label="周三" :value="3" :key="3"/>
          <el-option label="周四" :value="4" :key="4"/>
          <el-option label="周五" :value="5" :key="5"/>
          <el-option label="周六" :value="6" :key="6"/>
          <el-option label="周日" :value="7" :key="7"/>
        </el-select>
      </el-form-item>
      <el-form-item label="偏好节次" prop="timeSlotId">
        <el-select v-model="formData.preferTimeSlotIds" placeholder="请选择" multiple>
          <el-option v-for="item in timeSlotList" :key="item.id" :label="'第'+item.sort+'节'" :value="item.id">
            <span style="float: left">第{{ item.sort }}节</span>
            <span
              style="
                    float: right;
                    color: var(--el-text-color-secondary);
                    font-size: 13px;
                    "
            >
              <span v-if="item.sort === 1">早自习</span>
              <span v-if="item.sort >= 2 && item.sort <= 6">上午</span>
              <span v-if="item.sort >= 7 && item.sort <= 10">下午</span>
              <span v-if="item.sort >= 11">夜自习</span>
            </span>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import {TimetableSettingApi, TimetableSettingVO} from "@/api/school/timetable/setting";
import {defaultProps, handleTree} from "@/utils/tree";
import {GradeApi} from "@/api/school/grade";
import {SubjectApi, SubjectVO} from "@/api/school/subject";
import * as TeacherApi from "@/api/school/teacher";
import {CourseTypeApi, CourseTypeVO} from "@/api/school/coursetype";
import {TimeSlotApi, TimeSlotVO} from "@/api/school/timeSlot";

/** 排课 表单 */
defineOptions({ name: 'TimetableSettingForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  timetableId: 0,
  gradeId: undefined,
  subjectId: undefined,
  teacherId: undefined,
  courseTypeId: undefined,
  countEveryWeek: undefined,
  preferWeeks: [],
  preferTimeSlotIds: []
})
const formRules = reactive({
  gradeId: [{ required: true, message: '班级不能为空', trigger: 'blur' }],
  subjectId: [{ required: true, message: '科目不能为空', trigger: 'blur' }],
  teacherId: [{ required: true, message: '教师不能为空', trigger: 'blur' }],
  courseTypeId: [{ required: true, message: '课程类型不能为空', trigger: 'blur' }],
  countEveryWeek: [{ required: true, message: '每周课程数不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const gradeList = ref<Tree[]>([])// 年级列表
const subjectList = ref([] as SubjectVO[]) // 科目列表
const teacherList = ref<TeacherApi.TeacherVO[]>([]) //教师列表
const courseTypeList = ref<CourseTypeVO[]>([])
const timeSlotList = ref([] as TimeSlotVO[]) // 节次列表

/** 打开弹窗 */
const open = async (type: string, timetableId: number, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  debugger

  gradeList.value = handleTree(await GradeApi.getSimpleGradeList())
  subjectList.value = await SubjectApi.getSimpleSubjectList()
  teacherList.value = await TeacherApi.getSimpleTeacherList()
  courseTypeList.value = await CourseTypeApi.getSimpleCourseTypeList()
  timeSlotList.value = await TimeSlotApi.getSimpleTeacherList()

  resetForm()

  formData.value.timetableId = timetableId
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await TimetableSettingApi.getTimetableSetting(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  debugger
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as TimetableSettingVO
    if (formType.value === 'create') {
      await TimetableSettingApi.createTimetableSetting(data)
      message.success(t('common.createSuccess'))
    } else {
      await TimetableSettingApi.updateTimetableSetting(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    timetableId: 0,
    gradeId: undefined,
    subjectId: undefined,
    teacherId: undefined,
    courseTypeId: undefined,
    countEveryWeek: undefined,
    preferWeeks: [],
    preferTimeSlotIds: []
  }
  formRef.value?.resetFields()
}
</script>
