package com.gobang.gobang.domain.personal.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class CartsResponse {
    private List<CartResponse> carts; // 장바구니 목록
    private long cartCount;           // 총 개수
}