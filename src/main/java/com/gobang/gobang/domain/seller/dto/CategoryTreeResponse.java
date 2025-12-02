package com.gobang.gobang.domain.seller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class CategoryTreeResponse {
    private List<CategoryNode> categories;

    @Data
    @AllArgsConstructor
    public static class CategoryNode {
        private Long id;
        private String name;
        private List<SubcategoryNode> subcategories;
    }

    @Data
    @AllArgsConstructor
    public static class SubcategoryNode {
        private Long id;
        private String name;
    }
}
