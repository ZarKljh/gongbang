package com.gobang.gobang.domain.product.category.repository;

import com.gobang.gobang.domain.product.entity.Subcategory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubCategoryRepository extends JpaRepository<Subcategory, Long> {

    List<Subcategory> findAllByActiveTrueAndCategory_IdOrderByDisplayOrderAscIdAsc(Long categoryId, PageRequest of);

    List<Subcategory> findAllByActiveTrueOrderByDisplayOrderAscIdAsc(PageRequest of);

    Optional<Subcategory> findByCode(String subCode);
}
