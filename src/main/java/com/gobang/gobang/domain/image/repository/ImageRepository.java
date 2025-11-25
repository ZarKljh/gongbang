package com.gobang.gobang.domain.image.repository;

import com.gobang.gobang.domain.image.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {
    Optional<Image> findByRefIdAndRefType(Long studioId, Image.RefType refType);
    List<Image> findALLByRefIdAndRefType(Long studioId, Image.RefType refType);
    Optional<Image> findByRefTypeAndRefId(Image.RefType refType, Long refId);

    List<Image> findByRefTypeAndRefIdOrderBySortOrderAsc(Image.RefType refType, Long refId);
    void deleteByRefTypeAndRefId(Image.RefType refType, Long refId);
}
