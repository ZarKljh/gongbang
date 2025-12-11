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
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;
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
        Set<Category> extraCategories = base.getCategory() != null
                ? base.getCategory()
                : Collections.emptySet();

        // 최종 추천 후보 및 점수 Map
        Map<Long, ScoredProduct> scoredProducts = new LinkedHashMap<>();

        // 1) 서브카테고리 기반 (가장 강력)
        if (baseSub != null) {
            List<Product> list = productRepository
                    .findTop12BySubcategory_IdAndActiveIsTrueOrderByCreatedDateDesc(baseSub.getId());
            addProducts(scoredProducts, list, 50);  // 높은 점수
        }

        // 2) 단일 카테고리 기반
        if (baseCategoryId != null) {
            List<Product> list = productRepository
                    .findTop12ByCategoryIdAndActiveIsTrueOrderByCreatedDateDesc(baseCategoryId);
            addProducts(scoredProducts, list, 35);
        }

        // 3) product_category_map 기반 확장 카테고리
        for (Category c : extraCategories) {
            if (!Objects.equals(c.getId(), baseCategoryId)) {
                List<Product> list = productRepository
                        .findTop12ByCategory_CodeAndActiveIsTrueOrderByCreatedDateDesc(c.getCode());
                addProducts(scoredProducts, list, 25);
            }
        }

        // 4) 인기 상품 기반 추천 (위시리스트 많은 순)
        List<Product> popular = productRepository.findPopularProductsTop20(PageRequest.of(0, 20));
        addProducts(scoredProducts, popular, 15);

        // 5) 추천 부족 시 fallback
        List<Product> fallback = productRepository.findTop20ByActiveIsTrueOrderByCreatedDateDesc();
        addProducts(scoredProducts, fallback, 5);

        // base product 제거
        scoredProducts.remove(base.getId());

        // 점수 기준 정렬 후 15개 제한
        List<Product> finalList = scoredProducts.values().stream()
                .sorted(Comparator.comparingInt(ScoredProduct::score).reversed())
                .limit(15)
                .map(ScoredProduct::product)
                .collect(Collectors.toList());

        // 추천 데이터가 없으면 "추천 없음" 메시지 반환
        if (finalList.isEmpty()) {
            return new RecommendResponse(Collections.emptyList(),
                    "아직 충분한 데이터를 찾지 못했어요. 곧 더 다양한 상품을 추천해드릴게요!");
        }

        // AI 메시지 생성 개선
        String aiMessage = aiMessageService.generateContextualMessage(base, baseSub, finalList);

        return RecommendResponse.from(finalList, aiMessage, imageRepository);
    }

    /** 내부 점수용 구조체 */
    private record ScoredProduct(Product product, int score) { }

    /** 추천 제품 merge + 점수 누적 */
    private void addProducts(Map<Long, ScoredProduct> map, List<Product> products, int score) {
        for (Product p : products) {
            map.compute(p.getId(), (id, old) -> {
                if (old == null) return new ScoredProduct(p, score);
                return new ScoredProduct(p, old.score() + score);
            });
        }
    }
}