package com.gobang.gobang.domain.review.dto.response;

import com.gobang.gobang.domain.review.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class ReviewCreateResponse {
    private Long reviewId;
    private String content;
    private int rating;
    private String createdBy;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;

    // Review 엔티티 기반 생성자
    public ReviewCreateResponse(Review review) {
        this.reviewId = review.getReviewId();
        this.content = review.getContent();
        this.rating = review.getRating();
//        this.createdBy = review.getCreatedBy();
        this.createdBy = (review.getSiteUser().getNickName());
        this.createdDate = review.getCreatedDate();
        this.modifiedDate = review.getModifiedDate();
    }
}
