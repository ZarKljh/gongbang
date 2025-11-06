package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.personal.entity.Follow;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class FollowResponse {

    private Long followId;
    private Long userId;
    private Long studioId;
<<<<<<< HEAD
    private String studioName;
=======
    private String studioName; // Seller 엔티티에서 가져올 예정
>>>>>>> 24f0546ced6a7c84574678dce32e8208488e3356
    private LocalDateTime createdAt;

    public static FollowResponse from(Follow follow) {
        return FollowResponse.builder()
                .followId(follow.getFollowId())
                .userId(follow.getSiteUser().getId())
                .studioId(follow.getStudio().getStudioId())
                .studioName(follow.getStudio().getStudioName())
                .createdAt(follow.getCreatedAt())
                .build();
    }
}