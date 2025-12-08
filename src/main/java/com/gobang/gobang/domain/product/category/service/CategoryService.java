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


    public Long getMinSubCategoryId(Long categoryId) {
        return subCategoryRepository.findTopByCategoryIdOrderByIdAsc(categoryId)
                .map(Subcategory::getId)   // Optional → Long
                .orElseThrow(() -> new RuntimeException("목록을 찾을 수 없습니다: categoryId=" + categoryId));
    }

    public SubCategoryDto getMinSubCategoryId2(Long categoryId) {
        return subCategoryRepository.findTopByCategoryIdOrderByIdAsc(categoryId)
                .map(SubCategoryDto::new)
                .orElseThrow(() ->
                        new RuntimeException("목록을 찾을 수 없습니다: categoryId=" + categoryId)
                );
    }

    @Transactional
    public void initCategory(String code, String name, String description, int order) {

        if (categoryRepository.existsByCode(code)) {
            Category t = categoryRepository.findByCode(code).get();
            t.setCode(code);
            t.setName(name);
            t.setDescription(description);
            t.setDisplayOrder(order);
            t.setActive(true);
            // JPA 변경감지로 update (save() 생략 가능하지만, 일관 위해 save 호출해도 OK)
            categoryRepository.save(t);
        } else {
            categoryRepository.save(
                    Category.builder()
                            .code(code)
                            .name(name)
                            .description(description)
                            .displayOrder(order)
                            .active(true)
                            .build()
            );
        }

    }

    @Transactional
    public void initSubCategory(String parentCode, String subCode, String subName, int order) {
        // 1️⃣ 부모 카테고리 조회
        Category parent = categoryRepository.findByCode(parentCode)
                .orElseThrow(() -> new RuntimeException("부모 카테고리를 찾을 수 없습니다: " + parentCode));

        // 2️⃣ 자식 서브카테고리 존재 여부 확인 (code 기준)
        Subcategory sub = subCategoryRepository.findByCode(subCode)
                .orElseGet(Subcategory::new);  // 없으면 새 객체 생성

        // 3️⃣ 공통 필드 세팅 (INSERT or UPDATE 모두 적용)
        sub.setCategory(parent);
        sub.setCode(subCode);
        sub.setName(subName);
        sub.setDisplayOrder(order);
        sub.setActive(true);

        // 4️⃣ save() → 새 엔티티면 INSERT, 기존이면 UPDATE
        subCategoryRepository.save(sub);
    }


}
