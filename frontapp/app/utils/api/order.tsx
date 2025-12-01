// app/utils/api/order.ts
import api from '@/app/utils/api'
import { useMutation } from '@tanstack/react-query'

// --- Request / Response 타입 ---
export interface PrepareOrderRequest {
    productId: number
    quantity: number
}

export interface PrepareOrderResponse {
    orderId: string
    amount: number
}

// --- API 함수 ---
export const prepareOrder = async (body: PrepareOrderRequest) => {
    const res = await api.post<PrepareOrderResponse>('orders/prepare', body)
    return res.data
}

// --- React Query 훅 (여기에 같이 넣어서 사용 중) ---
export const usePrepareOrder = () => {
    return useMutation<PrepareOrderResponse, Error, PrepareOrderRequest>({
        mutationFn: prepareOrder,
    })
}

// 간단 POST 요청용
export const buyBtnRequest = async () => {
    const res = await api.post('product/buyBtn')
    return res.data
}

// React Query Mutation 훅
export const useBuyBtn = () => {
    return useMutation({
        mutationFn: buyBtnRequest, // 매개변수 없음
    })
}
