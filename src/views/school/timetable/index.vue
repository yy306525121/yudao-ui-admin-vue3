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
      <el-form-item label="排课名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入排课名称"
          clearable
          @keyup.enter="handleQuery"
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
          v-hasPermi="['solver:timetable:create']"
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
      <el-table-column label="排课计划名称" align="center" prop="name"/>

      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.TIMETABLE_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
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

          <router-link :to="'/school/timetable/setting/' + scope.row.id">
            <el-button link type="primary">设置</el-button>
          </router-link>

          <el-button
            link
            type="primary"
            @click="handleSolve(scope.row.id)"
            v-hasPermi="['school:timetable:solve']"
            :loading="scope.row.running"
          >
            开始排课
          </el-button>

          <router-link :to="'/school/timetable/result/' + scope.row.id">
            <el-button link type="primary">查看结果</el-button>
          </router-link>

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
  <TimetableForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { TimetableApi, TimetableVO } from '@/api/school/timetable'
import TimetableForm from './TimetableForm.vue'
import {DICT_TYPE} from "@/utils/dict";
import {TimeFoldJobStatus, TimetableStatus} from "@/utils/constants";

/** 排课 列表 */
defineOptions({ name: 'Timetable' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<TimetableVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  createTime: [],
  name: undefined
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await TimetableApi.getTimetablePage(queryParams)
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

/** 开始排课操作 */
const handleSolve = async (id: number) => {
  try {
    // 二次确认
    await message.confirm('确认开始排课吗？')
    // 发起删除
    await TimetableApi.solve(id)
    // let result = list.value.find(item => item.id == id)
    // if (result) {
    //   result.running = true
    // }
    message.success(t('common.success'))
    // 刷新列表
    // await getList()
  } catch {}
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await TimetableApi.deleteTimetable(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 刷新运行状态 */
const flushStatus = async() => {
  list.value.forEach(item => {
    console.log(list.value)
    if(item.running) {
      TimetableApi.getStatus(item.id).then(res => {
        if (res === TimeFoldJobStatus.NOT_SOLVING.value) {
          item.running = false
          item.status = TimetableStatus.YES.value
        }
      })
    }
  })
}

/** 初始化 **/
onMounted(() => {
  getList()

  // setInterval(flushStatus, 1000)
})
</script>
