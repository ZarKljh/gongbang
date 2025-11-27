package com.gobang.gobang.domain.review.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.review.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
@Builder
public class ReviewResponse {
//    private final Review review;


    private Long reviewId;
    private String content;
    private Integer rating;
    private Integer reviewLike;
    private Integer viewCount;
    private Boolean isActive;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime createdDate;
    private String createdBy;
    private String userNickName; // ✅ siteUser 닉네임만 노출
    private Long userId;         // ✅ siteUser ID 추가 (수정/삭제 비교용)
    private final List<String> imageUrls;  // ✅ 이미지 포함
    private Long productId;

    private String profileImageUrl;




    public static ReviewResponse fromEntity(Review review, String profileImageUrl) {

        // review.getImages()가 LAZY라면 트랜잭션 내에서 호출되어야 함
        List<String> imageUrls = review.getImages() != null
                ? review.getImages().stream()
                .map(Image::getImageUrl)
                .collect(Collectors.toList())
                : Collections.emptyList();

    // ✅ Review 엔티티 → DTO 변환
//    public static ReviewResponse fromEntity(Review review) {
        return ReviewResponse.builder()
                .reviewId(review.getReviewId())
                .content(review.getContent())
                .rating(review.getRating())
                .reviewLike(review.getReviewLike())
                .viewCount(review.getViewCount())
                .isActive(review.getIsActive())
                .createdDate(review.getCreatedDate())
                .createdBy(review.getCreatedBy())
                .userNickName(review.getSiteUser().getNickName())
                .userId(review.getSiteUser().getId())
                .imageUrls(imageUrls)
                .profileImageUrl(profileImageUrl)
                .productId(review.getProductId())
                .build();
    }
}
