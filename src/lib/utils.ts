import { format, parseISO } from "date-fns"
import { zhCN } from "date-fns/locale"

export function formatDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr)
    return format(date, "M月d日", { locale: zhCN })
  } catch {
    return dateStr
  }
}
