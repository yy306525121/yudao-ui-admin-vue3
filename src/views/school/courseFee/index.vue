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
      <el-form-item label="月份" prop="date">
        <el-date-picker
          v-model="queryParams.date"
          value-format="YYYY-MM-DD"
          type="month"
          placeholder="选择月份"
          clearable
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="教师" prop="teacherId">
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
          v-hasPermi="['school:course-fee:calculate']"
        >
          <Icon icon="ep:histogram" class="mr-5px" /> 计算
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['school:course-fee:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="教师" align="center" prop="teacher.name" />
      <el-table-column label="课时费" align="center" prop="count" />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openDetailDialog(scope.row.teacher.id, queryParams.date)"
            v-hasPermi="['school:course-fee:update']"
          >
            明细
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <CalculateForm ref="formRef" @success="getList" />
  <CourseFeeDetail ref="courseFeeDetailRef"/>
</template>

<script setup lang="ts">
import download from '@/utils/download'
import { CourseFeeApi, CourseFeeVO } from '@/api/school/courseFee'
import CalculateForm from './calculateForm.vue'
import CourseFeeDetail from './detail.vue'
import {formatToDate} from "@/utils/dateUtil";
import * as TeacherApi from "@/api/school/teacher";

/** 课时费明细 列表 */
defineOptions({ name: 'CourseFee' })

const message = useMessage() // 消息弹窗

const loading = ref(true) // 列表的加载中
const list = ref<CourseFeeVO[]>([]) // 列表的数据
const teacherList = ref<TeacherApi.TeacherVO[]>([]) //教师列表
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  date: formatToDate(new Date()),
  teacherId: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await CourseFeeApi.getCourseFeePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 课时费详情 */
const courseFeeDetailRef = ref()
const openDetailDialog = (teacherId: number, date: string) => {
  courseFeeDetailRef.value.open(teacherId, date)
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await CourseFeeApi.exportCourseFee(queryParams)
    download.excel(data, '课时费明细.xlsx')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

const initData = async () => {
    teacherList.value = await TeacherApi.getSimpleTeacherList()
}

/** 初始化 **/
onMounted(() => {
  initData()
  getList()
})
</script>
