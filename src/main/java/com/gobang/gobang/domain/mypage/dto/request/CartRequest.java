package com.gobang.gobang.domain.mypage.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartRequest {

    private Long userId;
    private Long productId;
    private Long quantity;
}