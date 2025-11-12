package com.gobang.gobang.domain.review.repository;

import com.gobang.gobang.domain.image.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewImageRepository extends JpaRepository<Image, Long> {
    List<Image> findByRefTypeAndRefId(Image.RefType refType, Long refId);
    void deleteByRefTypeAndRefId(Image.RefType refType, Long refId);
}