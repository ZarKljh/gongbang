package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.domain.personal.dto.response.RecommendResponse;
import com.gobang.gobang.domain.personal.entity.WishList;
import com.gobang.gobang.domain.personal.repository.WishListRepository;
import com.gobang.gobang.domain.product.category.repository.CategoryRepository;
import com.gobang.gobang.domain.product.entity.Category;
import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.domain.product.productList.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
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

    public RecommendResponse getWishlistRecommend(Long userId) {

        LocalDateTime monthAgo = LocalDateTime.now().minusMonths(1);

        List<WishList> wishInMonth =
                wishListRepository.findBySiteUser_IdAndCreatedAtAfter(userId, monthAgo);

        if (wishInMonth.isEmpty()) {
            return new RecommendResponse(Collections.emptyList(), "최근 좋아요 기록이 없어 기본 상품을 추천드려요.");
        }

        // 카테고리 빈도 계산
        Map<Long, Long> categoryCounts = wishInMonth.stream()
                .collect(Collectors.groupingBy(
                        w -> w.getProduct().getCategoryId(),
                        Collectors.counting()
                ));

        // 상위 3개 카테고리 ID
        List<Long> topCategories = categoryCounts.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(3)
                .map(Map.Entry::getKey)
                .toList();

        // 카테고리 ID → 이름 변환
        List<String> categoryNames = categoryRepository.findAllById(topCategories).stream()
                .map(Category::getName)
                .toList();

        // 상품 후보 조회
        List<Product> candidates =
                productRepository.findTop30ByCategoryIdInAndActiveIsTrueOrderByCreatedDateDesc(topCategories);

        if (candidates.isEmpty()) {
            return new RecommendResponse(Collections.emptyList(),
                    "선호 카테고리에 해당하는 상품이 아직 없습니다.");
        }

        // AI 문구 생성 (ID가 아니라 이름을 넘김)
        String aiMessage = aiMessageService.generateCategoryRecommendMessage(categoryNames);

        return RecommendResponse.from(candidates, aiMessage, imageRepository);
    }
}