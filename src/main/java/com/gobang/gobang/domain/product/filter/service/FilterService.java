package com.gobang.gobang.domain.product.filter.service;

import com.gobang.gobang.domain.product.category.repository.CategoryRepository;
import com.gobang.gobang.domain.product.dto.FilterGroupDto;
import com.gobang.gobang.domain.product.dto.FilterOptionDto;
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
                                boolean appliesToAll, boolean Active) {
        // 1) 부모 카테고리
        Category parent = categoryRepository.findByCode(parentCode)
                .orElseThrow(() -> new RuntimeException("부모 카테고리를 찾을 수 없습니다: " + parentCode));

        // 2) 그룹 업서트 (있으면 수정, 없으면 생성)
        FilterGroup group = filterGroupRepository.findByCategory_CodeAndCode(parentCode, subCode)
                .orElseGet(() -> FilterGroup.builder()
                        .category(parent)   // INSERT일 때만 빌더로 기본 세팅
                        .code(subCode)
                        .build()
                );

        // 3) 공통 필드 세팅 (INSERT/UPDATE 공통)
        group.setName(subName);
        group.setDisplayOrder(displayOrder);
        group.setActive(Active);
        group.setAppliesToAll(appliesToAll);

        // 4) 저장 (id 있으면 UPDATE, 없으면 INSERT)
        filterGroupRepository.save(group);
    }



    @Transactional
    public void initOption(String categoryCode, String groupCode,
                           String label, String valueKey, int displayOrder,
                           String inputType, String selectType) {

        String hexColor;

        switch (valueKey.toLowerCase()) {
            case "white":
                hexColor = "#FFFFFF"; // 화이트
                break;
            case "beige":
                hexColor = "#F5F5DC"; // 베이지
                break;
            case "ivory":
                hexColor = "#FFFFF0"; // 아이보리
                break;
            case "navy":
                hexColor = "#000080"; // 네이비
                break;
            case "temp_2700":
                hexColor = "#FFD580"; // 따뜻한 빛
                break;
            case "temp_6500":
                hexColor = "#F0F8FF"; // 밝은 빛
                break;
            default:
                hexColor = "#000000"; // 기본값 (예: 블랙)
                break;
        }


        // 1) 소속 그룹(자연키) 찾기
        FilterGroup parent = filterGroupRepository.findByCategory_CodeAndCode(categoryCode, groupCode)
                .orElseThrow(() -> new RuntimeException("FilterGroup not found: " + groupCode + " / " + categoryCode));

        // 2) 옵션 업서트 (동일 그룹 내 valueKey 기준)
        FilterOption option = filterOptionRepository.findByGroup_IdAndValueKey(parent.getId(), valueKey)
                .orElseGet(() -> FilterOption.builder()
                        .group(parent)      // INSERT일 때만 빌더 사용
                        .valueKey(valueKey)
                        .build()
                );

        // 3) 공통 필드 세팅
        option.setLabel(label);
        option.setDisplayOrder(displayOrder);
        option.setActive(true);
        option.setInputType(inputType);
        option.setSelectType(selectType);
        option.setColorHex(hexColor);

        // 4) 저장
        filterOptionRepository.save(option);
    }


    public List<FilterGroupDto> getGroupListByCategoryId(Long categoryId, int size) {
        int limit = Math.max(1, Math.min(size, 50));
        List<FilterGroup> filterGroups = filterGroupRepository.findAllByCategory_IdAndActiveTrueOrderByDisplayOrderAscIdAsc(categoryId, PageRequest.of(0, limit));
        if (filterGroups.isEmpty()) {
            throw new RuntimeException("필터그룹 목록이 비어있습니다.");
        }
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

    public List<FilterOptionDto> getOptionListByGroupId(Long groupId, int size) {
        int limit = Math.max(1, Math.min(size, 50));
        List<FilterOption> filterOptions = filterOptionRepository.findAllByGroupId_IdAndActiveTrueOrderByDisplayOrderAscIdAsc(groupId, PageRequest.of(0, limit));
        if (filterOptions.isEmpty()) {
            throw new RuntimeException("필터 옵션이 비어있습니다.");
        }
        return filterOptions.stream()
                .map(t -> FilterOptionDto.builder()
                        .id(t.getId())
                        .label(t.getLabel())
                        .inputType(t.getInputType())
                        .selectType(t.getSelectType())
                        .colorHex(t.getColorHex())
                        .iconUrl(t.getIconUrl())
                        .tooltip(t.getTooltip())
                        .minValue(t.getMinValue())
                        .maxValue(t.getMaxValue())
                        .createdDate(t.getCreatedDate())
                        .modifiedDate(t.getModifiedDate())
                        .build())
                .toList();

    }
}
