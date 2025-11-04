package com.gobang.gobang.domain.review.controller;


import com.gobang.gobang.domain.review.dto.response.ReviewDeleteResponse;
import com.gobang.gobang.domain.review.dto.request.ReviewCreateRequest;
import com.gobang.gobang.domain.review.dto.request.ReviewModifyRequest;
import com.gobang.gobang.domain.review.dto.response.ReviewCreateResponse;
import com.gobang.gobang.domain.review.dto.response.ReviewModifyResponse;
import com.gobang.gobang.domain.review.dto.response.ReviewResponse;
import com.gobang.gobang.domain.review.dto.response.ReviewsResponse;
import com.gobang.gobang.domain.review.entity.Review;
import com.gobang.gobang.domain.review.service.ReviewCommentService;
import com.gobang.gobang.domain.review.service.ReviewReportService;
import com.gobang.gobang.domain.review.service.ReviewService;
import com.gobang.gobang.global.RsData.RsData;
import jakarta.validation.Valid;
import lombok.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewReportService reviewReportService;
    private final ReviewCommentService reviewCommentService;
    private final ReviewService reviewService;


    // 리뷰 목록 조회 (다건)
    @GetMapping
    public RsData<ReviewsResponse> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "date_desc") String sort,
            @RequestParam(required = false) String keyword
    ) {
        // ✅ 정렬 조건 처리
        Sort sortOption;
        switch (sort) {
            case "rating_desc" -> sortOption = Sort.by(Sort.Direction.DESC, "rating");
            case "like_desc" -> sortOption = Sort.by(Sort.Direction.DESC, "reviewLike");
            case "date_asc" -> sortOption = Sort.by(Sort.Direction.ASC, "createdDate");
            default -> sortOption = Sort.by(Sort.Direction.DESC, "createdDate"); // 최신순
        }

        Pageable pageable = PageRequest.of(page, 10, sortOption);
        Page<Review> reviewPage;

        // ✅ 검색 기능 추가 (keyword 있을 때만 검색)
        if (keyword != null && !keyword.trim().isEmpty()) {
            reviewPage = reviewService.searchReviews(keyword, pageable);
        } else {
            reviewPage = reviewService.getReviews(page);
        }

        return RsData.of(
                "200",
                "목록 조회 성공",
                new ReviewsResponse(reviewPage)
        );
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

    // 리뷰 등록
    @PostMapping("")
    public RsData<ReviewCreateResponse> createReview(@Valid @RequestBody ReviewCreateRequest reviewCreateRequest, Principal principal) {

        String userName = principal.getName();

        if(principal == null) {
            return RsData.of("401", "로그인 후 작성할 수 있습니다.");
        }

//        String userName = principal.getName();

        RsData<Review> createRs = reviewService.createReview(reviewCreateRequest, userName);

        if (createRs.isFail()) {
            return (RsData) createRs;
        }

        return RsData.of(
                createRs.getResultCode(),
                createRs.getMsg(),
                new ReviewCreateResponse(createRs.getData())
        );
    }

    // 리뷰 수정



    @PatchMapping("/{id}")
    public RsData modify(@Valid @RequestBody ReviewModifyRequest modifyRequest, @PathVariable("id") Long reviewId){
        Optional<Review> opReview = reviewService.findById(reviewId);

        if ( opReview.isEmpty() ) return RsData.of(
                "400",
                "%d번 리뷰가 존재하지 않습니다.".formatted(reviewId)
        );

        /// 회원 권한 canModify
        RsData<Review> modifyRs = reviewService.modify(opReview.get(), modifyRequest.getRating(), modifyRequest.getContent());

        return RsData.of(
                modifyRs.getResultCode(),
                modifyRs.getMsg(),
                new ReviewModifyResponse((modifyRs.getData()))
        );
    }

    // 리뷰 삭제
    @DeleteMapping("/{id}")
    public RsData<ReviewDeleteResponse> deleteReview(@PathVariable("id") Long reviewId) {
        Optional<Review> opReview = reviewService.findById(reviewId);

        if(opReview.isEmpty()) return RsData.of(
                "400",
                "%d번 리뷰가 존재하지 않습니다."
                .formatted(reviewId));

        RsData<Review> deleteRs = reviewService.delete(reviewId);

        return RsData.of(deleteRs.getResultCode(),deleteRs.getMsg(),new ReviewDeleteResponse(deleteRs.getData()));
    }

}