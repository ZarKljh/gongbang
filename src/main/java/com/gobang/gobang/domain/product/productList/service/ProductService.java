package com.gobang.gobang.domain.product.productList.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.auth.repository.StudioRepository;
import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.personal.dto.response.SiteUserResponse;
import com.gobang.gobang.domain.personal.entity.Cart;
import com.gobang.gobang.domain.personal.entity.Follow;
import com.gobang.gobang.domain.personal.entity.WishList;
import com.gobang.gobang.domain.personal.repository.CartRepository;
import com.gobang.gobang.domain.personal.repository.WishListRepository;
import com.gobang.gobang.domain.product.common.ProductStatus;
import com.gobang.gobang.domain.product.dto.ProductDto;
import com.gobang.gobang.domain.product.dto.ProductImageDto;
import com.gobang.gobang.domain.product.dto.ReviewRatingDto;
import com.gobang.gobang.domain.product.dto.StudioDto;
import com.gobang.gobang.domain.product.dto.response.*;
import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.domain.product.productList.repository.ProductImageRepository;
import com.gobang.gobang.domain.product.productList.repository.ProductRepository;
import com.gobang.gobang.domain.review.repository.ReviewRepository;
import com.gobang.gobang.domain.seller.repository.SellerFollowRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.MultiValueMap;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final ReviewRepository reviewRepository;
    private final WishListRepository wishListRepository;
    private final StudioRepository studioRepository;
    private final SellerFollowRepository sellerFollowRepository;
    private final CartRepository cartRepository;
    private final SiteUserRepository siteUserRepository;

    public List<ProductDto> getProductList(Long subCategoryId, int size) {
        int limit = Math.max(1, Math.min(size, 50));

        List<Product> ProductList = productRepository.findBySubcategoryIdAndStatusOrderByBasePriceAscIdAsc(subCategoryId, PageRequest.of(0, limit), ProductStatus.PUBLISHED);
        if (ProductList.isEmpty()) {
            throw new RuntimeException("상품 목록이 비어있습니다.");
        }
        return ProductList.stream()
                .map(t -> ProductDto.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .subtitle(t.getSubtitle())
                        .summary(t.getSummary())
                        .description(t.getDescription())
                        .basePrice(t.getBasePrice())
                        .stockQuantity(t.getStockQuantity())
                        .slug(t.getSlug())
                        .status(t.getStatus())
                        .active(t.getActive())
                        .categoryId(t.getCategoryId())
                        .themeId(t.getThemeId())
                        .subcategoryId(t.getSubcategory() != null ? t.getSubcategory().getId() : null)
                        .seoTitle(t.getSeoTitle())
                        .seoDescription(t.getSeoDescription())
                        .build()
                )
                .toList();
    }

    public FilterProductResponse getProductFilterList(Long subCategoryId, int size, MultiValueMap<String, String> params, SiteUserResponse currentUser) {
        int limit = Math.max(1, Math.min(size, 50));
//        boolean useColor = colors != null && !colors.isEmpty();

        Integer priceMin = getIntParam(params, "PRICE_MIN");
        Integer priceMax = getIntParam(params, "PRICE_MAX");
        String style = first(params, "STYLE");
        String pkg = first(params, "PACKAGE");
        String color = first(params, "COLOR");
        String design = first(params, "DESIGN");
        String material = first(params, "MATERIAL");
        String scent = first(params, "SCENT");
        String duration = first(params, "DURATION");
        String brightness = first(params, "BRIGHTNESS");
        String colorTemp = first(params, "COLOR_TEMP");
        String restType = first(params, "REST_TYPE");
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Order.asc("basePrice"), Sort.Order.asc("id")));
        List<Product> list = productRepository.searchByFilters(
                subCategoryId, priceMin, priceMax, style, pkg, color, design, material, scent,
                duration, brightness, colorTemp, restType, pageable
        );
        List<ProductDto> productDtoList = list.stream()
                .map(ProductDto::new)   // ✅ Product → ProductDto 생성자 변환
                .toList();

        // ids 뽑기
        List<Long> ids = list.stream().map(Product::getId).toList();

        // ids로 이미지/속성 벌크 조회 → 그룹핑
        List<Image> imageRows = productImageRepository.findAllByRefIdInOrderBySort(ids);

        Map<Long, List<ProductImageDto>> imageMap =
                imageRows.stream()
                        .map(ProductImageDto::new) // ✅ 먼저 엔티티 → DTO 변환
                        .collect(Collectors.groupingBy(
                                ProductImageDto::getRefId,     // 상품(refId) 기준 그룹핑
                                LinkedHashMap::new,            // 순서 유지
                                Collectors.toList()            // DTO 리스트 수집
                        ));


        //ids로 상품 여러 개에 대한 별점 평균/개수 한번에 조회
        List<ReviewRatingDto> ratingRows = reviewRepository.findRatingStatsByProductIds(ids);

        Map<Long, ReviewRatingDto> ratingMap =
                ratingRows.stream()
                        .collect(Collectors.toMap(
                                ReviewRatingDto::getProductId, // key
                                dto -> dto,                    // value
                                (a, b) -> a,                   // 중복 키 있을 때 첫 번째 유지
                                LinkedHashMap::new
                        ));

        //likedMap 초기화
        Map<Long, Boolean> likedMap = new HashMap<>();

        //ids로 상품 여러 개에 대한 유저에대한 좋아요 여부 && 로그인한 경우에만 좋아요 여부 조회
        if (currentUser != null) {
            List<Long> likedIds = wishListRepository.findLikedProductIds(currentUser.getId(), ids);

            // 2) Map<productId, true>
            likedMap = likedIds.stream()
                    .collect(Collectors.toMap(
                            id -> id,
                            id -> true,
                            (a, b) -> a,
                            LinkedHashMap::new
                    ));
        }

        return FilterProductResponse.builder()
                .productFilterList(productDtoList)
                .imageMapList(imageMap)
                .reviewMapList(ratingMap)
                .likedMap(likedMap)
                .build();
    }


    public ProductDetailResponse getProductDetail(Long productId, Long userId) {

        // 1) 상품 조회
        Product productDetail = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("상품을 찾을 수 없습니다. id=" + productId));

        Long studioId = productDetail.getStudioId();

        // 2) 이미지 & 공방 조회 (유저랑 상관없는 애들)
        Image pdImage = productImageRepository
                .findFirstByRefIdAndRefTypeOrderBySortOrderAsc(productId, Image.RefType.PRODUCT)
                .orElse(null);

        Studio studio = studioRepository.findById(studioId)
                .orElse(null);

        Image gbImage = productImageRepository
                .findFirstByRefIdAndRefTypeOrderBySortOrderAsc(studioId, Image.RefType.STUDIO_LOGO)
                .orElse(null);

        // 3) 팔로워, 좋아요 수는 로그인 여부와 상관 없음
        long followerCount = sellerFollowRepository.countByStudio_StudioId(studioId);
        long likeCount = wishListRepository.countByProduct(productDetail);


        // ====== 💡 로그인 여부에 따라 분기 ======
        boolean followed = false;
        boolean isInCart = false;
        boolean liked = false;

        SiteUser siteUser = null;

        if (userId != null) {
            // 👉 여기서만 userId로 조회
            siteUser = siteUserRepository.findById(userId).orElse(null);

            // 팔로우 여부
            Optional<Follow> existingFollow =
                    sellerFollowRepository.findByStudio_StudioIdAndSiteUser_Id(studioId, userId);
            followed = existingFollow.isPresent();

            // 카트 여부 (siteUser가 null 아닐 때만)
            if (siteUser != null) {
                Optional<Cart> existingCart =
                        cartRepository.findBySiteUserAndProduct(siteUser, productDetail);
                isInCart = existingCart.isPresent();
            }

            //좋아요 여부 (siteUser가 null 아닐 때만)
            if (siteUser != null) {
                Optional<WishList> existingLike =
                        wishListRepository.findBySiteUserAndProduct(siteUser, productDetail);
                liked = existingLike.isPresent();
            }
        }
        // ====================================

        SellerFollowResponse followInfo = new SellerFollowResponse(followed, followerCount);
        ProductCartResponse cartInfo = new ProductCartResponse(isInCart);
        ProductLikeResponse productLikeInfo = new ProductLikeResponse(productId, liked, likeCount);

        // 4) DTO 변환
        ProductDto productDto = new ProductDto(productDetail);

        ProductImageDto pdImageDto = (pdImage != null) ? new ProductImageDto(pdImage) : null;

        StudioDto studioDto = (studio != null) ? StudioDto.fromEntity(studio) : null;

        Image gbImageEntity = (gbImage != null) ? gbImage : null;

        return new ProductDetailResponse(productDto, pdImageDto, studioDto, gbImageEntity, followInfo, cartInfo, productLikeInfo);
    }


    //필터 파라미터용 유틸코드
    private static String first(MultiValueMap<String, String> p, String key) {
        String v = p.getFirst(key);
        return (v == null || v.isBlank()) ? null : v.trim();
    }

    private Integer getIntParam(MultiValueMap<String, String> params, String key) {
        String value = params.getFirst(key);   // MultiValueMap에서 첫 번째 값 가져오기
        if (value == null || value.isBlank()) return null;

        try {
            return Integer.parseInt(value.trim());  // 문자열 → Integer 변환
        } catch (NumberFormatException e) {
            System.out.printf("⚠️ 잘못된 숫자 파라미터: %s = %s%n", key, value);
            return null;
        }
    }
}
