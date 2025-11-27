package com.gobang.gobang.domain.review.controller;


import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.personal.dto.response.SiteUserResponse;
import com.gobang.gobang.domain.review.dto.response.*;
import com.gobang.gobang.domain.review.dto.request.ReviewCreateRequest;
import com.gobang.gobang.domain.review.dto.request.ReviewModifyRequest;
import com.gobang.gobang.domain.review.entity.Review;
import com.gobang.gobang.domain.review.service.ReviewCommentService;
import com.gobang.gobang.domain.image.service.ReviewImageService;
import com.gobang.gobang.domain.review.service.ReviewService;
import com.gobang.gobang.global.RsData.RsData;
import jakarta.validation.Valid;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Slf4j
public class ReviewController {

    private final ReviewCommentService reviewCommentService;
    private final ReviewService reviewService;
    private final SiteUserService siteUserService;
    private final ReviewImageService reviewImageService;



    // (평균 별점)상품 상세 만들어지면 사용
    @GetMapping("/average/{productId}")
    public RsData<Map<String, Object>> getAverageRating(@PathVariable Long productId) {
        Map<String, Object> avgData = reviewService.getAverageRating(productId);
        return RsData.of("200", "평균 별점 조회 성공", avgData);
    }

    // 별점 분포 그래프
    @GetMapping("/rating-group/{productId}")
    public RsData<Map<Integer, Long>> getRatingGroup(@PathVariable Long productId) {
        Map<Integer, Long> data = reviewService.getRatingGroup(productId);
        return RsData.of("200", "별점 분포 조회 성공", data);
    }



    @GetMapping
    public RsData<ReviewsResponse> getAllReviews(
            @RequestParam(required = false) Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "date_desc") String sort,
            @RequestParam(value = "kwType",required = false) List<String> kwTypes,
            @RequestParam(required = false) String keyword
    ) {
        System.out.println("🔥 sort param = " + sort);
        System.out.println("🔥 keyword param = " + keyword);
        System.out.println("🔥 productId param = " + productId);
        System.out.println("🔥 kwTypes param = " + kwTypes);


        // 검색 기능 추가
        List<String> safeKwTypes =
                (kwTypes == null) ? List.of() : kwTypes;

        Map<String, Boolean> kwTypesMap = safeKwTypes.stream()
                .collect(Collectors.toMap(
                        kwType -> kwType,
                        kwType -> true
                ));


        Page<Review> reviewPage = reviewService.getReviews(productId, page, sort, kwTypes, keyword);
        ReviewsResponse response = ReviewsResponse.fromPage(reviewPage);
        log.info("검색 요청: productId={}, page={}, sort={}, keyword={}",
                productId, page, sort, keyword);

        return RsData.of(
                "200",
                "목록 조회 성공",
               response
        );
    }

    // 포토 리뷰 전체 조회
    @GetMapping("/photo")
    public ResponseEntity<?> getPhotoReviews(@RequestParam Long productId) {
        List<PhotoReviewResponse> result =
                reviewImageService.getPhotoReviews(productId);

        return ResponseEntity.ok(
                RsData.of("200", "포토 리뷰 조회 성공", result)
        );
    }

    @GetMapping("/{id}")
    public RsData<ReviewResponse> getReview(@PathVariable("id") Long id) {

        return reviewService.getReviewById(id)
                .map(review -> {
                    ReviewResponse response = ReviewResponse.fromEntity(review, review.getProfileImageUrl()); // ✅ 안전하게 DTO 변환
                    return RsData.of(
                            "200",
                            "단건 조회 성공",
                            response
                    );
                })
                .orElseGet(() -> RsData.of(
                        "400",
                        "%d번 리뷰는 존재하지 않습니다.".formatted(id),
                        null
                ));
    }

    // 리뷰 등록
    @PostMapping("")
    public RsData<ReviewCreateResponse> createReview(@Valid @RequestBody ReviewCreateRequest reviewCreateRequest) {

        SiteUserResponse currentUser = siteUserService.getCurrentUserInfo();

        if(currentUser == null) {
            return RsData.of("401", "로그인 후 작성할 수 있습니다.");
        }


        String nickName = currentUser.getNickName();

        RsData<Review> createRs = reviewService.createReview(reviewCreateRequest, nickName);

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
    public RsData modifyReview(@Valid @RequestBody ReviewModifyRequest modifyRequest, @PathVariable("id") Long reviewId){


        SiteUserResponse currentUser = siteUserService.getCurrentUserInfo();

        RsData<Review> modifyRs = reviewService.modifyReview(reviewId, modifyRequest, currentUser.getId());

        if (modifyRs.isFail()) {
            return RsData.of(modifyRs.getResultCode(), modifyRs.getMsg());
        }

        return RsData.of(
                modifyRs.getResultCode(),
                modifyRs.getMsg(),
                new ReviewModifyResponse((modifyRs.getData()))
        );
    }

    @DeleteMapping("/{id}")
    public RsData<ReviewDeleteResponse> deleteReview(@PathVariable("id") Long reviewId) {
        SiteUserResponse currentUser = siteUserService.getCurrentUserInfo();

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String role = auth.getAuthorities().iterator().next().getAuthority();

        RsData<Review> deleteRs = reviewService.deleteReview(
                reviewId,
                currentUser.getId(),
                role
        );

        if (deleteRs.isFail()) {
            return RsData.of(deleteRs.getResultCode(), deleteRs.getMsg());
        }

        return RsData.of("200", "리뷰가 성공적으로 삭제되었습니다.");
    }

}