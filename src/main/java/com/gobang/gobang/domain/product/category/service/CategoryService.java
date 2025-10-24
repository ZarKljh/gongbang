package com.gobang.gobang.domain.product.category.service;

import com.gobang.gobang.domain.product.category.repository.CategoryRepository;
import com.gobang.gobang.domain.product.category.repository.SubCategoryRepository;
import com.gobang.gobang.domain.product.dto.CategoryDto;
import com.gobang.gobang.domain.product.dto.SubCategoryDto;
import com.gobang.gobang.domain.product.entity.Category;
import com.gobang.gobang.domain.product.entity.Subcategory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;

    public List<CategoryDto> getCategoryList(int size) {
        int limit = Math.max(1, Math.min(size, 50));
        List<Category> categories = categoryRepository.findByActiveTrueOrderByDisplayOrderAsc(PageRequest.of(0, limit));
        return categories.stream()
                .map(t -> CategoryDto.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .code(t.getCode())
                        .createdDate(t.getCreatedDate())
                        .modifiedDate(t.getModifiedDate())
                        .build())
                .toList();
    }




    public List<SubCategoryDto> getSubCategoryList(int size) {
        int limit = Math.max(1, Math.min(size, 50));
        List<Subcategory> subCategory = subCategoryRepository.findAllByActiveTrueOrderByDisplayOrderAscIdAsc(PageRequest.of(0, limit));
        return subCategory.stream()
                .map(t -> SubCategoryDto.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .code(t.getCode())
                        .createdDate(t.getCreatedDate())
                        .modifiedDate(t.getModifiedDate())
                        .build())
                .toList();
    }

    public List<SubCategoryDto> getSubCategoryIdList(Long categoryId, int size) {
        int limit = Math.max(1, Math.min(size, 50));
        List<Subcategory> subCategory = subCategoryRepository.findAllByActiveTrueAndCategory_IdOrderByDisplayOrderAscIdAsc(categoryId, PageRequest.of(0, limit));
        return subCategory.stream()
                .map(t -> SubCategoryDto.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .code(t.getCode())
                        .createdDate(t.getCreatedDate())
                        .modifiedDate(t.getModifiedDate())
                        .build())
                .toList();

    }



    @Transactional
    public Category initCategory(String code, String name, String description, int order) {
        Category category = Category.builder()
                .code(code)
                .name(name)
                .description(description)
                .displayOrder(order)
                .active(true)
                .build();

        return categoryRepository.save(category);
    }

    @Transactional
    public void initSubCategory(String parentCode, String subCode, String subName, int order) {
        Category parent = categoryRepository.findByCode(parentCode)
                .orElseThrow(() -> new RuntimeException("부모 카테고리를 찾을 수 없습니다: " + parentCode));

        Subcategory sub = Subcategory.builder()
                .category(parent)           // ✅ FK 세팅
                .code(subCode)
                .name(subName)
                .displayOrder(order)
                .active(true)
                .build();

        subCategoryRepository.save(sub);     // ✅ 주인쪽 저장이면 FK 포함 INSERT
    }


}
