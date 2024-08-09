<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" class="!w-980px feeCalendar">
    <el-calendar v-model="monthDate">
      <template #header="{ date }">
        <span>{{ date }}</span>
      </template>
      <template #date-cell="{ data }">
        <p :class="data.isSelected ? 'is-selected' : ''">
          {{ data.day.split('-')[2] }}
          <!--  {{ data.isSelected ? '你好啊' : '' }}-->
          <br/>
          <br/>

          <el-tooltip class="box-item" effect="dark" placement="top-start">
            <template #content>
              <el-table :data="getCourseFeeList(data.day)" :show-header="false">
                <el-table-column prop="timeSlot.sort" label="节次" width="80">
                  <template #default="{ row }">
                    <span>第{{ row.timeSlot.sort }}节</span>
                  </template>
                </el-table-column>
                <el-table-column prop="count" label="课时" width="80">
                  <template #default="{ row }">
                    {{row.count}}课时
                  </template>
                </el-table-column>
                <el-table-column prop="grade" label="备注" width="80">
                  <template #default="{ row }">
                    {{row.grade ? row.grade.name : '---'}}
                  </template>
                </el-table-column>
                <el-table-column prop="remark" label="备注" width="80">
                  <template #default="{ row }">
                    {{row.remark ? row.remark : '---'}}
                  </template>
                </el-table-column>
              </el-table>
            </template>
            <span>
              <el-tag class="ml-2" type="success"
                      v-if="data.type == 'current-month' && dataList.includes(data.day)">
                {{ getCourseFeeCount(data.day) }}课时
              </el-tag>
              </span>
          </el-tooltip>

        </p>
      </template>
    </el-calendar>
  </Dialog>
</template>
<script setup lang="ts">
import {CourseFeeApi, CourseFeeDetailListVO} from '@/api/school/courseFee'

/** 课时费计算 表单 */
defineOptions({name: 'CalculateFeeDetail'})

const monthDate = ref(null as any)
const list = ref<CourseFeeDetailListVO[]>([]) //每天的课时费列表
const dataList = ref<string[]>([])

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('课时费计算') // 弹窗的标题
const loading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用

/** 打开弹窗 */
const open = async (teacherId: number, date: string) => {
  dialogVisible.value = true

  loading.value = true
  try {
    monthDate.value = new Date(date)
    list.value = await CourseFeeApi.getDetailList({teacherId, date})

    dataList.value = list.value.map(item => item.date)
  } finally {
    loading.value = false
  }
}
defineExpose({open}) // 提供 open 方法，用于打开弹窗

const getCourseFee = ( date: string) => {
  return list.value.find(item => item.date == date)
}

const getCourseFeeList = (date: string) => {
  const dateItem = getCourseFee(date)
  if (dateItem) {
    return dateItem.courseFeeList
  } else {
    return []
  }
}

const getCourseFeeCount = (date: string) => {
  const dateItem = getCourseFee(date)
  if (dateItem) {
    return dateItem.count
  } else {
    return 0
  }
}

const showDay = (date: Date) => {
  console.log(date)
  return '111\n222'
}
</script>

<style lang="scss">

.feeCalendar {
  td.next {
    pointer-events: none;
  }

  td.prev {
    pointer-events: none;
  }
}
</style>
