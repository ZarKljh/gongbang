package com.gobang.gobang.domain.review.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PhotoReviewResponse {
    private Long reviewId;
        private String imageUrl;
//    private List<String> imageUrls;
    private String content;
}
