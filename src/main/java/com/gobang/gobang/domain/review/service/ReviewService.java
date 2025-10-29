package com.gobang.gobang.domain.review.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.review.dto.ReviewDto;
import com.gobang.gobang.domain.review.dto.request.ReviewCreateRequest;
import com.gobang.gobang.domain.review.entity.Review;
import com.gobang.gobang.domain.review.repository.ReviewRepository;
import com.gobang.gobang.global.RsData.RsData;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final SiteUserRepository siteUserRepository;

    // 리뷰 다건 조회
//    public List<Review> getAllReviews() {
//        return reviewRepository.findAll();
//    }

    // 리뷰 다건 조회
    public List<Review> findAll() {
        return reviewRepository.findAllByOrderByCreatedDateDesc();
    }

    // 리뷰 단건 조회
    public Optional<Review> getReviewById(Long id) {
        return reviewRepository.findById(id);
    }

    // 리뷰 등록
    @Transactional
    public RsData<Review> createReview(ReviewCreateRequest dto, String userName) {


        SiteUser user = siteUserRepository.findByUserName(userName)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 사용자입니다."));

        Review review = Review.builder()
                .orderId(dto.getOrderId())
                .orderItemId(dto.getOrderItemId())
                .productId(dto.getProductId())
                .userId(dto.getUserId())
                .rating(dto.getRating())
                .content(dto.getContent())
                .createdBy(userName)
                .createdDate(LocalDateTime.now())
                .modifiedDate(LocalDateTime.now())
                .isActive(true)
                .reviewLike(0)
                .viewCount(0)
//                .createdBy(dto.getUserName()) //
                .build();

        reviewRepository.save(review);

        return RsData.of("200","리뷰가 등록되었습니다.", review);
    }

    public Optional<Review> findById(Long reviewId) {

        return reviewRepository.findById(reviewId);
    }

    @Transactional
    public RsData<Review> modify(Review review, @NotNull Integer rating, @NotBlank String content) {
        review.setRating(rating);
        review.setContent(content);

        reviewRepository.save(review);

        return RsData.of(
                "200",
                "%d번 리뷰가 수정되었습니다.".formatted(review.getReviewId()),
                review
        );
    }


//
//    // 리뷰 수정
//    @Transactional
//    public Optional<Review> updateReview(Long id, Review updatedReview) {
//        return reviewRepository.findById(id).map(review -> {
//            review.setContent(updatedReview.getContent());
//            review.setRating(updatedReview.getRating());
//            return reviewRepository.save(review);
//        });
//    }


//    // 리뷰 삭제
//    @Transactional
//    public boolean deleteReview(Long id) {
//        if (reviewRepository.existsById(id)) {
//            reviewRepository.deleteById(id);
//            return true;
//        }
//        return false;
//    }
}