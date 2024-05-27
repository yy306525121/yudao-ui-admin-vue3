<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="日期" prop="date">
        <el-date-picker
          class="!w-240px"
          v-model="queryParams.date"
          type="date"
          placeholder="请选择日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="查询方式" prop="queryType">
        <el-select v-model="queryParams.queryType" placeholder="请选择查询方式" clearable class="!w-240px" @change="handleQueryTypeChange">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COURSE_PLAN_QUERY_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="年级" prop="gradeId" v-if="queryParams.queryType === CoursePlanQueryTypeEnum.GRADE.value">
        <el-tree-select
          v-model="queryParams.gradeId"
          :data="gradeList"
          :props="defaultProps"
          default-expand-all
          :render-after-expand="false"
          node-key="id"
          placeholder="请选择年级"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="教师" prop="teacherId" v-if="queryParams.queryType === CoursePlanQueryTypeEnum.TEACHER.value">
        <el-select v-model="queryParams.teacherId" placeholder="请选择" class="!w-240px" clearable filterable>
          <el-option v-for="item in teacherList" :key="item.id" :label="item.name" :value="item.id ?? ''"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['school:course-plan:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="warning"
          plain
          @click="handleImport"
          v-hasPermi="['school:course-plan:import']"
        >
          <Icon icon="ep:upload" /> 导入
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['school:course-plan:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
          type="danger"
          plain
          @click="handleChange"
          :loading="changeLoading"
          v-hasPermi="['school:course-plan:change']"
        >
          <Icon icon="ep:switch" class="mr-5px" /> 调整
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <CourseTable :data="list" :loading="loading" :data-type="queryParams.queryType"/>
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <CoursePlanForm ref="formRef" @success="getList" />
  <!-- 课程计划导入对话框 -->
  <CoursePlanImportForm ref="importFormRef" @success="getList"/>
</template>

<script setup lang="ts">
import download from '@/utils/download'
import { CoursePlanApi, CoursePlanVO } from '@/api/school/coursePlan'
import * as TeacherApi from '@/api/school/teacher'
import { GradeApi } from '@/api/school/grade'
import CoursePlanForm from './CoursePlanForm.vue'
import CoursePlanImportForm from './CoursePlanImportForm.vue'
import {DICT_TYPE, getIntDictOptions} from "@/utils/dict";
import { defaultProps, handleTree } from '@/utils/tree'
import {formatToDate} from "@/utils/dateUtil";
import { CoursePlanQueryTypeEnum } from "@/utils/constants";
import { CourseTable } from '@/components/CourseTable'

/** 课程计划 列表 */
defineOptions({ name: 'CoursePlan' })

const message = useMessage() // 消息弹窗
const loading = ref(false) // 列表的加载中
const gradeList = ref<Tree[]>([])// 年级列表
const teacherList = ref<TeacherApi.TeacherVO[]>([]) //教师列表
const list = ref<CoursePlanVO[]>([]) // 列表的数据
const queryParams = reactive({
  queryType: 1,
  date: formatToDate(new Date()),
  gradeId: undefined,
  teacherId: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中
const changeLoading = ref(false) // 调整的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    list.value = await CoursePlanApi.getCoursePlanList(queryParams)
  } finally {
    loading.value = false
  }
}

const initData = async () => {
  loading.value = true
  try {
    gradeList.value = handleTree(await GradeApi.getSimpleGradeList())
    teacherList.value = await TeacherApi.getSimpleTeacherList()
  } finally {
    loading.value = false
  }
}

const handleQueryTypeChange = () => {
  queryParams.gradeId = undefined
  queryParams.teacherId = undefined
  list.value = []
}
/** 搜索按钮操作 */
const handleQuery = () => {
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  list.value = []
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 课程导入操作 */
const importFormRef = ref()
const handleImport = () => {
  importFormRef.value.open()
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await CoursePlanApi.exportCoursePlan(queryParams)
    download.excel(data, '课程计划.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 调整按钮操作 */
const handleChange = async () => {
  try {

  } catch {
  }finally {
    changeLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  // getList()
  initData()
})
</script>

<style scoped>
</style>
