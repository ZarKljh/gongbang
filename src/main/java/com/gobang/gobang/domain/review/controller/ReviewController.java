package com.gobang.gobang.domain.review.controller;


import com.gobang.gobang.domain.review.dto.ReviewDto;
import com.gobang.gobang.domain.review.dto.ReviewDto.ReviewCreateRequest;
import com.gobang.gobang.domain.review.dto.ReviewDto.CreateReviewResponse;
import com.gobang.gobang.domain.review.entity.Review;
import com.gobang.gobang.domain.review.service.ReviewCommentService;
import com.gobang.gobang.domain.review.service.ReviewReportService;
import com.gobang.gobang.domain.review.service.ReviewService;
import com.gobang.gobang.global.RsData.RsData;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewReportService reviewReportService;
    private final ReviewCommentService reviewCommentService;
    private final ReviewService reviewService;


    @Getter
    @AllArgsConstructor
    public static class ReviewsResponse {
        private final List<Review> reviews;
    }

    // 리뷰 목록 조회 (다건)
    @GetMapping
    public RsData<ReviewsResponse> getAllReviews() {
        List<Review> reviews = reviewService.findAll();

        return RsData.of(
                "200",
                "목록 조회 성공",
                new ReviewsResponse(reviews)
        );
    }

    @Getter
    @AllArgsConstructor
    public static class ReviewResponse {
        private final Review review;
    }

    @GetMapping("/{id}")
    public RsData<ReviewResponse> getReview(@PathVariable("id") Long id) {
        return reviewService.getReviewById(id).map(review -> RsData.of(
                "200",
                "단건 조회 성공",
                new ReviewResponse(review)
        )).orElseGet(() -> RsData.of (
                "400",
                "%d번 리뷰는 존재하지 않습니다.".formatted(id),
                null
        ));
    }

    // dto에 옮겨놓음
//    @Data
//    public static class ReviewCreateRequest {
//        @NotBlank
//        private Long orderId;
//
//        @NotBlank
//        private Long orderItemId;
//
//        @NotBlank
//        private Long productId;
//
//        @NotBlank
//        private Long userId;
//
//        @NotBlank
//        private Integer rating;
//
//        @NotBlank
//        private String content;
//    }
//
//    @Getter
//    @AllArgsConstructor
//    public static class CreateReviewResponse {
//        private final Review review;
//    }

    // 리뷰 등록
    @PostMapping("")
    public RsData<ReviewDto.CreateReviewResponse> createReview(@Valid @RequestBody ReviewCreateRequest reviewCreateRequest) {
        RsData<Review> createRs = reviewService.createReview(reviewCreateRequest);

        if (createRs.isFail()) return (RsData) createRs;

        return RsData.of(
                createRs.getResultCode(),
                createRs.getMsg(),
                new CreateReviewResponse(createRs.getData())
        );
    }

    // 리뷰 수정
    @Getter
    @Setter
    public static class ModifyRequest {
        @NotNull
        private Integer rating;

        @NotBlank
        private String content;
    }

    @Getter
    @AllArgsConstructor
    public static class ModifyResponse {
        private final Review review;
    }

    @PatchMapping("/{id}")
    public RsData modify(@Valid @RequestBody ModifyRequest modifyRequest, @PathVariable("id") Long id){
        Optional<Review> opReview = reviewService.findById(id);

        if ( opReview.isEmpty() ) return RsData.of(
                "400",
                "%d번 게시물은 존재하지 않습니다.".formatted(id)
        );

        /// 회원 권한 canModify
        RsData<Review> modifyRs = reviewService.modify(opReview.get(), modifyRequest.getRating(), modifyRequest.getContent());

        return RsData.of(
                modifyRs.getResultCode(),
                modifyRs.getMsg(),
                new ModifyResponse((modifyRs.getData()))
        );
    }
//
//    // 리뷰 삭제 (소프트 딜리트) 추후 수정
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
//        boolean deleted = reviewService.deleteReview(id);
//        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
//    }
//    // 리뷰 신고 등록
//    @PostMapping("/{id}/report")
//    public ResponseEntity<?> createReviewReport(@PathVariable Long id, @RequestBody ReviewReport report) {
//        return reviewReportService.createReport(id, report)
//                .map(ResponseEntity::ok)
//                .orElseGet(() -> ResponseEntity.notFound().build());
//    }
//
//    // 리뷰 신고 삭제
//    @DeleteMapping("/reports/{reportId}")
//    public ResponseEntity<Void> deleteReport(@PathVariable Long reportId) {
//        boolean deleted = reviewReportService.deleteReport(reportId);
//        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
//    }
}