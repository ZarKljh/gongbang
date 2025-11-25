package com.gobang.gobang.domain.personal.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.domain.review.entity.Review;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {
    private Long reviewId;
    private Long productId;
    private String productName;
    private Integer rating;
    private String content;
    private Integer reviewLike;
    private List<String> images;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime createdDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime modifiedDate;

    public static ReviewResponse fromEntity(Review review, ImageRepository imageRepository) {
        List<String> imageUrls = imageRepository
                .findByRefTypeAndRefIdOrderBySortOrderAsc(Image.RefType.REVIEW, review.getReviewId())
                .stream()
                .map(img -> "/api/v1/image/review/" + img.getImageFileName())
                .collect(Collectors.toList());

        return ReviewResponse.builder()
                .reviewId(review.getReviewId())
                .productId(review.getProductId())
                .productName(review.getProduct() != null ? review.getProduct().getName() : "알 수 없음")
                .rating(review.getRating())
                .content(review.getContent())
                .reviewLike(review.getReviewLike())
                .createdDate(review.getCreatedDate())
                .modifiedDate(review.getModifiedDate())
                .images(imageUrls)
                .build();
    }
}