<template>
  <el-table v-loading="loading" :data="list">
    <el-table-column label="班级" align="center" prop="gradeList">
      <template #default="scope">
        <el-tag type="success" :key="grade.id" v-for="grade in scope.row.gradeList">{{grade.name}}</el-tag>
      </template>
    </el-table-column>
    <el-table-column label="补课日期" align="center" prop="date" :formatter="dateFormatter2"/>
    <el-table-column label="补课星期" align="center" prop="week"/>
    <el-table-column label="开始节次" align="center" prop="endTimeSlot">
      <template #default="scope">
        第{{scope.row.startTimeSlot.sort}}节
      </template>
    </el-table-column>
    <el-table-column label="结束节次" align="center" prop="endTimeSlot">
      <template #default="scope">
        第{{scope.row.endTimeSlot.sort}}节
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
import {formatToDate} from "@/utils/dateUtil";
import {FillRuleApi} from "@/api/school/rule/fillRule";


defineOptions({ name: 'FillRuleList' })
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

/** 查询调课规则列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await FillRuleApi.getFillRulePage(queryParams)
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
    await FillRuleApi.deleteFillRule(id)
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
