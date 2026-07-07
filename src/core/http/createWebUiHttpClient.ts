import axios, { type AxiosInstance } from 'axios'
import type { ApiResponse, BinaryPayload, CreateWebUiHttpClientOptions, RequestOptions } from './types'
import { attachWebUiAuthInterceptors } from './authInterceptors'
import {
  buildBinaryRequestConfig,
  buildJsonRequestConfig,
  buildMultipartRequestConfig,
  NO_LOADER_OPTIONS,
} from './config'
import { toFormData } from './formData'

async function executeRequest<T>(
  request: () => Promise<{ data: T; status: number }>
): Promise<ApiResponse<T>> {
  try {
    const response = await request()
    return { payload: response.data, status: response.status, ok: true }
  } catch (error: unknown) {
    const status =
      error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { status?: number } }).response?.status
        : undefined
    return { payload: undefined, status, ok: false }
  }
}

export interface WebUiHttpClient {
  axiosInstance: AxiosInstance
  getData: <TResponse>(
    url: string,
    timeout?: number,
    options?: RequestOptions
  ) => Promise<ApiResponse<TResponse>>
  postData: <TRequest, TResponse>(
    url: string,
    data?: TRequest,
    timeout?: number,
    options?: RequestOptions
  ) => Promise<ApiResponse<TResponse>>
  patchData: <TRequest, TResponse>(
    url: string,
    data: TRequest,
    timeout?: number,
    options?: RequestOptions
  ) => Promise<ApiResponse<TResponse>>
  putData: <TRequest, TResponse>(
    url: string,
    data: TRequest,
    timeout?: number,
    options?: RequestOptions
  ) => Promise<ApiResponse<TResponse>>
  deleteData: <TResponse>(
    url: string,
    timeout?: number,
    options?: RequestOptions
  ) => Promise<ApiResponse<TResponse>>
  postBinary: <TResponse>(
    url: string,
    data: Blob | ArrayBuffer | Uint8Array,
    timeout?: number,
    options?: RequestOptions
  ) => Promise<ApiResponse<TResponse>>
  getBinary: (
    url: string,
    timeout?: number,
    as?: 'arraybuffer' | 'blob',
    options?: RequestOptions
  ) => Promise<ApiResponse<BinaryPayload>>
  postFormData: <TResponse>(
    url: string,
    form: FormData | Record<string, string | Blob | File | (string | Blob | File)[]>,
    timeout?: number,
    options?: RequestOptions
  ) => Promise<ApiResponse<TResponse>>
  postFile: <TResponse>(
    url: string,
    file: Blob | File,
    fieldName?: string,
    filename?: string,
    extraFields?: Record<string, string>,
    timeout?: number,
    options?: RequestOptions
  ) => Promise<ApiResponse<TResponse>>
  getDataWithoutLoader: <TResponse>(url: string, timeout?: number) => Promise<ApiResponse<TResponse>>
  postDataWithoutLoader: <TRequest, TResponse>(
    url: string,
    data?: TRequest,
    timeout?: number
  ) => Promise<ApiResponse<TResponse>>
}

/** Creates an axios instance with auth interceptors and typed HTTP helpers. */
export function createWebUiHttpClient(
  options: CreateWebUiHttpClientOptions
): WebUiHttpClient {
  const axiosInstance = axios.create({
    timeout: options.timeout ?? 10000,
  })

  attachWebUiAuthInterceptors(axiosInstance, options.auth)

  const getData = async <TResponse>(
    url: string,
    timeout?: number,
    requestOptions?: RequestOptions
  ): Promise<ApiResponse<TResponse>> =>
    executeRequest(() =>
      axiosInstance.get<TResponse>(url, buildJsonRequestConfig(timeout, requestOptions))
    )

  const postData = async <TRequest, TResponse>(
    url: string,
    data?: TRequest,
    timeout?: number,
    requestOptions?: RequestOptions
  ): Promise<ApiResponse<TResponse>> =>
    executeRequest(() =>
      axiosInstance.post<TResponse>(url, data, buildJsonRequestConfig(timeout, requestOptions))
    )

  const patchData = async <TRequest, TResponse>(
    url: string,
    data: TRequest,
    timeout?: number,
    requestOptions?: RequestOptions
  ): Promise<ApiResponse<TResponse>> =>
    executeRequest(() =>
      axiosInstance.patch<TResponse>(url, data, buildJsonRequestConfig(timeout, requestOptions))
    )

  const putData = async <TRequest, TResponse>(
    url: string,
    data: TRequest,
    timeout?: number,
    requestOptions?: RequestOptions
  ): Promise<ApiResponse<TResponse>> =>
    executeRequest(() =>
      axiosInstance.put<TResponse>(url, data, buildJsonRequestConfig(timeout, requestOptions))
    )

  const deleteData = async <TResponse>(
    url: string,
    timeout?: number,
    requestOptions?: RequestOptions
  ): Promise<ApiResponse<TResponse>> =>
    executeRequest(() =>
      axiosInstance.delete<TResponse>(url, buildJsonRequestConfig(timeout, requestOptions))
    )

  const postBinary = async <TResponse>(
    url: string,
    data: Blob | ArrayBuffer | Uint8Array,
    timeout?: number,
    requestOptions?: RequestOptions
  ): Promise<ApiResponse<TResponse>> =>
    executeRequest(() =>
      axiosInstance.post<TResponse>(url, data, {
        ...buildJsonRequestConfig(timeout, requestOptions),
        headers: { 'Content-Type': 'application/octet-stream' },
      })
    )

  const getBinary = async (
    url: string,
    timeout?: number,
    as: 'arraybuffer' | 'blob' = 'arraybuffer',
    requestOptions?: RequestOptions
  ): Promise<ApiResponse<BinaryPayload>> =>
    executeRequest(async () => {
      const response = await axiosInstance.get(url, buildBinaryRequestConfig(timeout, as, requestOptions))
      return {
        data: {
          data: response.data as ArrayBuffer | Blob,
          headers: response.headers as Record<string, string>,
        },
        status: response.status,
      }
    })

  const postFormData = async <TResponse>(
    url: string,
    form: FormData | Record<string, string | Blob | File | (string | Blob | File)[]>,
    timeout?: number,
    requestOptions?: RequestOptions
  ): Promise<ApiResponse<TResponse>> =>
    executeRequest(() =>
      axiosInstance.post<TResponse>(
        url,
        toFormData(form),
        buildMultipartRequestConfig(timeout, requestOptions)
      )
    )

  const postFile = async <TResponse>(
    url: string,
    file: Blob | File,
    fieldName: string = 'file',
    filename?: string,
    extraFields?: Record<string, string>,
    timeout?: number,
    requestOptions?: RequestOptions
  ): Promise<ApiResponse<TResponse>> => {
    const fd = new FormData()
    const inferredName = filename ?? (file instanceof File ? file.name : 'file')
    fd.append(fieldName, file, inferredName)
    if (extraFields) {
      Object.entries(extraFields).forEach(([k, v]) => fd.append(k, v))
    }
    return postFormData<TResponse>(url, fd, timeout, requestOptions)
  }

  const getDataWithoutLoader = <TResponse>(url: string, timeout?: number) =>
    getData<TResponse>(url, timeout, NO_LOADER_OPTIONS)

  const postDataWithoutLoader = <TRequest, TResponse>(
    url: string,
    data?: TRequest,
    timeout?: number
  ) => postData<TRequest, TResponse>(url, data, timeout, NO_LOADER_OPTIONS)

  return {
    axiosInstance,
    getData,
    postData,
    patchData,
    putData,
    deleteData,
    postBinary,
    getBinary,
    postFormData,
    postFile,
    getDataWithoutLoader,
    postDataWithoutLoader,
  }
}
