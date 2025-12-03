// app/utils/api/order.ts
import api from '@/app/utils/api'
import { useMutation } from '@tanstack/react-query'

// --- Request / Response 타입 ---
export interface PrepareOrderRequest {
    productId: number
    quantity: number
}

export interface PrepareOrderResponse {
    orderCode: string
    amount: number
}

// 서버로 보내는 승인 요청
export interface ConfirmOrderRequest {
    orderId: string
    paymentKey: string
    amount: number
}

// 서버에서 받는 승인 결과 (RsData 포함)
export interface ConfirmOrderResponse {
    orderId: string
    paymentKey: string
    amount: number
    status: string
}

export interface RsData<T> {
    resultCode: string
    msg: string
    data: T
}

// --- API 함수 ---
export const prepareOrder = async (body: PrepareOrderRequest) => {
    const res = await api.post<RsData<PrepareOrderResponse>>('payments/prepare', body)

    const payload = res.data.data // 진짜 orderCode / amount 들어있는 부분
    console.log('prepare 결과:', payload)

    return payload
}

// --- React Query 훅 (여기에 같이 넣어서 사용 중) ---
export const usePrepareOrder = () => {
    return useMutation<PrepareOrderResponse, Error, PrepareOrderRequest>({
        mutationFn: prepareOrder,
    })
}

// 간단 POST 요청용 + 배송지 등록확인
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

/* ------------------------------
    confirmOrder API 함수
------------------------------ */

export const confirmOrder = async (body: ConfirmOrderRequest) => {
    const res = await api.post<RsData<ConfirmOrderResponse>>('payments/confirm', body)
    return res.data // RsData 반환
}

/* ------------------------------
    React Query 훅
------------------------------ */

export const useConfirmOrder = () => {
    return useMutation({
        mutationFn: confirmOrder,
    })
}
