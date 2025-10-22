package com.gobang.gobang.domain.product.filter.service;

import com.gobang.gobang.domain.product.category.repository.CategoryRepository;
import com.gobang.gobang.domain.product.entity.Category;
import com.gobang.gobang.domain.product.entity.FilterGroup;
import com.gobang.gobang.domain.product.filter.repository.FilterGroupRepository;
import com.gobang.gobang.domain.product.filter.repository.FilterOptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FilterService {
    private final FilterGroupRepository filterGroupRepository;
    private final FilterOptionRepository filterOptionRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public void initGroupFilter(String parentCode, String subCode, String subName, int displayOrder,
                                boolean appliesToAll,
                                boolean isActive) {
        Category parent = categoryRepository.findByCode(parentCode)
                .orElseThrow(() -> new RuntimeException("부모 카테고리를 찾을 수 없습니다: " + parentCode));

        FilterGroup sub = FilterGroup.builder()
                .category(parent)           // ✅ FK 세팅
                .code(subCode)
                .name(subName)
                .displayOrder(displayOrder)
                .isActive(isActive)
                .appliesToAll(appliesToAll)
                .build();

        filterGroupRepository.save(sub);     // ✅ 주인쪽 저장이면 FK 포함 INSERT
    }



}
