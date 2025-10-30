/**
 * 统一的前端 API 请求封装
 * 
 * 核心功能：
 * 1. 统一的错误处理
 * 2. 详细的请求/响应日志
 * 3. 自动的 HTTP 状态码检查
 * 4. 类型安全的响应处理
 */

/**
 * API 响应格式
 */
export type ApiResponse<T = any> = {
  code: number
  message?: string
  data?: T
  [key: string]: any
}

/**
 * 请求配置
 */
export type RequestConfig = {
  /** API 名称，用于日志 */
  name?: string
  /** 是否记录请求详情 */
  logRequest?: boolean
  /** 是否记录响应详情 */
  logResponse?: boolean
  /** 请求超时（毫秒） */
  timeout?: number
  /** fetch 原始选项 */
  fetchOptions?: RequestInit
}

/**
 * 请求错误类
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseData?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * 统一的 GET 请求
 */
export async function apiGet<T = any>(
  url: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...config, fetchOptions: { method: 'GET', ...config.fetchOptions } })
}

/**
 * 统一的 POST 请求
 */
export async function apiPost<T = any>(
  url: string,
  body?: any,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    ...config,
    fetchOptions: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...config.fetchOptions?.headers },
      body: body ? JSON.stringify(body) : undefined,
      ...config.fetchOptions
    }
  })
}

/**
 * 核心请求函数
 */
async function apiRequest<T = any>(
  url: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const {
    name = url,
    logRequest = true,
    logResponse = true,
    timeout = 30000,
    fetchOptions = {}
  } = config

  const startTime = Date.now()
  const reqId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  try {
    // 记录请求开始
    if (logRequest) {
      console.log(`\n🔵 [API请求] ${name} [${reqId}]`)
      console.log(`   URL: ${url}`)
      console.log(`   方法: ${fetchOptions.method || 'GET'}`)
    }

    // 创建带超时的 fetch
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    let response: Response
    try {
      response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      })
    } finally {
      clearTimeout(timeoutId)
    }

    const duration = Date.now() - startTime

    // 检查 HTTP 状态码
    if (!response.ok) {
      // 尝试解析错误响应体
      let errorData: any
      try {
        errorData = await response.json()
      } catch {
        errorData = { message: await response.text() || response.statusText }
      }

      console.error(`\n❌ [API错误] ${name} [${reqId}] - 耗时: ${duration}ms`)
      console.error(`   HTTP状态: ${response.status} ${response.statusText}`)
      console.error(`   错误信息:`, errorData)

      throw new ApiError(
        errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      )
    }

    // 解析响应数据
    const data = await response.json()

    // 记录成功响应
    if (logResponse) {
      console.log(`✅ [API成功] ${name} [${reqId}] - 耗时: ${duration}ms`)
      
      // 避免打印超大响应体
      const dataStr = JSON.stringify(data)
      if (dataStr.length > 500) {
        console.log(`   响应: ${dataStr.substring(0, 500)}... (已截断)`)
      } else {
        console.log(`   响应:`, data)
      }
    }

    return data
  } catch (error: any) {
    const duration = Date.now() - startTime

    // 如果已经是 ApiError，直接抛出
    if (error instanceof ApiError) {
      throw error
    }

    // 处理其他错误（网络错误、超时等）
    console.error(`\n❌ [API异常] ${name} [${reqId}] - 耗时: ${duration}ms`)
    
    if (error.name === 'AbortError') {
      console.error(`   错误类型: 请求超时`)
      throw new ApiError(`请求超时（${timeout}ms）`)
    } else {
      console.error(`   错误类型: ${error?.constructor?.name || 'Unknown'}`)
      console.error(`   错误消息: ${error?.message || '未知错误'}`)
      throw new ApiError(error?.message || '网络请求失败')
    }
  }
}

/**
 * 便捷的错误提示辅助函数
 * 
 * @example
 * try {
 *   await apiGet('/api/data')
 * } catch (error) {
 *   showError(error, '加载数据失败')
 * }
 */
export function getErrorMessage(error: any, defaultMsg = '操作失败'): string {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return defaultMsg
}

