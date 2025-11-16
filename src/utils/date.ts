/**
 * 日期时间格式化工具函数
 *
 * 提供统一的日期时间格式化功能，处理ISO 8601格式到本地时间格式的转换
 *
 * @module utils/date
 * @author Art Design Pro Team
 */

import { useDateFormat } from '@vueuse/core'

/**
 * 日期时间格式枚举
 */
export enum DateFormat {
  /** 日期时间：2024-11-16 15:30:00 */
  DateTime = 'YYYY-MM-DD HH:mm:ss',
  /** 仅日期：2024-11-16 */
  Date = 'YYYY-MM-DD',
  /** 仅时间：15:30:00 */
  Time = 'HH:mm:ss',
  /** 日期时间（短）：2024-11-16 15:30 */
  DateTimeShort = 'YYYY-MM-DD HH:mm',
  /** 中文日期时间：2024年11月16日 15:30:00 */
  DateTimeCN = 'YYYY年MM月DD日 HH:mm:ss',
  /** 中文日期：2024年11月16日 */
  DateCN = 'YYYY年MM月DD日'
}

/**
 * 格式化日期时间
 *
 * 将ISO 8601格式或Date对象转换为指定格式的本地时间字符串
 *
 * @param date - 日期时间值，支持ISO 8601字符串、Date对象、时间戳
 * @param format - 日期格式，默认为 YYYY-MM-DD HH:mm:ss
 * @returns 格式化后的日期时间字符串，如果输入无效则返回 '-'
 *
 * @example
 * ```typescript
 * // ISO 8601格式转换
 * formatDateTime('2024-11-16T13:36:50.000Z')
 * // => '2024-11-16 21:36:50'
 *
 * // 自定义格式
 * formatDateTime('2024-11-16T13:36:50.000Z', DateFormat.Date)
 * // => '2024-11-16'
 *
 * // 使用Date对象
 * formatDateTime(new Date())
 * // => '2024-11-16 21:36:50'
 *
 * // 使用时间戳
 * formatDateTime(1700123810000)
 * // => '2024-11-16 21:36:50'
 * ```
 */
export function formatDateTime(
  date: string | number | Date | null | undefined,
  format: string = DateFormat.DateTime
): string {
  // 处理空值
  if (!date) {
    return '-'
  }

  try {
    // 将输入转换为Date对象
    let dateObj: Date

    if (typeof date === 'string') {
      // 处理ISO 8601格式字符串
      dateObj = new Date(date)
    } else if (typeof date === 'number') {
      // 处理时间戳
      dateObj = new Date(date)
    } else if (date instanceof Date) {
      // 已经是Date对象
      dateObj = date
    } else {
      console.warn('无效的日期格式:', date)
      return '-'
    }

    // 验证日期是否有效
    if (isNaN(dateObj.getTime())) {
      console.warn('无效的日期值:', date)
      return '-'
    }

    // 使用 VueUse 的 useDateFormat 进行格式化
    return useDateFormat(dateObj, format).value
  } catch (error) {
    console.error('日期格式化错误:', error, '输入值:', date)
    return '-'
  }
}

/**
 * 格式化日期（仅日期部分）
 *
 * @param date - 日期时间值
 * @returns 格式化后的日期字符串 YYYY-MM-DD
 *
 * @example
 * ```typescript
 * formatDate('2024-11-16T13:36:50.000Z')
 * // => '2024-11-16'
 * ```
 */
export function formatDate(date: string | number | Date | null | undefined): string {
  return formatDateTime(date, DateFormat.Date)
}

/**
 * 格式化时间（仅时间部分）
 *
 * @param date - 日期时间值
 * @returns 格式化后的时间字符串 HH:mm:ss
 *
 * @example
 * ```typescript
 * formatTime('2024-11-16T13:36:50.000Z')
 * // => '21:36:50'
 * ```
 */
export function formatTime(date: string | number | Date | null | undefined): string {
  return formatDateTime(date, DateFormat.Time)
}

/**
 * 判断是否为今天
 *
 * @param date - 日期时间值
 * @returns 是否为今天
 */
export function isToday(date: string | number | Date): boolean {
  if (!date) return false

  try {
    const inputDate = new Date(date)
    const today = new Date()

    return (
      inputDate.getFullYear() === today.getFullYear() &&
      inputDate.getMonth() === today.getMonth() &&
      inputDate.getDate() === today.getDate()
    )
  } catch {
    return false
  }
}

/**
 * 获取相对时间描述
 *
 * @param date - 日期时间值
 * @returns 相对时间描述，如"刚刚"、"5分钟前"、"2小时前"等
 *
 * @example
 * ```typescript
 * getRelativeTime(new Date(Date.now() - 60000))
 * // => '1分钟前'
 *
 * getRelativeTime(new Date(Date.now() - 3600000))
 * // => '1小时前'
 * ```
 */
export function getRelativeTime(date: string | number | Date): string {
  if (!date) return '-'

  try {
    const inputDate = new Date(date)
    const now = new Date()
    const diff = now.getTime() - inputDate.getTime()

    // 计算时间差
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) {
      return '刚刚'
    } else if (minutes < 60) {
      return `${minutes}分钟前`
    } else if (hours < 24) {
      return `${hours}小时前`
    } else if (days < 7) {
      return `${days}天前`
    } else {
      // 超过7天显示具体日期
      return formatDate(inputDate)
    }
  } catch {
    return '-'
  }
}
