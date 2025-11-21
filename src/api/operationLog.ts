import request from '@/utils/http'

/**
 * 查询操作日志列表
 * @param params 查询参数
 * @returns 操作日志列表响应
 */
export function fetchOperationLogList(params: Api.OperationLog.QueryOperationLogParams) {
  return request.post<Api.OperationLog.OperationLogResponse>({
    url: '/api/operation-log/query',
    params
  })
}

/**
 * 获取操作日志详情
 * @param id 日志ID
 * @returns 操作日志详情
 */
export function fetchOperationLogDetail(id: string) {
  return request.get<Api.OperationLog.OperationLogRecord>({
    url: `/api/operation-log/detail/${id}`
  })
}
