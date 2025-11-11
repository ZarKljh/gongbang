package com.gobang.gobang.domain.review.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.personal.dto.response.ReviewResponse;
import com.gobang.gobang.domain.review.dto.request.ReviewCreateRequest;
import com.gobang.gobang.domain.review.dto.request.ReviewModifyRequest;
import com.gobang.gobang.domain.review.entity.Review;
import com.gobang.gobang.domain.review.repository.ReviewImageRepository;
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
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final SiteUserRepository siteUserRepository;
    private final ReviewImageService reviewImageService ;
    private final ReviewImageRepository reviewImageRepository;

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
    public Page<Review> getReviews(Long productId, int page, String sort) {
        System.out.println("🔥🔥 들어온 sort = " + sort);

        Sort sortOption = switch (sort) {
            case "like_desc" -> Sort.by(Sort.Direction.DESC, "reviewLike");
            case "like_asc" -> Sort.by(Sort.Direction.ASC, "reviewLike");
            case "rating_desc" -> Sort.by(Sort.Order.desc("rating"), Sort.Order.desc("createdDate"));
            case "rating_asc" -> Sort.by(Sort.Order.asc("rating"), Sort.Order.desc("createdDate"));
            case "date_asc" -> Sort.by(Sort.Direction.ASC, "createdDate");
            default -> Sort.by(Sort.Direction.DESC, "createdDate");
        };

//        System.out.println("🧭 최종 sortOption = " + sortOption);
        Pageable pageable = PageRequest.of(page, 10, sortOption);

        // productId 기준 리뷰 조회
        Page<Review> reviewPage;
        if (productId != null) {
            reviewPage = reviewRepository.findByProductIdAndIsActiveTrue(productId, pageable);
        } else {
            reviewPage = reviewRepository.findByIsActiveTrue(pageable);
        }

        return reviewPage;
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
                .build();

        reviewRepository.save(review);

        // ✅ 이미지가 존재하면 함께 저장
        if (req.getImageUrls() != null && !req.getImageUrls().isEmpty()) {
            reviewImageService.saveImages(review.getReviewId(), req.getImageUrls());
        }

        return RsData.of("200","리뷰가 등록되었습니다.", review);
    }


    public Optional<Review> findById(Long reviewId) {

        return reviewRepository.findById(reviewId);
    }

    ///  기존 수정 록직
//    @Transactional
//    public RsData<Review> modify(Review review, @NotNull Integer rating, @NotBlank String content) {
//        review.setRating(rating);
//        review.setContent(content);
//        review.setModifiedDate(LocalDateTime.now());
//
//        reviewRepository.save(review);
//
//        return RsData.of(
//                "200",
//                "%d번 리뷰가 수정되었습니다.".formatted(review.getReviewId()),
//                review
//        );
//    }

    @Transactional
    public RsData<Review> modifyReview(Long reviewId, ReviewModifyRequest request, Long currentUserId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        // 🔒 작성자 검증
        if (!review.getSiteUser().getId().equals(currentUserId)) {
            return RsData.of("403", "본인만 리뷰를 수정할 수 있습니다.");
        }

        review.setRating(request.getRating());
        review.setContent(request.getContent());
        review.setModifiedDate(LocalDateTime.now());

        // 최종 이미지 URL 리스트(프론트에서 순서대로 보냄)
        List<String> targetUrls = Optional.ofNullable(request.getImageUrls()).orElseGet(List::of)
                .stream()
                .distinct()                // 중복 제거
                .limit(5)                  // 최대 5장
                .toList();

        // 현재 저장된 이미지 목록
        List<Image> current = reviewImageRepository.findByRefTypeAndRefId(Image.RefType.REVIEW, reviewId);

        // 삭제 대상: 현재 - 타겟
        List<Image> toDelete = current.stream()
                .filter(img -> !targetUrls.contains(img.getImageUrl()))
                .toList();

        // 추가 대상: 타겟 - 현재
        Set<String> currentUrlSet = current.stream().map(Image::getImageUrl).collect(Collectors.toSet());
        List<String> toAdd = targetUrls.stream()
                .filter(url -> !currentUrlSet.contains(url))
                .toList();

        // 삭제 실행
        toDelete.forEach(reviewImageRepository::delete);

        // 추가 실행 (정렬 순서는 아래에서 일괄 세팅할거라 임시로 0)
        for (String url : toAdd) {
            if (url.length() > 255) {
                throw new IllegalArgumentException("이미지 URL 길이가 255를 초과합니다: " + url);
            }
            Image image = Image.builder()
                    .refType(Image.RefType.REVIEW)
                    .refId(reviewId)
                    .imageUrl(url)
                    .sortOrder(0)
                    .build();
            reviewImageRepository.save(image);
        }

        // 최종 순서대로 sortOrder 재정렬
        // (DB에서 다시 읽어와서 매칭)
        List<Image> refreshed = reviewImageRepository.findByRefTypeAndRefId(Image.RefType.REVIEW, reviewId);
        Map<String, Image> byUrl = refreshed.stream()
                .collect(Collectors.toMap(Image::getImageUrl, Function.identity(), (a, b)->a));

        int order = 0;
        for (String url : targetUrls) {
            Image img = byUrl.get(url);
            if (img != null) {
                img.setSortOrder(order++);
                // JPA 변경감지로 update
            }
        }

        reviewRepository.save(review);

        return RsData.of("200", "리뷰가 수정되었습니다.", review);
    }


    @Transactional
    public RsData<Review> deleteReview(Long reviewId, Long currentUserId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        // 🔒 작성자 검증
        if (!review.getSiteUser().getId().equals(currentUserId)) {
            return RsData.of("403", "본인만 리뷰를 삭제할 수 있습니다.");
        }

        // 이미지 삭제
        reviewImageService.deleteImagesByReviewId(reviewId);

        reviewRepository.delete(review);
        return RsData.of("200", "리뷰가 삭제되었습니다.", review);
    }

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