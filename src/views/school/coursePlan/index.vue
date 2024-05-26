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
          check-strictly
          node-key="id"
          placeholder="请选择年级"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="教师" prop="teacherId" v-if="queryParams.queryType === CoursePlanQueryTypeEnum.TEACHER.value">
        <el-select v-model="queryParams.teacherId" placeholder="请选择" class="!w-240px" clearable filterable>
          <el-option v-for="item in teacherList" :key="item.id" :label="item.name" :value="item.id"/>
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
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :span-method="objectSpanMethod" :stripe="true" :show-overflow-tooltip="true" :border="true">
      <el-table-column label="时间" align="center" prop="duration" />
      <el-table-column label="节次" align="center" prop="sort" class="!h-120px">
        <template #default="scope">
          第{{scope.row.sort}}节
        </template>
      </el-table-column>
      <el-table-column label="星期一" align="center" prop="monday">
        <template #default="scope">
          <span v-if="Array.isArray(scope.row.monday) && scope.row.monday.length === 2">
            {{scope.row.monday[0]}}
            <br/>
            {{scope.row.monday[1]}}
          </span>
          <span v-else>
            {{scope.row.monday}}
            <br/>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="星期二" align="center" prop="tuesday">
        <template #default="scope">
          <span v-if="Array.isArray(scope.row.tuesday) && scope.row.tuesday.length === 2">
            {{scope.row.tuesday[0]}}
            <br/>
            {{scope.row.tuesday[1]}}
          </span>
          <span v-else>
            {{scope.row.tuesday}}
            <br/>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="星期三" align="center" prop="wednesday">
        <template #default="scope">
          <span v-if="Array.isArray(scope.row.wednesday) && scope.row.wednesday.length === 2">
            {{scope.row.wednesday[0]}}
            <br/>
            {{scope.row.wednesday[1]}}
          </span>
          <span v-else>
            {{scope.row.wednesday}}
            <br/>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="星期四" align="center" prop="thursday">
        <template #default="scope">
          <span v-if="Array.isArray(scope.row.thursday) && scope.row.thursday.length === 2">
            {{scope.row.thursday[0]}}
            <br/>
            {{scope.row.thursday[1]}}
          </span>
          <span v-else>
            {{scope.row.thursday}}
            <br/>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="星期五" align="center" prop="friday">
        <template #default="scope">
          <span v-if="Array.isArray(scope.row.friday) && scope.row.friday.length === 2">
            {{scope.row.friday[0]}}
            <br/>
            {{scope.row.friday[1]}}
          </span>
          <span v-else>
            {{scope.row.friday}}
            <br/>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="星期六" align="center" prop="saturday">
        <template #default="scope">
          <span v-if="Array.isArray(scope.row.saturday) && scope.row.saturday.length === 2">
            {{scope.row.saturday[0]}}
            <br/>
            {{scope.row.saturday[1]}}
          </span>
          <span v-else>
            {{scope.row.saturday}}
            <br/>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="星期日" align="center" prop="weekday">
        <template #default="scope">
          <span v-if="Array.isArray(scope.row.weekday) && scope.row.weekday.length === 2">
            {{scope.row.weekday[0]}}
            <br/>
            {{scope.row.weekday[1]}}
          </span>
          <span v-else>
            {{scope.row.weekday}}
            <br/>
          </span>
        </template>
      </el-table-column>
    </el-table>
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
import {CoursePlanQueryTypeEnum, CourseTypeEnum} from "@/utils/constants";

/** 课程计划 列表 */
defineOptions({ name: 'CoursePlan' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(false) // 列表的加载中
const gradeList = ref<Tree[]>([])// 年级列表
const teacherList = ref<TeacherApi.TeacherVO[]>([]) //教师列表
const list = ref([
  {duration: '早自习', sort: 1, monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', weekday: ''},
  {duration: '上午', sort: 2, monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', weekday: ''},
  {duration: '上午', sort: 3, monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', weekday: ''},
  {duration: '上午', sort: 4, monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', weekday: ''},
  {duration: '上午', sort: 5, monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', weekday: ''},
  {duration: '上午', sort: 6, monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', weekday: ''},
  {duration: '下午', sort: 7, monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', weekday: ''},
  {duration: '下午', sort: 8, monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', weekday: ''},
  {duration: '下午', sort: 9, monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', weekday: ''},
  {duration: '下午', sort: 10, monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', weekday: ''},
  {duration: '夜自习', sort: 11, monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', weekday: ''},
  {duration: '夜自习', sort: 12, monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', weekday: ''}
]) // 列表的数据
const queryParams = reactive({
  queryType: 1,
  date: formatToDate(new Date()),
  gradeId: undefined,
  teacherId: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const dataList = await CoursePlanApi.getCoursePlanList(queryParams)
    dataList.forEach((item) => {
      list.value.filter(obj => obj.sort === item.timeSlot.sort).forEach((obj) => {
        if(item.week === 1) {
          obj.monday = buildCourseStr(item)
        } else if (item.week === 2) {
          obj.tuesday = buildCourseStr(item)
        } else if (item.week === 3) {
          obj.wednesday = buildCourseStr(item)
        } else if (item.week === 4) {
          obj.thursday = buildCourseStr(item)
        } else if (item.week === 5) {
          obj.friday = buildCourseStr(item)
        } else if (item.week === 6) {
          obj.saturday = buildCourseStr(item)
        } else if (item.week === 7) {
          obj.weekday = buildCourseStr(item)
        }
      })
    })
  } finally {
    loading.value = false
  }
}

const initData = async () => {
  loading.value = true
  try {
    gradeList.value = handleTree(await GradeApi.getSimpleGradeList())
    teacherList.value = await TeacherApi.getSimpleTeacherList(queryParams)
  } finally {
    loading.value = false
  }
}

const buildCourseStr = (item) => {
  if (item.courseType.type === CourseTypeEnum.NORMAL.type) {
    // 正常课时
    return [item.subject.name, item.teacher.name]
  } else if (item.courseType.type === CourseTypeEnum.STUDY_SELF.type || item.courseType.type === CourseTypeEnum.EVENING.type) {
    // 自习课 or 晚自习
    return item.teacher.name
  } else if (item.courseType.type === CourseTypeEnum.MORNING.type) {
    // 早自习
    return item.subject.name
  }
}

function objectSpanMethod({
                            row,
                            column,
                            rowIndex,
                            columnIndex,
                          }) {
  if (columnIndex === 0) {
    if (rowIndex === 0) {
      return {
        rowspan: 1,
        colspan: 1
      }
    } else if (rowIndex === 1) {
      return {
        rowspan: 5,
        colspan: 1
      }
    } else if (rowIndex === 6) {
      return {
        rowspan: 4,
        colspan: 1
      }
    } else if (rowIndex === 10) {
      return {
        rowspan: 2,
        colspan: 1
      }
    } else {
      return {
        rowspan: 0,
        colspan: 0,
      }
    }
  }
}

const handleQueryTypeChange = (value) => {
  queryParams.gradeId = undefined
  queryParams.teacherId = undefined
}
/** 搜索按钮操作 */
const handleQuery = () => {
  resetList()
  getList()
}

const resetList = () => {
  list.value.forEach((item) => {
    item.monday = ''
    item.tuesday = ''
    item.wednesday = ''
    item.thursday = ''
    item.friday = ''
    item.saturday = ''
    item.weekday = ''
  })
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  resetList()
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

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await CoursePlanApi.deleteCoursePlan(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
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

/** 初始化 **/
onMounted(() => {
  // getList()
  initData()
})
</script>

<style scoped>
.el-table__cell {
  height: 50px !important
}
</style>
