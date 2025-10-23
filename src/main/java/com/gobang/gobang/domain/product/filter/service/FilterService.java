package com.gobang.gobang.domain.product.filter.service;

import com.gobang.gobang.domain.product.category.repository.CategoryRepository;
import com.gobang.gobang.domain.product.dto.FilterGroupDto;
import com.gobang.gobang.domain.product.entity.Category;
import com.gobang.gobang.domain.product.entity.FilterGroup;
import com.gobang.gobang.domain.product.entity.FilterOption;
import com.gobang.gobang.domain.product.filter.repository.FilterGroupRepository;
import com.gobang.gobang.domain.product.filter.repository.FilterOptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
                .active(isActive)
                .appliesToAll(appliesToAll)
                .build();

        filterGroupRepository.save(sub);
    }



    public void initOption(String CategoryCode, String groupCode,
                           String label, String valueKey, int displayOrder, String inputType, String selectType) {
        FilterGroup parent = filterGroupRepository.findByCategory_CodeAndCode(CategoryCode, groupCode)
                .orElseThrow(() -> new RuntimeException("FilterGroup not found: " + groupCode + " / " + CategoryCode));

        FilterOption sub = FilterOption.builder()
                .group(parent)           // ✅ FK 세팅
                .label(label)
                .valueKey(valueKey)
                .displayOrder(displayOrder)
                .active(true)
                .inputType(inputType)
                .selectType(selectType)
                .build();

        filterOptionRepository.save(sub);
    }



    public List<FilterGroupDto> getGroupListByCategoryId(Long categoryId, int size) {
        int limit = Math.max(1, Math.min(size, 50));
        List<FilterGroup> filterGroups = filterGroupRepository.findAllByCategory_IdAndActiveTrueOrderByDisplayOrderAscIdAsc(categoryId, PageRequest.of(0, limit));
        return filterGroups.stream()
                .map(t -> FilterGroupDto.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .code(t.getCode())
                        .createdDate(t.getCreatedDate())
                        .modifiedDate(t.getModifiedDate())
                        .build())
                .toList();

    }
}
