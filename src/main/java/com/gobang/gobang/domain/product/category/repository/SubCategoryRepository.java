package com.gobang.gobang.domain.product.category.repository;

import com.gobang.gobang.domain.product.entity.Subcategory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubCategoryRepository extends JpaRepository<Subcategory, Long> {
    List<Subcategory> findAllByOrderByDisplayOrderAscIdAsc(Pageable pageable);

    List<Subcategory> findAllByCategory_IdOrderByDisplayOrderAscIdAsc(Long categoryId, Pageable pageable);

    Optional<Subcategory> findByCode(String parentCode);
}
