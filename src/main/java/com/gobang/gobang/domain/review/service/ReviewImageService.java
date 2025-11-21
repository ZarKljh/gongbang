package com.gobang.gobang.domain.review.service;

import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.review.dto.response.PhotoReviewResponse;
import com.gobang.gobang.domain.review.entity.Review;
import com.gobang.gobang.domain.review.repository.ReviewImageRepository;
import com.gobang.gobang.domain.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewImageService {
    private final ReviewImageRepository reviewImageRepository;
    private final ReviewRepository reviewRepository;

    // 이미지 저장
    public void saveImages(Long reviewId, List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) return;

        int order = 0;
        for (String url : imageUrls) {
            Image image = Image.builder()
                    .refType(Image.RefType.REVIEW)
                    .refId(reviewId)
                    .imageUrl(url)
                    .sortOrder(order++)
                    .build();
            reviewImageRepository.save(image);
        }
    }

    // 리뷰 ID 기준 이미지 조회
    public List<Image> getImagesByReviewId(Long reviewId) {
        return reviewImageRepository.findByRefTypeAndRefId(Image.RefType.REVIEW, reviewId);
    }

    // 리뷰 삭제 시 이미지 삭제
    public void deleteImagesByReviewId(Long reviewId) {
        reviewImageRepository.deleteByRefTypeAndRefId(Image.RefType.REVIEW, reviewId);
    }

    public List<PhotoReviewResponse> getPhotoReviews(Long productId) {

        // 1) productId 기준 리뷰 전체 조회
        List<Review> reviews = reviewRepository.findByProductId(productId);
        if (reviews.isEmpty()) return List.of();

        List<Long> reviewIds = reviews.stream()
                .map(Review::getReviewId)
                .toList();

        // 2) 해당 리뷰들의 이미지 한 번에 조회
        List<Image> images = reviewImageRepository
                .findByRefTypeAndRefIdInOrderBySortOrderAsc(
                        Image.RefType.REVIEW,
                        reviewIds
                );

        if (images.isEmpty()) return List.of();

        // 3) 리뷰ID → 대표 이미지 매핑 (sortOrder ASC라 첫 이미지가 대표)
        Map<Long, Image> representativeImageMap =
                images.stream().collect(Collectors.toMap(
                        Image::getRefId,
                        img -> img,
                        (existing, duplicate) -> existing // 기존(first)의 순서를 유지
                ));

        // 4) 이미지가 있는 리뷰만 필터링해서 DTO 변환
        return reviews.stream()
                .filter(r -> representativeImageMap.containsKey(r.getReviewId()))
                .map(r -> {
                    Image img = representativeImageMap.get(r.getReviewId());
                    return new PhotoReviewResponse(
                            r.getReviewId(),
                            img.getImageUrl(),
                            r.getContent()
                    );
                })
                .toList();
    }
}
