<template>
  <el-table v-loading="loading" :data="list">
    <el-table-column label="日期" align="center" prop="date" :formatter="dateFormatter2"/>
    <el-table-column label="班级" align="center" prop="grade.name" />
    <el-table-column label="节次" align="center" prop="timeSlot.sort">
      <template #default="scope">
        第{{scope.row.timeSlot.sort}}节
      </template>
    </el-table-column>
    <el-table-column label="教师" align="center">
      <template #default="scope">
        {{scope.row.fromTeacher?.name}}
        ->
        <span v-if="scope.row.toTeacher">{{scope.row.toTeacher.name}}</span>
      </template>
    </el-table-column>
    <el-table-column label="课程" align="center">
      <template #default="scope">
        {{scope.row.fromSubject?.name}}
        ->
        {{scope.row.toSubject?.name}}
      </template>
    </el-table-column>
    <el-table-column label="课程类型" align="center">
      <template #default="scope">
        {{scope.row.fromCourseType?.name}}
        ->
        {{scope.row.toCourseType?.name}}
      </template>
    </el-table-column>
    <el-table-column label="操作" align="center">
      <template #default="scope">
        <el-button
          link
          type="primary"
          @click="openForm(scope.row.id)"
          v-hasPermi="['school:rule:update']"
        >
          编辑
        </el-button>
        <el-button
          link
          type="danger"
          @click="handleDelete(scope.row.id)"
          v-hasPermi="['school:rule:delete']"
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
</template>

<script setup lang="ts">

import {dateFormatter2} from "@/utils/formatTime";
import {TransferRuleApi} from "@/api/school/rule/transferRule";
import {formatToDate} from "@/utils/dateUtil";


defineOptions({ name: 'TransferRuleList' })
const props = defineProps({
  searchDate: {
    type: String,
    default: () => {
      return formatToDate(new Date(), '{y}-{m}-{d}')
    }
  }
})

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const searchDate = toRefs(props).searchDate
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  date: searchDate
})

/** 查询教师列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await TransferRuleApi.getTransferRulePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 添加/修改操作 */
const emit = defineEmits(["handleUpdate"]);
const openForm = (id?: number) => {
  emit('handleUpdate', id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await TransferRuleApi.deleteTransferRule(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 初始化 **/
onMounted(() => {
  getList()
})

defineExpose({
  getList
})
</script>

<style scoped lang="scss">

</style>
