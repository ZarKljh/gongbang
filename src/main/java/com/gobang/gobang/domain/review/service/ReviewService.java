package com.gobang.gobang.domain.review.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.domain.image.service.ReviewImageService;
import com.gobang.gobang.domain.personal.dto.response.ReviewResponse;
import com.gobang.gobang.domain.review.dto.request.ReviewCreateRequest;
import com.gobang.gobang.domain.review.dto.request.ReviewModifyRequest;
import com.gobang.gobang.domain.review.dto.response.ReviewPopularProductResponse;
import com.gobang.gobang.domain.review.entity.Review;
import com.gobang.gobang.domain.review.repository.ReviewImageRepository;
import com.gobang.gobang.domain.review.repository.ReviewRepository;
import com.gobang.gobang.global.RsData.RsData;
import com.gobang.gobang.global.util.OpenAIClient;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.time.LocalDateTime;
import java.util.*;
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
    private final ImageRepository imageRepository;]

    // 리뷰 목록 조회
    public Page<Review> getReviews(
            Long productId,
            int page,
            String sort,
            List<String> kwTypes,
            String keyword,
            Integer rating
    ) {
        System.out.println("🔥🔥 들어온 sort = " + sort);

        Sort sortOption = switch (sort) {
            case "like_desc" -> Sort.by(Sort.Direction.DESC, "reviewLike");
            case "like_asc" -> Sort.by(Sort.Direction.ASC, "reviewLike");
            case "rating_desc" -> Sort.by(Sort.Order.desc("rating"), Sort.Order.desc("createdDate"));
            case "rating_asc" -> Sort.by(Sort.Order.asc("rating"), Sort.Order.asc("createdDate"));
            case "date_asc" -> Sort.by(Sort.Direction.ASC, "createdDate");
            default -> Sort.by(Sort.Direction.DESC, "createdDate");
        };

        Pageable pageable = PageRequest.of(page, 10, sortOption);

        boolean hasKeyword = keyword != null && !keyword.trim().isEmpty();

        Page<Review> reviewPage;

        // 1) 별점 필터가 가장 우선
        if (rating != null) {
            if (productId != null) {
                reviewPage = reviewRepository.findRatingFiltered(productId, rating, pageable);
            } else {
                reviewPage = reviewRepository.findRatingFilteredGlobal(rating, pageable);
            }

            // keyword도 별점 필터 내부에서 처리해야 함
            if (hasKeyword) {
                if (productId != null) {
                    reviewPage = reviewRepository.findByProductIdAndContentContainingIgnoreCase(
                            productId, keyword, pageable
                    );
                } else {
                    reviewPage = reviewRepository.findByContentContainingIgnoreCase(keyword, pageable);
                }
            }

            return decorateReviews(reviewPage);
        }

        // 2) 별점 필터 없으면 기본 목록
        if (productId != null) {
            if (hasKeyword) {
                reviewPage = reviewRepository.findByProductIdAndContentContainingIgnoreCase(productId, keyword, pageable);
            } else {
                reviewPage = reviewRepository.findByProductIdAndIsActiveTrue(productId, pageable);
            }
        } else {
            if (hasKeyword) {
                reviewPage = reviewRepository.findByContentContainingIgnoreCase(keyword, pageable);
            } else {
                reviewPage = reviewRepository.findByIsActiveTrue(pageable);
            }
        }

        return decorateReviews(reviewPage);
    }

    private Page<Review> decorateReviews(Page<Review> reviewPage) {
        reviewPage.forEach(review -> {
            List<Image> images = reviewImageRepository.findByRefTypeAndRefId(Image.RefType.REVIEW, review.getReviewId())
                    .stream()
                    .sorted(Comparator.comparing(Image::getSortOrder))
                    .toList();

            review.setImages(images);

            String profileUrl = imageRepository
                    .findByRefTypeAndRefId(Image.RefType.USER_PROFILE, review.getSiteUser().getId())
                    .map(Image::getImageUrl)
                    .orElse(null);

            review.setProfileImageUrl(profileUrl);
        });

        return reviewPage;
    }


    // 리뷰 단건 조회
    public Optional<Review> getReviewById(Long id) {
        Optional<Review> optionalReview = reviewRepository.findById(id);

        optionalReview.ifPresent(review -> {
            List<Image> images = reviewImageRepository.findByRefTypeAndRefId(Image.RefType.REVIEW, review.getReviewId())
                    .stream()
                    .sorted(Comparator.comparing(Image::getSortOrder))
                    .toList();

            review.setImages(images);

            String profileUrl = imageRepository
                    .findByRefTypeAndRefId(Image.RefType.USER_PROFILE, review.getSiteUser().getId())
                    .map(Image::getImageUrl)
                    .orElse(null);

            // 엔티티에 없는 값이므로 직접 DTO 변환 후 설정
            review.setProfileImageUrl(profileUrl);
        });

        return optionalReview;
    }





    // 리뷰 등록
    @Transactional
    public RsData<Review> createReview(ReviewCreateRequest req, String nickName) {


        SiteUser user = siteUserRepository.findByNickName(nickName)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 사용자입니다."));

        // 하나의 상품에 하나의 리뷰 허용
        if (reviewRepository.existsBySiteUserAndProductIdAndIsActiveTrue(user, req.getProductId())) {
            return RsData.of("400", "이미 리뷰를 작성했습니다.");
        }

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

        // 이미지가 존재하면 함께 저장
//        if (req.getImageUrls() != null && !req.getImageUrls().isEmpty()) {
//            reviewImageService.saveImages(review.getReviewId(), req.getImageUrls());
//        }

        return RsData.of("200","리뷰가 등록되었습니다.", review);
    }





    public Optional<Review> findById(Long reviewId) {

        return reviewRepository.findById(reviewId);
    }

    @Transactional
    public RsData<Review> modifyReview(Long reviewId, ReviewModifyRequest request, Long currentUserId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        // 작성자 검증
        if (!review.getSiteUser().getId().equals(currentUserId)) {
            return RsData.of("403", "본인만 리뷰를 수정할 수 있습니다.");
        }

        review.setRating(request.getRating());
        review.setContent(request.getContent());
        review.setModifiedDate(LocalDateTime.now());

        // 이미지 수정이 없는 경우 (마이페이지 수정)
        // request.getImageUrls()가 아예 null이거나, 프론트가 필드 자체를 보내지 않으면 그대로 유지
        if (request.getImageUrls().isEmpty()) {
            reviewRepository.save(review);
            return RsData.of("200", "리뷰가 수정되었습니다.(이미지 변경 없음)", review);
        }

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
    public RsData<Review> deleteReview(Long reviewId, Long currentUserId, String role) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        // 작성자 검증
        if (!review.getSiteUser().getId().equals(currentUserId)
                && !role.contains("ADMIN")) {
            return RsData.of("403", "삭제 권한이 없습니다.");
        }

        // 이미지 삭제
//        reviewImageService.deleteImagesByReviewId(reviewId);

        reviewRepository.delete(review);
        return RsData.of("200", "리뷰가 삭제되었습니다.", review);
    }

    public List<ReviewResponse> getReviewsByUserId(Long userId) {
        return reviewRepository.findBySiteUser_Id(userId)
                .stream()
                .map(item -> ReviewResponse.fromEntity(item, imageRepository))
                .collect(Collectors.toList());
    }

    public Page<Review> searchReviews(String keyword, Pageable pageable) {
        return reviewRepository.findByContentContainingIgnoreCase(keyword, pageable);
    }

    //  평균 별점
    public Map<String, Object> getAverageRating(Long productId) {
        List<Object[]> resultList = reviewRepository.findAverageRatingAndCountByProductId(productId);

        double avg = 0.0;
        long count = 0L;

        if (!resultList.isEmpty()) {
            Object[] row = resultList.get(0);

            if (row[0] != null) avg = ((Number) row[0]).doubleValue();
            if (row[1] != null) count = ((Number) row[1]).longValue();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("avgRating", Math.round(avg * 10) / 10.0); // 소수점 1자리
        response.put("totalCount", count);
        return response;
    }

    // 별점 분포 그래프
    public Map<Integer, Long> getRatingGroup(Long productId) {
        List<Object[]> result = reviewRepository.countRatingGroup(productId);

        Map<Integer, Long> map = new HashMap<>();

        // 기본값 0 넣기 (5~1점)
        for (int i = 1; i <= 5; i++) {
            map.put(i, 0L);
        }

        for (Object[] row : result) {
            Integer rating = (Integer) row[0];
            Long count = (Long) row[1];
            map.put(rating, count);
        }

        return map;
    }

    // 리뷰 100개 이상 상품 이미지 가져오기
    public List<ReviewPopularProductResponse> getProfileImageUrl() {

        List<ReviewPopularProductResponse> list = reviewRepository.findPopularReviewProducts();

        for (ReviewPopularProductResponse p : list) {

            // 대표 이미지 조회 (sortOrder ASC 우선)
            List<Image> images = imageRepository.findByRefTypeAndRefIdOrderBySortOrderAsc(
                    Image.RefType.PRODUCT,
                    p.getProductId()
            );

            if (!images.isEmpty()) {
                // DB에 들어있는 image_url 그대로 사용
                p.setThumbnail(images.get(0).getImageUrl());
            } else {
                // 기본 이미지
                p.setThumbnail("/images/no-image-soft.png");
            }
        }

        // 하루 랜덤 리스트 유지용 셔플
        Collections.shuffle(list);
        return list.size() > 10 ? list.subList(0, 10) : list;
    }

    public List<ReviewResponse> getInfiniteReviews(Long userId, Long lastId, int size) {
        Pageable pageable = PageRequest.of(0, size);

        List<Review> reviews = reviewRepository.findInfiniteReviews(
                userId,
                lastId,
                pageable
        );

        return reviews.stream()
                .map(review -> ReviewResponse.fromEntity(review, imageRepository))
                .toList();
    }

    public String generateReviewSummary(Long productId) {
        List<Review> reviews = reviewRepository.findByProductIdAndIsActiveTrue(productId);

        if (reviews.isEmpty()) {
            return "아직 작성된 리뷰가 없습니다.";
        }

        // 리뷰 본문만 추출
        List<String> contents = reviews.stream()
                .map(Review::getContent)
                .toList();

        String joinedText = String.join("\n", contents);

        return aiService.summarizeReviews(joinedText);
    }
}