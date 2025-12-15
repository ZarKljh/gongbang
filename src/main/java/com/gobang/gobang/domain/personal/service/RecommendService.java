package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.domain.personal.dto.response.RecommendResponse;
import com.gobang.gobang.domain.personal.entity.WishList;
import com.gobang.gobang.domain.personal.repository.WishListRepository;
import com.gobang.gobang.domain.product.entity.Category;
import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.domain.product.entity.Subcategory;
import com.gobang.gobang.domain.product.productList.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendService {

    private final WishListRepository wishListRepository;
    private final ProductRepository productRepository;
    private final AiMessageService aiMessageService;
    private final ImageRepository imageRepository;

    public RecommendResponse getWishlistRecommend(Long userId) {

        // 최근 위시 가져오기
        List<WishList> recentWish =
                wishListRepository.findTop10BySiteUser_IdOrderByCreatedAtDesc(userId);

        if (recentWish.isEmpty()) {
            return new RecommendResponse(Collections.emptyList(), "");
        }

        Product base = recentWish.get(0).getProduct();

        Long baseCategoryId = base.getCategoryId();
        Subcategory baseSub = base.getSubcategory();
        Set<Category> extraCategories = base.getCategory();

        //  recommendedProducts 스코프 선언
        List<Product> recommendedProducts = new ArrayList<>();

        // 서브카테고리 기반 추천
        if (baseSub != null) {
            List<Product> subList =
                    productRepository.findTop12BySubcategory_IdAndActiveIsTrueOrderByCreatedDateDesc(
                            baseSub.getId()
                    );
            recommendedProducts.addAll(subList);
        }

        // 기본 카테고리 기반
        if (recommendedProducts.size() < 8 && baseCategoryId != null) {
            List<Product> categoryList =
                    productRepository.findTop12ByCategoryIdAndActiveIsTrueOrderByCreatedDateDesc(baseCategoryId);
            mergeWithoutDup(recommendedProducts, categoryList);
        }

        // product_category_map 기반 확장 추천
        if (recommendedProducts.size() < 8 && extraCategories != null) {
            for (Category c : extraCategories) {
                List<Product> extraList =
                        productRepository.findTop12ByCategory_CodeAndActiveIsTrueOrderByCreatedDateDesc(
                                c.getCode()
                        );
                mergeWithoutDup(recommendedProducts, extraList);
            }
        }

        // 자신 제외
        recommendedProducts.removeIf(p -> p.getId().equals(base.getId()));

        if (recommendedProducts.isEmpty()) {
            return new RecommendResponse(Collections.emptyList(), "");
        }

        // AI 메시지 생성
        String aiMessage = aiMessageService.generateCategoryMessage(base, baseSub);

        if (recommendedProducts.size() < 10) {
            List<Product> fallback = productRepository.findTop20ByActiveIsTrueOrderByCreatedDateDesc();

            mergeWithoutDup(recommendedProducts, fallback);
        }

        return RecommendResponse.from(recommendedProducts, aiMessage, imageRepository);
    }

    private void mergeWithoutDup(List<Product> base, List<Product> add) {
        Set<Long> exist = base.stream().map(Product::getId).collect(Collectors.toSet());
        for (Product p : add) {
            if (!exist.contains(p.getId())) {
                base.add(p);
            }
        }
    }
}