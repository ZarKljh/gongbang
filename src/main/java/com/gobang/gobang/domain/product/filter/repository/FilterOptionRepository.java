package com.gobang.gobang.domain.product.filter.repository;

import com.gobang.gobang.domain.product.entity.FilterOption;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FilterOptionRepository extends JpaRepository<FilterOption, Long> {
    List<FilterOption> findAllByGroupId_IdAndActiveTrueOrderByDisplayOrderAscIdAsc(Long groupId, PageRequest of);

    Optional<FilterOption> findByGroup_IdAndValueKey(Long id, String valueKey);
}
