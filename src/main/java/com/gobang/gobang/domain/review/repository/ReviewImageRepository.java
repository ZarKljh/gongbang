package com.gobang.gobang.domain.review.repository;

import com.gobang.gobang.domain.image.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewImageRepository extends JpaRepository<Image, Long> {

    // 특정 리뷰의 이미지 전체
    List<Image> findByRefTypeAndRefId(Image.RefType refType, Long refId);

    // 여러 리뷰의 이미지를 한 번에
    List<Image> findByRefTypeAndRefIdInOrderBySortOrderAsc(Image.RefType refType, List<Long> refIds);

    // 포토리뷰 최신 정렬 조회
//    @Query("""
//    SELECT i
//    FROM Image i
//    JOIN Review r ON i.refId = r.reviewId
//    WHERE i.refType = :refType
//    AND i.sortOrder = 0
//    ORDER BY r.createdDate DESC
//""")
//    List<Image> findLatestPhotoReviews(@Param("refType") Image.RefType refType);

    void deleteByRefTypeAndRefId(Image.RefType refType, Long refId);
}