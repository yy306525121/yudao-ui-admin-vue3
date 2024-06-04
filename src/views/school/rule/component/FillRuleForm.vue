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
      <el-form-item label="日期" prop="date">
        <el-date-picker
          v-model="formData.date"
          value-format="YYYY-MM-DD"
          type="date"
          placeholder="选择日期"
          class="!w-660px"
        />
      </el-form-item>
      <el-form-item label="补周几课" prop="week">
        <el-select v-model="formData.week" clearable placeholder="请选择" class="menu_option">
          <el-option label="周一" :value="1" :key="1"/>
          <el-option label="周二" :value="2" :key="2"/>
          <el-option label="周三" :value="3" :key="3"/>
          <el-option label="周四" :value="4" :key="4"/>
          <el-option label="周五" :value="5" :key="5"/>
          <el-option label="周六" :value="6" :key="6"/>
          <el-option label="周日" :value="7" :key="7"/>
        </el-select>
      </el-form-item>
      <el-form-item label="开始节次" prop="startTimeSlotId">
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
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import {GradeApi, GradeVO} from "@/api/school/grade";
import {TimeSlotApi, TimeSlotVO} from "@/api/school/timeSlot";
import {FillRuleApi, FillRuleVO} from "@/api/school/rule/fillRule";

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
  date: undefined,
  week: undefined,
  startTimeSlotId: undefined,
  endTimeSlotId: undefined
})
const formRules = reactive({
  gradeIds: [{ required: true, message: '班级不能为空', trigger: 'change' }],
  date: [{ required: true, message: '日期不能为空', trigger: 'blur' }],
  week: [{ required: true, message: '补周几课不能为空', trigger: 'blur' }],
  startTimeSlotId: [{ required: true, message: '开始节次不能为空', trigger: 'change' }],
  endTimeSlotId: [{ required: true, message: '结束节次不能为空', trigger: 'change' }],
})
const formRef = ref() // 表单 Ref
const gradeList = ref<GradeVO[]>([])// 年级列表
const timeSlotList = ref([] as TimeSlotVO[]) // 节次列表

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type

  gradeList.value = await GradeApi.getSimpleGradeList({'parentId': 0})
  timeSlotList.value = await TimeSlotApi.getSimpleTeacherList()
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await FillRuleApi.getFillRule(id)
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
    const data = formData.value as unknown as FillRuleVO
    if (formType.value === 'create') {
      await FillRuleApi.createFillRule(data)
      message.success(t('common.createSuccess'))
    } else {
      await FillRuleApi.updateFillRule(data)
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
    date: undefined,
    week: undefined,
    startTimeSlotId: undefined,
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
