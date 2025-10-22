package com.gobang.gobang.domain.product.category.Service;

import com.gobang.gobang.domain.product.category.Repository.CategoryRepository;
import com.gobang.gobang.domain.product.dto.CategoryDto;
import com.gobang.gobang.domain.product.entity.Category;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public List<CategoryDto> getCategoryList(int size) {
        int limit = Math.max(1, Math.min(size, 50));
        List<Category> Category = categoryRepository.findActiveCategories(PageRequest.of(0, limit));
        return Category.stream()
                .map(t -> CategoryDto.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .code(t.getCode())
                        .createdDate(t.getCreatedDate())
                        .modifiedDate(t.getModifiedDate())
                        .build())
                .toList();
    }


    public Category InitCategory(String code, String name, String description, int order) {
        Category category = Category.builder()
                .code(code)
                .name(name)
                .description(description)
                .displayOrder(order)
                .active(true)
                .build();

        return categoryRepository.save(category);
    }
}
