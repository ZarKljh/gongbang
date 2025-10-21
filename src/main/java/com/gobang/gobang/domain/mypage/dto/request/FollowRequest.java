package com.gobang.gobang.domain.mypage.dto.request;

import com.gobang.gobang.domain.auth.entity.Studio;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FollowRequest {

    private Long userId;
    private Long studioId;
    private Studio seller;
}