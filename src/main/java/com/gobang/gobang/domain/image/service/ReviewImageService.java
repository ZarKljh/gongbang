package com.gobang.gobang.domain.image.service;

import com.gobang.gobang.domain.image.dto.ImageUploadRequest;
import com.gobang.gobang.domain.image.dto.ImageUploadResponse;
import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.domain.review.dto.response.PhotoReviewResponse;
import com.gobang.gobang.domain.review.entity.Review;
import com.gobang.gobang.domain.review.repository.ReviewImageRepository;
import com.gobang.gobang.domain.review.repository.ReviewRepository;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

//@Service
//@RequiredArgsConstructor
//@Transactional
//public class ReviewImageService {
//    private final ReviewImageRepository reviewImageRepository;
//    private final ReviewRepository reviewRepository;
//
//    // 이미지 저장
//    public void saveImages(Long reviewId, List<String> imageUrls) {
//        if (imageUrls == null || imageUrls.isEmpty()) return;
//
//        int order = 0;
//        for (String url : imageUrls) {
//            Image image = Image.builder()
//                    .refType(Image.RefType.REVIEW)
//                    .refId(reviewId)
//                    .imageUrl(url)
//                    .sortOrder(order++)
//                    .build();
//            reviewImageRepository.save(image);
//        }
//    }
//
//    // 리뷰 ID 기준 이미지 조회
//    public List<Image> getImagesByReviewId(Long reviewId) {
//        return reviewImageRepository.findByRefTypeAndRefId(Image.RefType.REVIEW, reviewId);
//    }
//
//    // 리뷰 삭제 시 이미지 삭제
//    public void deleteImagesByReviewId(Long reviewId) {
//        reviewImageRepository.deleteByRefTypeAndRefId(Image.RefType.REVIEW, reviewId);
//    }
//
//    public List<PhotoReviewResponse> getPhotoReviews(Long productId) {
//
//        // 1) productId 기준 리뷰 전체 조회
//        List<Review> reviews = reviewRepository.findByProductId(productId);
//        if (reviews.isEmpty()) return List.of();
//
//        List<Long> reviewIds = reviews.stream()
//                .map(Review::getReviewId)
//                .toList();
//
//        // 2) 해당 리뷰들의 이미지 한 번에 조회
//        List<Image> images = reviewImageRepository
//                .findByRefTypeAndRefIdInOrderBySortOrderAsc(
//                        Image.RefType.REVIEW,
//                        reviewIds
//                );
//
//        if (images.isEmpty()) return List.of();
//
//        // 3) 리뷰ID → 대표 이미지 매핑 (sortOrder ASC라 첫 이미지가 대표)
//        Map<Long, Image> representativeImageMap =
//                images.stream().collect(Collectors.toMap(
//                        Image::getRefId,
//                        img -> img,
//                        (existing, duplicate) -> existing // 기존(first)의 순서를 유지
//                ));
//
//        // 4) 이미지가 있는 리뷰만 필터링해서 DTO 변환
//        return reviews.stream()
//                .filter(r -> representativeImageMap.containsKey(r.getReviewId()))
//                .map(r -> {
//                    Image img = representativeImageMap.get(r.getReviewId());
//                    return new PhotoReviewResponse(
//                            r.getReviewId(),
//                            img.getImageUrl(),
//                            r.getContent()
//                    );
//                })
//                .toList();
//    }
//}

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewImageService {

    private final ImageRepository imageRepository;
    private final ReviewImageRepository reviewImageRepository;
    private final ReviewRepository reviewRepository;

    @Value("${custom.genFileDirPath}")
    private String uploadPath;

    /**
     * 리뷰 이미지 업로드
     */
    public RsData<ImageUploadResponse> uploadReviewImage(ImageUploadRequest request) {
        try {
            MultipartFile file = request.getFile();
            if (file == null || file.isEmpty()) return RsData.of("400", "이미지 파일이 없습니다.");

            // 디렉토리 생성 보장
            Files.createDirectories(Paths.get(uploadPath));

            // 파일명 생성
            String originalName = file.getOriginalFilename();
            String ext = originalName.substring(originalName.lastIndexOf("."));
            String newFileName = System.currentTimeMillis() + "_" + UUID.randomUUID() + ext;

            // 실제 저장 경로
            Path savePath = Paths.get(uploadPath, newFileName);
            Files.copy(file.getInputStream(), savePath, StandardCopyOption.REPLACE_EXISTING);

            // DB 저장
            Image image = Image.builder()
                    .refType(request.getRefType())              // REVIEW
                    .refId(request.getRefId())                  // reviewId
                    .imageFileName(newFileName)
                    .imageUrl("/images/" + newFileName)
                    .sortOrder(request.getSortOrder())
                    .build();

            Image saved = imageRepository.save(image);
            return RsData.of("200", "성공", new ImageUploadResponse(saved));

        } catch (IOException e) {
            return RsData.of("500", "업로드 실패: " + e.getMessage());
        }
    }

    /**
     * 리뷰 이미지 조회
     */
    public List<ImageUploadResponse> getReviewImages(Long reviewId) {
        return imageRepository.findALLByRefIdAndRefType(reviewId, Image.RefType.REVIEW)
                .stream()
                .map(ImageUploadResponse::new)
                .toList();
    }

    /**
     * 리뷰 이미지 삭제
     */
    public RsData<Void> deleteReviewImage(Long imageId) {
        return imageRepository.findById(imageId)
                .map(image -> {
                    try {
                        Files.deleteIfExists(Paths.get(uploadPath, image.getImageFileName()));
                    } catch (IOException ignored) {
                    }
                    imageRepository.delete(image);
                    return RsData.<Void>of("200", "삭제 완료");
                })
                .orElseGet(() -> RsData.<Void>of("404", "이미지를 찾을 수 없습니다."));
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
