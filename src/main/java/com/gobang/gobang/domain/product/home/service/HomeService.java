package com.gobang.gobang.domain.product.home.service;

import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.auth.repository.StudioRepository;
import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.domain.personal.repository.FollowRepository;
import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.domain.product.home.dto.response.TopStudioResponse;
import com.gobang.gobang.domain.product.productList.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HomeService {

    private final FollowRepository followRepository;
    private final StudioRepository studioRepository;
    private final ProductRepository productRepository;
    private final ImageRepository imageRepository;

    public List<TopStudioResponse> getTopStudios(int hours) {

        LocalDateTime from = LocalDateTime.now().minusHours(hours);

        // 1) 최근 팔로우 기준 TOP 5 공방 ID
        List<Long> studioIds = followRepository.findTopStudiosByRecentFollows(from)
                .stream()
                .limit(5)
                .toList();

        return studioIds.stream()
                .map(studioId -> {
                    Studio studio = studioRepository.findById(studioId).orElse(null);
                    if (studio == null) return null;

                    int followerCount = followRepository.countByStudioStudioId(studio.getStudioId());

                    // 공방 대표 이미지 (STUDIO_MAIN)
                    String mainImageUrl = imageRepository
                            .findTopByRefTypeAndRefIdOrderBySortOrderAsc(Image.RefType.STUDIO_LOGO, studioId)
                            .map(img -> "/images/" + img.getImageFileName())
                            .orElse(null);

                    // 최신 상품 3개
                    List<Product> recentProducts = productRepository
                            .findTop3ByStudioIdOrderByCreatedDateDesc(studioId);

                    // 상품 리스트 DTO 변환
                    List<TopStudioResponse.ProductDto> productDtos = recentProducts.stream()
                            .map(p -> {

                                // 상품 대표 이미지 조회
                                String thumbUrl = imageRepository
                                        .findTopByRefTypeAndRefIdOrderBySortOrderAsc(Image.RefType.PRODUCT, p.getId())
                                        .map(img -> "/images/products/" + img.getImageFileName())
                                        .orElse(null);

                                return TopStudioResponse.ProductDto.builder()
                                        .productId(p.getId())
                                        .productName(p.getName())
                                        .summary(p.getSummary())
                                        .imageUrl(thumbUrl)
                                        .price(p.getBasePrice())
                                        .build();
                            })
                            .collect(Collectors.toList());

                    return TopStudioResponse.builder()
                            .studioId(studio.getStudioId())
                            .studioName(studio.getStudioName())
                            .mainImageUrl(mainImageUrl)
                            .followerCount(followerCount)
                            .recentProducts(productDtos)
                            .build();
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }
}