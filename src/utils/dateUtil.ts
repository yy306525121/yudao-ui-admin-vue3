/**
 * Independent time operation tool to facilitate subsequent switch to dayjs
 */
// TODO 芋艿：【锁屏】可能后面删除掉
import dayjs from 'dayjs'

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const DATE_FORMAT = 'YYYY-MM-DD'

export function parseDate(dateStr?: string, format: string = DATE_FORMAT): Date {
  return dayjs(dateStr, format).toDate()
}

export function formatToDateTime(date?: dayjs.ConfigType, format = DATE_TIME_FORMAT): string {
  return dayjs(date).format(format)
}

export function formatToDate(date?: dayjs.ConfigType, format = DATE_FORMAT): string {
  return dayjs(date).format(format)
}

export function plusMonth(date?: dayjs.ConfigType, daysToAdd: number = 0): string {
  return dayjs(date).subtract(-daysToAdd, 'month').format(DATE_FORMAT)
}

export const dateUtil = dayjs
