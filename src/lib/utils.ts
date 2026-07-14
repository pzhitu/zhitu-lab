import { format, parseISO } from "date-fns"
import { zhCN, enUS } from "date-fns/locale"

export function formatDate(dateStr: string, locale: string): string {
  try {
    const date = parseISO(dateStr)
    return format(date, "yyyy-MM-dd", {
      locale: locale === "zh" ? zhCN : enUS,
    })
  } catch {
    return dateStr
  }
}
