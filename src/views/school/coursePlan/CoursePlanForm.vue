<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="年级" prop="gradeId">
        <el-tree-select
          disabled
          v-model="formData.gradeId"
          :data="gradeList"
          :props="defaultProps"
          default-expand-all
          :render-after-expand="false"
          node-key="id"
          placeholder="请选择年级"
          class="!w-610px"
        />
      </el-form-item>
      <el-form-item label="日期" prop="date">
        <el-date-picker
          v-model="formData.date"
          type="date"
          placeholder="请选择换课日期"
          value-format="YYYY-MM-DD"
          class="!w-610px"
        />
      </el-form-item>

      <el-row>
        <el-col :span="13">
          <el-form-item label="教师" prop="fromTeacherId">
            <el-select v-model="formData.fromTeacherId" disabled placeholder="请选择" clearable filterable>
              <el-option v-for="item in teacherList" :key="item.id" :label="item.name" :value="item.id ?? ''"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="1" class="transfer-icon">
          <el-icon><ArrowRight /></el-icon>
        </el-col>
        <el-col :span="10">
          <el-form-item label-width="0" prop="toTeacherId">
            <el-select v-model="formData.toTeacherId" placeholder="请选择" clearable filterable>
              <el-option v-for="item in teacherList" :key="item.id" :label="item.name" :value="item.id ?? ''"/>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="13">
          <el-form-item label="科目" prop="fromSubjectId">
            <el-select v-model="formData.fromSubjectId" disabled placeholder="请选择" clearable filterable>
              <el-option v-for="item in subjectList" :key="item.id" :label="item.name" :value="item.id ?? ''"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="1" class="transfer-icon">
          <el-icon><ArrowRight /></el-icon>
        </el-col>
        <el-col :span="10">
          <el-form-item label-width="0" prop="toSubjectId">
            <el-select v-model="formData.toSubjectId" placeholder="请选择" clearable filterable>
              <el-option v-for="item in subjectList" :key="item.id" :label="item.name" :value="item.id ?? ''"/>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="13">
          <el-form-item label="类型" prop="fromCourseTypeId">
            <el-select v-model="formData.fromCourseTypeId" disabled placeholder="请选择" clearable filterable>
              <el-option v-for="item in courseTypeList" :key="item.id" :label="item.name" :value="item.id ?? ''"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="1" class="transfer-icon">
          <el-icon><ArrowRight /></el-icon>
        </el-col>
        <el-col :span="10">
          <el-form-item label-width="0" prop="toCourseTypeId">
            <el-select v-model="formData.toCourseTypeId" placeholder="请选择" clearable filterable>
              <el-option v-for="item in courseTypeList" :key="item.id" :label="item.name" :value="item.id ?? ''"/>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import {CoursePlanApi, CoursePlanChangeVO} from '@/api/school/coursePlan'
import {defaultProps, handleTree} from "@/utils/tree";
import {GradeApi} from "@/api/school/grade";
import * as TeacherApi from "@/api/school/teacher";
import { SubjectApi, SubjectVO } from '@/api/school/subject'
import { CourseTypeApi, CourseTypeVO } from '@/api/school/coursetype'
import {ArrowRight} from "@element-plus/icons-vue";

/** 课程计划 表单 */
defineOptions({ name: 'CoursePlanForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const gradeList = ref<Tree[]>([])// 年级列表
const teacherList = ref<TeacherApi.TeacherVO[]>([]) //教师列表
const subjectList = ref<SubjectVO[]>([]) // 科目列表
const courseTypeList = ref<CourseTypeVO[]>([]) // 课程类型列表

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('课程调整') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formData = ref({
  id: undefined,
  date: undefined,
  gradeId: undefined,
  week: undefined,
  timeSlotId: undefined,
  fromTeacherId: undefined,
  toTeacherId: undefined,
  fromSubjectId: undefined,
  toSubjectId: undefined,
  fromCourseTypeId: undefined,
  toCourseTypeId: undefined,
})
const formRules = reactive({
  week: [{ required: true, message: '星期不能为空', trigger: 'blur' }],
  date: [{ required: true, message: '日期不能为空', trigger: 'blur' }],
  gradeId: [{ required: true, message: '班级不能为空', trigger: 'blur' }],
  fromTeacherId: [{ required: true, message: '教师不能为空', trigger: 'blur' }],
  toTeacherId: [{ required: true, message: '教师不能为空', trigger: 'blur' }],
  fromSubjectId: [{ required: true, message: '科目不能为空', trigger: 'blur' }],
  toSubjectId: [{ required: true, message: '科目不能为空', trigger: 'blur' }],
  fromCourseTypeId: [{ required: true, message: '类型不能为空', trigger: 'blur' }],
  toCourseTypeId: [{ required: true, message: '类型不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (id: number) => {
  dialogVisible.value = true
  resetForm()
  // 修改时，设置数据
  formLoading.value = true
  try {
    const courseData = await CoursePlanApi.getCoursePlan(id)
    formData.value.id = courseData.id
    formData.value.gradeId = courseData.grade.id
    formData.value.week = courseData.week
    formData.value.timeSlotId = courseData.timeSlot.id
    formData.value.fromTeacherId = courseData.teacher?.id
    formData.value.fromSubjectId = courseData.subject?.id
    formData.value.fromCourseTypeId = courseData.courseType.id

    gradeList.value = handleTree(await GradeApi.getSimpleGradeList())
    teacherList.value = await TeacherApi.getSimpleTeacherList()
    subjectList.value = await SubjectApi.getSimpleSubjectList()
    courseTypeList.value = await CourseTypeApi.getSimpleCourseTypeList()
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as CoursePlanChangeVO
    await CoursePlanApi.changeCoursePlan(data)
    message.success(t('common.updateSuccess'))
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
    date: undefined,
    gradeId: undefined,
    week: undefined,
    timeSlotId: undefined,
    fromTeacherId: undefined,
    toTeacherId: undefined,
    fromSubjectId: undefined,
    toSubjectId: undefined,
    fromCourseTypeId: undefined,
    toCourseTypeId: undefined,
  }
  formRef.value?.resetFields()
}
</script>

<style scoped>
.transfer-icon {
  text-align: center;
}
.transfer-icon i {
  margin-top: 30%;
}
</style>
