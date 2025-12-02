package com.gobang.gobang.domain.review.repository;

import com.gobang.gobang.domain.image.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;

@Repository
public interface ReviewImageRepository extends JpaRepository<Image, Long> {

    // 특정 리뷰의 이미지 전체
    List<Image> findByRefTypeAndRefId(Image.RefType refType, Long refId);

    // 여러 리뷰의 이미지를 한 번에
    List<Image> findByRefTypeAndRefIdInOrderBySortOrderAsc(Image.RefType refType, List<Long> refIds);


    void deleteByRefTypeAndRefId(Image.RefType refType, Long refId);
}