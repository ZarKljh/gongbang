package com.gobang.gobang.domain.review.controller;


import com.gobang.gobang.domain.review.entity.Review;
import com.gobang.gobang.domain.review.entity.ReviewReport;
import com.gobang.gobang.domain.review.service.ReviewCommentService;
import com.gobang.gobang.domain.review.service.ReviewReportService;
import com.gobang.gobang.domain.review.service.ReviewService;
import com.gobang.gobang.global.RsData.RsData;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

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
        List<Review> reviews = reviewService.getAllReviews();

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

//    @Getter
//    @AllArgsConstructor
//    public static class CreateResponse {
//        private final Review review;
//    }
//
//    // 리뷰 등록
//    @PostMapping("")
//    public ResponseEntity<Review> createReview(@RequestBody Review review) {
//        return ResponseEntity.ok(reviewService.save(review));
//    }

    // 리뷰 수정
//    @PatchMapping("/{id}")
//    public ResponseEntity<?> updateReview(@PathVariable Long id, @RequestBody Review updatedReview) {
//        return reviewService.updateReview(id, updatedReview)
//                .map(ResponseEntity::ok)
//                .orElseGet(() -> ResponseEntity.notFound().build());
//    }
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