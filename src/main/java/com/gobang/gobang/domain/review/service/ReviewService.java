package com.gobang.gobang.domain.review.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.personal.dto.response.ReviewResponse;
import com.gobang.gobang.domain.review.dto.request.ReviewCreateRequest;
import com.gobang.gobang.domain.review.entity.Review;
import com.gobang.gobang.domain.review.repository.ReviewRepository;
import com.gobang.gobang.global.RsData.RsData;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final SiteUserRepository siteUserRepository;

    // 리뷰 다건 조회
//    public List<Review> findAll() {
//        return reviewRepository.findAllByOrderByCreatedDateDesc();
//    }

    // 리뷰 다건 조회 페이지네이션
//    public Page<Review> getReviews(int page) {
//        Pageable pageable = PageRequest.of(page,10, Sort.by(Sort.Direction.DESC, "createdDate"));
//
//
//        return this.reviewRepository.getAllReviews(pageable);
//    }
    public Page<Review> getReviews(int page, String sort) {
        System.out.println("🔥🔥 들어온 sort = " + sort);

        Sort sortOption = switch (sort) {
            case "like_desc" -> Sort.by(Sort.Direction.DESC, "reviewLike");
            case "like_asc" -> Sort.by(Sort.Direction.ASC, "reviewLike");
            case "rating_desc" -> Sort.by(Sort.Order.desc("rating"), Sort.Order.desc("createdDate"));
            case "rating_asc" -> Sort.by(Sort.Order.asc("rating"), Sort.Order.desc("createdDate"));
            case "date_asc" -> Sort.by(Sort.Direction.ASC, "createdDate");
            default -> Sort.by(Sort.Direction.DESC, "createdDate");
        };

        System.out.println("🧭 최종 sortOption = " + sortOption);
        Pageable pageable = PageRequest.of(page, 10, sortOption);
        return reviewRepository.findAll(pageable);
    }


    // 리뷰 단건 조회
    public Optional<Review> getReviewById(Long id) {
        return reviewRepository.findById(id);
    }

    // 리뷰 등록
    @Transactional
    public RsData<Review> createReview(ReviewCreateRequest req, String nickName) {


        SiteUser user = siteUserRepository.findByNickName(nickName)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 사용자입니다."));

        Review review = Review.builder()
                .orderId(req.getOrderId())
                .orderItemId(req.getOrderItemId())
                .productId(req.getProductId())
                .siteUser(user)
                .rating(req.getRating())
                .content(req.getContent())
                .createdBy(nickName)
                .createdDate(LocalDateTime.now())
                .modifiedDate(LocalDateTime.now())
                .isActive(true)
                .reviewLike(0)
                .viewCount(0)
//                .createdBy(dto.getUserName()) //
                .build();

        reviewRepository.save(review);

        // ✅ 이미지 저장
//        if (req.getImageUrls() != null && !req.getImageUrls().isEmpty()) {
//            List<Image> images = req.getImageUrls().stream()
//                    .map(url -> Image.builder()
//                            .refType(Image.RefType.REVIEW)
//                            .refId(review.getReviewId())
//                            .imageUrl(url)
//                            .sortOrder(0)
//                            .build())
//                    .toList();
////            imageRepository.saveAll(images);
//        }

        return RsData.of("200","리뷰가 등록되었습니다.", review);
    }


    public Optional<Review> findById(Long reviewId) {

        return reviewRepository.findById(reviewId);
    }

    @Transactional
    public RsData<Review> modify(Review review, @NotNull Integer rating, @NotBlank String content) {
        review.setRating(rating);
        review.setContent(content);
        review.setModifiedDate(LocalDateTime.now());

        reviewRepository.save(review);

        return RsData.of(
                "200",
                "%d번 리뷰가 수정되었습니다.".formatted(review.getReviewId()),
                review
        );
    }

    @Transactional
    public RsData<Review> delete(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다."));


        reviewRepository.delete(review);
        return RsData.of(
                "200",
                "%d번 리뷰가 삭제되었습니다."
        );
    }



//    // 리뷰 삭제
//    @Transactional
//    public boolean deleteReview(Long id) {
//        if (reviewRepository.existsById(id)) {
//            reviewRepository.deleteById(id);
//            return true;
//        }
//        return false;
//    }

    public List<ReviewResponse> getReviewsByUserId(Long userId) {
        return reviewRepository.findBySiteUser_Id(userId)
                .stream()
                .map(ReviewResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public Page<Review> searchReviews(String keyword, Pageable pageable) {
        return reviewRepository.findByContentContainingIgnoreCase(keyword, pageable);
    }
}