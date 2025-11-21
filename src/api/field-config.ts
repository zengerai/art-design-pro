import request from '@/utils/http'

/**
 * 字段元数据管理API
 */

/**
 * 获取字段列表
 * @param category 字段分类（可选）
 */
export function fetchFieldMetadataList(category?: string) {
  return request.get<Api.FieldMetadata.FieldMetadata[]>({
    url: '/api/field-metadata/list',
    params: category ? { category } : undefined
  })
}

/**
 * 创建字段元数据
 */
export function createFieldMetadata(params: Api.FieldMetadata.CreateFieldParams) {
  return request.post({
    url: '/api/field-metadata/create',
    params,
    showSuccessMessage: true
  })
}

/**
 * 更新字段元数据
 */
export function updateFieldMetadata(params: Api.FieldMetadata.UpdateFieldParams) {
  return request.put({
    url: '/api/field-metadata/update',
    params,
    showSuccessMessage: true
  })
}

/**
 * 删除字段元数据
 */
export function deleteFieldMetadata(id: string) {
  return request.del({
    url: `/api/field-metadata/delete/${id}`,
    showSuccessMessage: true
  })
}

/**
 * 调整字段排序
 */
export function reorderFieldMetadata(params: Api.FieldMetadata.ReorderParams) {
  return request.post({
    url: '/api/field-metadata/reorder',
    params,
    showSuccessMessage: true
  })
}

/**
 * 枚举值管理API
 */

/**
 * 获取枚举值列表
 * @param fieldName 字段名称（可选）
 */
export function fetchEnumValuesList(fieldName?: string) {
  return request.get<Api.EnumValues.EnumValue[]>({
    url: '/api/enum-values/list',
    params: fieldName ? { fieldName } : undefined
  })
}

/**
 * 创建枚举值
 */
export function createEnumValue(params: Api.EnumValues.CreateEnumValueParams) {
  return request.post({
    url: '/api/enum-values/create',
    params,
    showSuccessMessage: true
  })
}

/**
 * 批量创建枚举值
 */
export function batchCreateEnumValues(params: Api.EnumValues.BatchCreateParams) {
  return request.post({
    url: '/api/enum-values/batchCreate',
    params,
    showSuccessMessage: true
  })
}

/**
 * 更新枚举值
 */
export function updateEnumValue(params: Api.EnumValues.UpdateEnumValueParams) {
  return request.put({
    url: '/api/enum-values/update',
    params,
    showSuccessMessage: true
  })
}

/**
 * 删除枚举值
 */
export function deleteEnumValue(id: string) {
  return request.del({
    url: `/api/enum-values/delete/${id}`,
    showSuccessMessage: true
  })
}

/**
 * 调整枚举值排序
 */
export function reorderEnumValues(params: Api.EnumValues.ReorderParams) {
  return request.post({
    url: '/api/enum-values/reorder',
    params,
    showSuccessMessage: true
  })
}
