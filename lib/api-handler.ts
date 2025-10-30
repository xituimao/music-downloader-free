import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * API 响应的标准格式
 */
type ApiResponse<T = any> = {
  code: number
  message?: string
  data?: T
  [key: string]: any
}

/**
 * API 处理器配置
 */
type ApiHandlerConfig = {
  /** API 名称，用于日志 */
  name: string
  /** 是否记录请求参数 */
  logParams?: boolean
  /** 是否记录响应数据（可能很大，默认不记录） */
  logResponse?: boolean
}

/**
 * 统一的 API 错误处理包装器
 * 
 * 核心功能：
 * 1. 统一的错误捕获和日志记录
 * 2. 标准化的错误响应格式
 * 3. 请求/响应日志
 * 4. 性能监控
 * 
 * @example
 * export default apiHandler({ name: 'GetSongUrl' }, async (req, res) => {
 *   const result = await getSongUrl(req.query.id)
 *   return { code: 200, data: result }
 * })
 */
export function apiHandler<T = any>(
  config: ApiHandlerConfig,
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<ApiResponse<T>>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const startTime = Date.now()
    const { name, logParams = true, logResponse = false } = config
    
    // 生成请求 ID
    const reqId = `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    
    try {
      // 记录请求开始
      console.log(`\n🔵 [${name}] 请求开始 [${reqId}]`)
      console.log(`   方法: ${req.method}`)
      console.log(`   路径: ${req.url}`)
      
      if (logParams) {
        if (Object.keys(req.query).length > 0) {
          console.log(`   Query:`, JSON.stringify(req.query))
        }
        if (req.body && Object.keys(req.body).length > 0) {
          console.log(`   Body:`, JSON.stringify(req.body))
        }
      }
      
      // 执行业务逻辑
      const result = await handler(req, res)
      
      // 计算耗时
      const duration = Date.now() - startTime
      
      // 记录成功响应
      console.log(`✅ [${name}] 请求成功 [${reqId}] - 耗时: ${duration}ms`)
      
      if (logResponse) {
        console.log(`   响应:`, JSON.stringify(result).substring(0, 500))
      }
      
      // 返回结果（如果 handler 内部没有自己调用 res.json）
      if (!res.writableEnded) {
        res.status(200).json(result)
      }
    } catch (error: any) {
      const duration = Date.now() - startTime
      
      // 记录错误
      console.error(`\n❌ [${name}] 请求失败 [${reqId}] - 耗时: ${duration}ms`)
      console.error(`   错误类型: ${error?.constructor?.name || 'Unknown'}`)
      console.error(`   错误消息: ${error?.message || '未知错误'}`)
      
      if (error?.stack) {
        console.error(`   错误堆栈:\n${error.stack}`)
      }
      
      // 如果有原始错误数据，也记录下来
      if (error?.response?.data) {
        console.error(`   上游错误数据:`, JSON.stringify(error.response.data))
      }
      
      // 返回标准错误格式
      if (!res.writableEnded) {
        res.status(500).json({
          code: error?.code || 500,
          message: error?.message || '服务器内部错误',
          error: process.env.NODE_ENV === 'development' ? {
            stack: error?.stack,
            details: error?.response?.data
          } : undefined
        })
      }
    }
  }
}

/**
 * 参数验证辅助函数
 * 
 * @example
 * const id = validateParam(req.query.id, 'id')
 */
export function validateParam(
  value: any,
  paramName: string,
  errorMsg?: string
): string {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    throw new Error(errorMsg || `缺少必需参数: ${paramName}`)
  }
  return String(value)
}

/**
 * 可选参数获取
 */
export function getOptionalParam(
  value: any,
  defaultValue: string
): string {
  return value ? String(value) : defaultValue
}

