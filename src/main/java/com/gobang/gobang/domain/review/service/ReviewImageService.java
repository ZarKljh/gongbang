package com.gobang.gobang.domain.review.service;

import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.review.repository.ReviewImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewImageService {
    private final ReviewImageRepository reviewImageRepository;

    // ✅ 이미지 저장
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

    // ✅ 리뷰 ID 기준 이미지 조회
    public List<Image> getImagesByReviewId(Long reviewId) {
        return reviewImageRepository.findByRefTypeAndRefId(Image.RefType.REVIEW, reviewId);
    }

    // ✅ 리뷰 삭제 시 이미지 삭제
    public void deleteImagesByReviewId(Long reviewId) {
        reviewImageRepository.deleteByRefTypeAndRefId(Image.RefType.REVIEW, reviewId);
    }
}
