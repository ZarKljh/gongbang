package com.gobang.gobang.domain.product.category.Repository;

import com.gobang.gobang.domain.product.entity.Subcategory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubCategoryRepository extends JpaRepository<Subcategory, Long> {
    List<Subcategory> findAllByOrderByDisplayOrderAscIdAsc(Pageable pageable);

    List<Subcategory> findAllByCategory_IdOrderByDisplayOrderAscIdAsc(Long categoryId, Pageable pageable);
}
