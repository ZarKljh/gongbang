package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.domain.personal.dto.response.RecommendResponse;
import com.gobang.gobang.domain.personal.entity.WishList;
import com.gobang.gobang.domain.personal.repository.WishListRepository;
import com.gobang.gobang.domain.product.category.repository.CategoryRepository;
import com.gobang.gobang.domain.product.entity.Category;
import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.domain.product.productList.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendService {

    private final WishListRepository wishListRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final AiMessageService aiMessageService;
    private final ImageRepository imageRepository;
    private final SiteUserService siteUserService;

    public RecommendResponse getWishlistRecommend(Long userId) {

        LocalDateTime monthAgo = LocalDateTime.now().minusMonths(1);

        SiteUser user = siteUserService.getCurrentUser();
        List<WishList> wishInMonth =
                wishListRepository.findBySiteUserAndCreatedAtAfter(user, monthAgo);

        if (wishInMonth.isEmpty()) {
            return new RecommendResponse(Collections.emptyList(),
                    "최근 좋아요 기록이 없어 기본 상품을 추천드려요.");
        }

        // 1) 카테고리 빈도 계산
        Map<Long, Long> categoryCounts = wishInMonth.stream()
                .collect(Collectors.groupingBy(
                        w -> w.getProduct().getCategoryId(),
                        Collectors.counting()
                ));

        // 2) 상위 3개 카테고리
        List<Long> topCategories = categoryCounts.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(3)
                .map(Map.Entry::getKey)
                .toList();

        // 3) 카테고리 이름 조회
        List<String> categoryNames = categoryRepository.findAllById(topCategories)
                .stream()
                .map(Category::getName)
                .toList();

        // 4) 추천 상품 조회 (⇒ 여기 수정됨)
        List<Product> candidates =
                productRepository.findRecommendProducts(topCategories, PageRequest.of(0, 30));

        if (candidates.isEmpty()) {
            return new RecommendResponse(Collections.emptyList(),
                    "선호 카테고리에 해당하는 상품이 아직 없습니다.");
        }

        // 5) 상품 ID 리스트
        List<Long> productIds = candidates.stream()
                .map(Product::getId)
                .toList();

        // 6) 이미지 맵 생성 (productId → fileName)
        Map<Long, String> imageMap = imageRepository
                .findFirstImagesByProductIds(productIds)
                .stream()
                .collect(Collectors.toMap(
                        row -> ((Number) row[0]).longValue(),
                        row -> (String) row[1],
                        (a, b) -> a
                ));

        // 7) AI 문구 생성 (자동 캐싱 + 실패 시 기본 문구)
        String aiMessage = aiMessageService.generateCategoryRecommendMessage(userId, categoryNames);

        // 8) 최종 Response 변환
        return RecommendResponse.from(candidates, aiMessage, imageMap);
    }
}