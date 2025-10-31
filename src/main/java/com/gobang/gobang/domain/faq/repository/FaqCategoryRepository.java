package com.gobang.gobang.domain.faq.repository;

import com.gobang.gobang.domain.faq.entity.FaqCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FaqCategoryRepository extends JpaRepository<FaqCategory, UUID> {
    Optional<FaqCategory> findBySlug(String slug);
    boolean existsByName(String name);
    boolean existsBySlug(String slug);
}
