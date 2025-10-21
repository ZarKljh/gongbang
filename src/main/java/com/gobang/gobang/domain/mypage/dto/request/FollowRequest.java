package com.gobang.gobang.domain.mypage.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowRequest {

    private Long userId;
    private Long sellerId;
}