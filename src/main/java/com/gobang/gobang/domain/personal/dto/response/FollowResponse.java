package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@SuperBuilder
public class FollowResponse {

    private Long followId;
    private SiteUser siteUser;
    private Studio studio;
    private String sellerName; // Seller 엔티티에서 가져올 예정
    private LocalDateTime createdAt;
}