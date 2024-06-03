<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="800">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <el-form-item label="班级" prop="gradeIds">
        <el-select v-model="formData.gradeIds" multiple placeholder="请选择班级">
          <el-option
            v-for="grade in gradeList"
            :key="grade.id"
            :label="grade.name"
            :value="grade.id"
          />
        </el-select>
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="开始日期" prop="startDate">
            <el-date-picker
              v-model="formData.startDate"
              value-format="YYYY-MM-DD"
              type="date"
              placeholder="选择日期"
              class="!w-660px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束节次" prop="startTimeSlotId">
            <el-select v-model="formData.startTimeSlotId" placeholder="请选择">
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
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="结束日期" prop="endDate">
            <el-date-picker
              v-model="formData.endDate"
              value-format="YYYY-MM-DD"
              type="date"
              placeholder="选择日期"
              class="!w-660px"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束节次" prop="endTimeSlotId">
            <el-select v-model="formData.endTimeSlotId" placeholder="请选择">
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
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import * as TeacherApi from '@/api/school/teacher'
import { SubjectApi, SubjectVO } from '@/api/school/subject'
import {handleTree} from "@/utils/tree";
import {GradeApi, GradeVO} from "@/api/school/grade";
import {TimeSlotApi, TimeSlotVO} from "@/api/school/timeSlot";
import {CourseTypeApi, CourseTypeVO} from "@/api/school/coursetype";
import {HolidayRuleApi, HolidayRuleVO} from "@/api/school/rule/holidayRule";

defineOptions({ name: 'HolidayRuleForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  gradeIds: [],
  startDate: undefined,
  startTimeSlotId: undefined,
  endDate: undefined,
  endTimeSlotId: undefined
})
const formRules = reactive({
  gradeIds: [{ required: true, message: '班级不能为空', trigger: 'change' }],
  startDate: [{ required: true, message: '开始日期不能为空', trigger: 'blur' }],
  startTimeSlotId: [{ required: true, message: '开始节次不能为空', trigger: 'change' }],
  endDate: [{ required: true, message: '结束日期不能为空', trigger: 'blur' }],
  endTimeSlotId: [{ required: true, message: '结束节次不能为空', trigger: 'change' }],
})
const formRef = ref() // 表单 Ref
const subjectList = ref([] as SubjectVO[]) // 科目列表
const gradeList = ref<GradeVO[]>([])// 年级列表
const timeSlotList = ref([] as TimeSlotVO[]) // 节次列表
const teacherList = ref<TeacherApi.TeacherVO[]>([]) //教师列表
const courseTypeList = ref<CourseTypeVO[]>([])

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type

  debugger

  gradeList.value = handleTree(await GradeApi.getSimpleGradeList({'parentId': 0}))
  timeSlotList.value = await TimeSlotApi.getSimpleTeacherList()
  teacherList.value = await TeacherApi.getSimpleTeacherList()
  // 加载科目列表
  subjectList.value = await SubjectApi.getSimpleSubjectList()
  courseTypeList.value = await CourseTypeApi.getSimpleCourseTypeList()
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await HolidayRuleApi.getHolidayRule(id)
    } finally {
      formLoading.value = false
    }
  }


}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as HolidayRuleVO
    if (formType.value === 'create') {
      await HolidayRuleApi.createHolidayRule(data)
      message.success(t('common.createSuccess'))
    } else {
      await HolidayRuleApi.updateHolidayRule(data)
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
    gradeIds: [],
    startDate: undefined,
    startTimeSlotId: undefined,
    endDate: undefined,
    endTimeSlotId: undefined
  } as any
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
