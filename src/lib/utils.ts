import { format, parseISO } from "date-fns"
import { zhCN } from "date-fns/locale"

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"]

export function formatDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr)
    return format(date, "M月d日", { locale: zhCN })
  } catch {
    return dateStr
  }
}

export function formatDateFull(dateStr: string): string {
  try {
    const date = parseISO(dateStr)
    const weekday = WEEKDAYS[date.getDay()]
    return `${format(date, "yyyy年M月d日", { locale: zhCN })} 星期${weekday}`
  } catch {
    return dateStr
  }
}
