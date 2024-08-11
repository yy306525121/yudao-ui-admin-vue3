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
      <el-form-item label="排课计划" prop="timetableId">
        <el-select v-model="queryParams.timetableId" class="!w-240px">
          <el-option
            v-for="item in timetableList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="年级" prop="gradeId">
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
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['school:timetable:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="班级" align="center" prop="grade">
        <template #default="scope">
          {{scope.row.grade.name}}
        </template>
      </el-table-column>
      <el-table-column label="教师" align="center" prop="teacher">
        <template #default="scope">
          {{scope.row.teacher.name}}
        </template>
      </el-table-column>
      <el-table-column label="科目" align="center" prop="subject">
        <template #default="scope">
          {{scope.row.subject.name}}
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" prop="courseType">
        <template #default="scope">
          {{scope.row.courseType.name}}
        </template>
      </el-table-column>
      <el-table-column label="每周课程数" align="center" prop="countEveryWeek" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['school:timetable:update']"
          >
            修改
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['school:timetable:delete']"
          >
            删除
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
  <TimetableSettingForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { TimetableSettingApi, TimetableSettingVO } from '@/api/school/timetable/setting'
import { TimetableApi, TimetableVO } from '@/api/school/timetable'
import TimetableSettingForm from './TimetableSettingForm.vue'
import {defaultProps, handleTree} from "@/utils/tree";
import {GradeApi} from "@/api/school/grade";

/** 排课 列表 */
defineOptions({ name: 'TimetableSetting' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const route = useRoute() // 路由

const loading = ref(true) // 列表的加载中
const list = ref<TimetableSettingVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  createTime: [],
  timetableId: parseInt(route.params.timetableId as string),
  gradeId: undefined
})
const queryFormRef = ref() // 搜索的表单
const timetableList = ref<TimetableVO[]>() // 字典类型的列表
const gradeList = ref<Tree[]>([])// 年级列表


/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await TimetableSettingApi.getTimetableSettingPage(queryParams)
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
  formRef.value.open(type, queryParams.timetableId, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await TimetableSettingApi.deleteTimetableSetting(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 初始化 **/
onMounted(async () => {
  await getList()
  // 查询字典（精简)列表
  timetableList.value = await TimetableApi.getSimpleTimetableList()

  gradeList.value = handleTree(await GradeApi.getSimpleGradeList())
})
</script>
