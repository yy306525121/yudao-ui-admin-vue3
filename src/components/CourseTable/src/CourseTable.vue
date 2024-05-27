<template>
  <el-table v-loading="loading" :data="rowList" :span-method="objectSpanMethod" :stripe="true" :show-overflow-tooltip="true" :border="true">
    <el-table-column label="时间" align="center" prop="duration"/>
    <el-table-column label="节次" align="center" prop="sort">
      <template #default="scope">
        第{{scope.row.sort}}节
      </template>
    </el-table-column>
    <el-table-column v-for="index in 7" :key="index" :label="getWeekName(index)" align="center" width="180">
      <template #default="scope">
        {{getSubjectName(scope.column, scope.row)}}
        <br/>
        {{getTeacherName(scope.column, scope.row)}}
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">

import {PropType} from "vue";
import {CoursePlanVO} from "@/api/school/coursePlan";
import {WeekEnum} from "@/utils/constants";

defineOptions({ name: 'CourseTable' })

const props = defineProps({
  loading: {
    required: true,
    type: Boolean
  },
  data: {
    required: true,
    type: Array as PropType<CoursePlanVO[]>,
    default: () => []
  }
})

const emit = defineEmits(['update:loading', 'update:data'])

const rowList = ref([
  {duration: '早自习', sort: 1},
  {duration: '上午', sort: 2},
  {duration: '上午', sort: 3},
  {duration: '上午', sort: 4},
  {duration: '上午', sort: 5},
  {duration: '上午', sort: 6},
  {duration: '下午', sort: 7},
  {duration: '下午', sort: 8},
  {duration: '下午', sort: 9},
  {duration: '下午', sort: 10},
  {duration: '夜自习', sort: 11},
  {duration: '夜自习', sort: 12}
])

const loading = computed({
  get() {
    return props.loading
  },
  set(val) {
    emit('update:loading', val)
  }
})

const dataList = computed({
  get() {
    return props.data
  },
  set(val) {
    emit('update:data', val)
  }
})

const objectSpanMethod = ({
                            rowIndex,
                            columnIndex,
                          }) => {
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
const getSubjectName = (column: any, row: any) => {
  debugger
  if (!column.label) {return ''}
  const week = getWeekValue(column.label)
  const coursePlan = filterData(week, row)
  if (coursePlan && coursePlan.subject) {
    return coursePlan.subject.name
  } else {
    return ''
  }
}

const getTeacherName = (column: any, row: any) => {
  if (!column.label) {return ''}
  const week = getWeekValue(column.label)
  const coursePlan = filterData(week, row)
  if (coursePlan && coursePlan.teacher) {
    return coursePlan.teacher.name
  } else {
    return ''
  }
}

const filterData = (column, row) => {
  const coursePlanList = dataList.value.filter(item => item.week === column && item.timeSlot.sort === row.sort)
  if (coursePlanList.length > 0) {
    return coursePlanList[0]
  } else {
    return undefined
  }
}

const getWeekName = (value) => {
  for (let key in WeekEnum) {
    if (WeekEnum[key].value === value) {
      return WeekEnum[key].name
    }
  }
  return ''
}

const getWeekValue = (name) => {
  for (let key in WeekEnum) {
    if (WeekEnum[key].name === name) {
      return WeekEnum[key].value
    }
  }
  return ''
}
</script>

<style scoped lang="scss">

</style>
