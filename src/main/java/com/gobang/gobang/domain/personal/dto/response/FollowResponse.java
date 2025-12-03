package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.image.repository.ImageRepository;
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
    private String studioName;
    private LocalDateTime createdAt;
    private String studioImageUrl;
    private String studioDescription;

    public static FollowResponse from(Follow follow, ImageRepository imageRepository) {
        String imageUrl = imageRepository
                .findByRefTypeAndRefIdOrderBySortOrderAsc(Image.RefType.STUDIO_LOGO, follow.getStudio().getStudioId())
                .stream()
                .findFirst()
                .map(img -> "/images/" + img.getImageFileName())
                .orElse(null);

        return FollowResponse.builder()
                .followId(follow.getFollowId())
                .userId(follow.getSiteUser().getId())
                .studioId(follow.getStudio().getStudioId())
                .studioName(follow.getStudio().getStudioName())
                .createdAt(follow.getCreatedAt())
                .studioImageUrl(imageUrl)
                .studioDescription(follow.getStudio().getStudioDescription())
                .build();
    }
}