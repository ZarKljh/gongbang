package com.gobang.gobang.domain.seller.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.auth.repository.StudioRepository;
import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.domain.personal.repository.FollowRepository;
import com.gobang.gobang.domain.product.category.repository.CategoryRepository;
import com.gobang.gobang.domain.product.category.repository.SubCategoryRepository;
import com.gobang.gobang.domain.product.common.ProductStatus;
import com.gobang.gobang.domain.product.dto.ProductDto;
import com.gobang.gobang.domain.product.entity.Category;
import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.domain.product.entity.Subcategory;
import com.gobang.gobang.domain.seller.dto.*;
import com.gobang.gobang.domain.seller.model.StudioStatus;
import com.gobang.gobang.domain.seller.repository.ProductOfStudioRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudioService {

    private final StudioRepository studioRepository;
    private final ProductOfStudioRepository productRepository;
    private final ImageRepository imageRepository;
    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final ProductOfStudioRepository productOfStudioRepository;
    private final FollowRepository followRepository;

    public Page<ProductDto> getProductListByStudioId(Long studioId, Pageable pageable) {
        Page<Product> productPage = productRepository.findByStudioId(studioId, pageable);
        return productPage.map(ProductDto::fromEntity);
    }

    public Page<ProductListOfStudioResponse> getProductListByStudioIdWithFilter(
            Long studioId,
            ProductFilterRequest filter,
            Pageable pageable
    ){
        List<Product> allProducts = productRepository.findByStudioId(studioId);

        List<Product> filtered = allProducts.stream()
                .filter(p -> matchesKeyword(p, filter))       // 상품명 검색
                .filter(p -> matchesCategory(p, filter))      // 카테고리 / 서브카테고리
                .filter(p -> matchesPrice(p, filter))         // 가격 필터
                .filter(p -> matchesActive(p, filter))        // 판매 활성
                .filter(p -> matchesStock(p, filter))         // 재고 여부
                .filter(p -> matchesStatus(p, filter))        // 상태 필터
                .sorted((p1, p2) -> Long.compare(p2.getId(), p1.getId()))
                .toList();

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());

        List<Product> pagedList = (start > filtered.size()) ?
                List.of() : filtered.subList(start, end);

        List<ProductDto> dtoList = pagedList.stream()
                .map(ProductDto::fromEntity)
                .toList();

        Set<Long> categoryIds = dtoList.stream()
                .map(ProductDto::getCategoryId)
                .collect(Collectors.toSet());

        Set<Long> subcategoryIds = dtoList.stream()
                .map(ProductDto::getSubcategoryId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, String> categoryNameMap = categoryRepository.findAllById(categoryIds)
                .stream()
                .collect(Collectors.toMap(Category::getId, Category::getName));

        Map<Long, String> subcategoryNameMap = subCategoryRepository.findAllById(subcategoryIds)
                .stream()
                .collect(Collectors.toMap(Subcategory::getId, Subcategory::getName));

        List<ProductListOfStudioResponse> finalResponse = dtoList.stream()
                .map(dto -> ProductListOfStudioResponse.from(
                        dto,
                        categoryNameMap.get(dto.getCategoryId()),
                        subcategoryNameMap.get(dto.getSubcategoryId())
                ))
                .toList();

        return new PageImpl<>(finalResponse, pageable, filtered.size());
    }

    public Page<ProductListOfStudioResponse> getProductListByStudioIdWithCategory(Long studioId, String keyword, Pageable pageable) {

        Page<Product> product;
        Page<ProductDto> productPage;
        //Page<ProductDto> productPage = getProductListByStudioId(studioId, pageable);
        if (keyword != null && !keyword.trim().isEmpty()) {
            // 검색
            product = productRepository
                    .findByStudioIdAndNameContaining(studioId, keyword, pageable);
        } else {
            // 검색어 없으면 전체 조회
            product = productRepository.findByStudioId(studioId, pageable);

        }
        productPage = product.map(ProductDto::fromEntity);
        Set<Long> categoryIds = productPage.getContent().stream()
                .map(ProductDto::getCategoryId)
                .collect(Collectors.toSet());

        Set<Long> subcategoryIds = productPage.getContent().stream()
                .map(ProductDto::getSubcategoryId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, String> categoryNameMap = buildNameMap(
                categoryIds,
                ids -> categoryRepository.findAllById(ids),
                Category::getId,
                Category::getName
        );

        Map<Long, String> subcategoryNameMap = buildNameMap(
                subcategoryIds,
                ids -> subCategoryRepository.findAllById(ids),
                Subcategory::getId,
                Subcategory::getName
        );

            return productPage.map(dto -> ProductListOfStudioResponse.from(
                    dto,
                    categoryNameMap.get(dto.getCategoryId()),
                    subcategoryNameMap.get(dto.getSubcategoryId())
            ));
    }

    private <T, ID> Map<ID, String> buildNameMap(
            Set<ID> ids,
            Function<Iterable<ID>, List<T>> finder,
            Function<T, ID> idExtractor,
            Function<T, String> nameExtractor
    ) {
        if (ids == null || ids.isEmpty()) return Map.of();

        List<T> list = finder.apply(ids);

        return list.stream().collect(
                Collectors.toMap(idExtractor, nameExtractor)
        );
    }

    @Transactional
    public void createStudio(Studio newStudio) {
        System.out.println("공방정보가 서비스로 넘어왔습니다");
        Studio savedNewStudio = studioRepository.save(newStudio);
        System.out.println("공방이 리포지토리에 들어갔습니다");
        /*
        for (Image image : studioImages) {
            image.setRefId(savedNewStudio.getStudioId()); // Studio 저장 후 ID 할당
            imageRepository.save(image);
        }
        */
    }

    public Studio getStudioBySiteUser(SiteUser siteUser) {
        Optional<Studio> os = studioRepository.findBySiteUser(siteUser);
        if (os.isPresent()) {
            return os.get();
        } else {
            return null;
        }
    }

    public Studio getStudioById(Long id) {
        Optional<Studio> os = studioRepository.findByStudioId(id);
        if (os.isPresent()) {
            return os.get();
        } else {
            return null;
        }
    }

    public Studio AddStudio(SiteUser seller, @Valid StudioAddRequest studioAddRequest) {


        Studio newStudio = Studio.builder()
                .siteUser(seller)
                .categoryId(Long.parseLong(studioAddRequest.getCategoryId()))
                .studioName(studioAddRequest.getStudioName())
                .studioDescription(studioAddRequest.getStudioDescription())
                .studioMobile(studioAddRequest.getStudioMobile())
                .studioOfficeTell(studioAddRequest.getStudioOfficeTell())
                .status(StudioStatus.PENDING)
                .studioFax(studioAddRequest.getStudioFax())
                .studioEmail(studioAddRequest.getStudioEmail())
                .studioBusinessNumber(studioAddRequest.getStudioBusinessNumber())
                .studioAddPostNumber(studioAddRequest.getStudioAddPostNumber())
                .studioAddMain(studioAddRequest.getStudioAddMain())
                .studioAddDetail(studioAddRequest.getStudioAddDetail())
                .createdDate(LocalDateTime.now())
                .updatedDate(LocalDateTime.now())
                .build();

        studioRepository.save(newStudio);
        System.out.println("공방이 저장되었습니다");
        return newStudio;
        //return RsData.of("S-2", "신규공방이 등록되었습니다", newStudio);
    }

    public Image getMainImage(Long studioId) {
        Optional<Image> osmi = imageRepository.findByRefIdAndRefType(studioId, Image.RefType.STUDIO_MAIN);
        if (osmi.isPresent()) {
            return osmi.get();
        } else {
            return null;
        }
    }

    public Image getLogoImage(Long studioId) {
        Optional<Image> osli = imageRepository.findByRefIdAndRefType(studioId, Image.RefType.STUDIO_LOGO);
        if (osli.isPresent()) {
            return osli.get();
        } else {
            return null;
        }
    }

    public List<Image> getStudioImages(Long studioId) {
        return imageRepository.findALLByRefIdAndRefType(studioId, Image.RefType.STUDIO);
    }

    public Image getProductMainImage(Long productId) {
        Optional<Image> osli = imageRepository.findByRefIdAndRefType(productId, Image.RefType.PRODUCT);
        if (osli.isPresent()) {
            return osli.get();
        } else {
            return null;
        }
    }

    public Studio modifyStudio(StudioAddRequest studioAddRequest, Studio studio, SiteUser seller) {

        studio.setCategoryId(Long.parseLong(studioAddRequest.getCategoryId()));
        studio.setStudioName(studioAddRequest.getStudioName());
        studio.setStudioDescription(studioAddRequest.getStudioDescription());
        studio.setStudioMobile(studioAddRequest.getStudioMobile());
        studio.setStudioOfficeTell(studioAddRequest.getStudioOfficeTell());
        studio.setStudioFax(studioAddRequest.getStudioFax());
        studio.setStudioEmail(studioAddRequest.getStudioEmail());
        studio.setStudioBusinessNumber(studioAddRequest.getStudioBusinessNumber());

        studioRepository.save(studio);

        return studio;
    }

    /** 상품명 검색 (keyword) */
    private boolean matchesKeyword(Product p, ProductFilterRequest filter) {
        if (filter.getKeyword() == null || filter.getKeyword().isBlank()) return true;
        return p.getName().toLowerCase().contains(filter.getKeyword().toLowerCase());
    }

    /** 카테고리 / 서브카테고리 필터 */
    private boolean matchesCategory(Product p, ProductFilterRequest filter) {
        if (filter.getCategoryId() != null) {
            if (!p.getCategoryId().equals(filter.getCategoryId())) {
                return false;
            }
        }

        // 서브카테고리 필터
        if (filter.getSubcategoryId() != null) {
            if (p.getSubcategory() == null) return false;
            if (!p.getSubcategory().getId().equals(filter.getSubcategoryId())) {
                return false;
            }
        }

        return true;
    }

    /** 가격 필터 */
    private boolean matchesPrice(Product p, ProductFilterRequest filter) {
        int price = p.getBasePrice();

        if (filter.getPriceMin() != null && price < filter.getPriceMin()) return false;
        if (filter.getPriceMax() != null && price > filter.getPriceMax()) return false;

        return true;
    }

    /** 판매 활성 필터 */
    private boolean matchesActive(Product p, ProductFilterRequest filter) {
        if (filter.getActive() == null || filter.getActive().isEmpty()) return true;

        if (filter.getActive().contains("on") && p.getActive()) return true;
        if (filter.getActive().contains("off") && !p.getActive()) return true;

        return false;
    }

    /** 재고 여부 필터 */
    private boolean matchesStock(Product p, ProductFilterRequest filter) {
        if (filter.getStock() == null || filter.getStock().isEmpty()) return true;

        boolean inStock = p.getStockQuantity() > 0;

        if (filter.getStock().contains("inStock") && inStock) return true;
        if (filter.getStock().contains("outOfStock") && !inStock) return true;

        return false;
    }

    /** 상품 상태 필터 */
    private boolean matchesStatus(Product p, ProductFilterRequest filter) {
        if (filter.getStatus() == null || filter.getStatus().isEmpty()) return true;

        return filter.getStatus().contains(p.getStatus());
    }

    public CategoryTreeResponse getCategorySummary(Long studioId) {

        List<Product> products = productRepository.findByStudioId(studioId);

        // 카테고리 → 서브카테고리 맵핑을 위한 Map
        Map<Long, Set<Subcategory>> subMap = new HashMap<>();

        for (Product p : products) {
            Long categoryId = p.getCategoryId();

            // Subcategory 등록
            if (p.getSubcategory() != null) {
                subMap
                        .computeIfAbsent(categoryId, k -> new HashSet<>())
                        .add(p.getSubcategory());
            } else {
                subMap
                        .computeIfAbsent(categoryId, k -> new HashSet<>());
            }
        }

        // DB에서 카테고리 목록 조회
        List<Category> categories = categoryRepository.findAllById(subMap.keySet());

        // 응답 생성
        List<CategoryTreeResponse.CategoryNode> nodes = categories.stream()
                .map(cat -> new CategoryTreeResponse.CategoryNode(
                        cat.getId(),
                        cat.getName(),
                        subMap.get(cat.getId())
                                .stream()
                                .map(sub -> new CategoryTreeResponse.SubcategoryNode(sub.getId(), sub.getName()))
                                .sorted(Comparator.comparing(CategoryTreeResponse.SubcategoryNode::getName))
                                .toList()
                ))
                .sorted(Comparator.comparing(CategoryTreeResponse.CategoryNode::getName))
                .toList();

        return new CategoryTreeResponse(nodes);
    }

    public List<GlobalCategoryDto> getAllCategories() {
        List<Category> categoryList = categoryRepository.findAll();
        /*
        List<GlobalCategoryDto> gc = new ArrayList<>();

        for(Category category : categoryList) {
            GlobalCategoryDto dto = new GlobalCategoryDto(category);
            gc.add(dto);
        }
        */

        return categoryList.stream()
                .filter(Category::getActive)
                .sorted(Comparator.comparing(Category::getDisplayOrder))
                .map(GlobalCategoryDto::new)
                .toList();
    }

    public List<GlobalSubcategoryDto> getAllSubcategories() {
        List<Subcategory> subcatoryList = subCategoryRepository.findAll();

        return subcatoryList.stream()
                .filter(Subcategory::getActive)
                .sorted(Comparator.comparing(Subcategory::getDisplayOrder))
                .map(GlobalSubcategoryDto::new)
                .toList();
    }

    public Category getCategory(Long categoryId){
        return categoryRepository.findById(categoryId).get();
    }

    public Product productAdd(ProductAddRequest request, Studio studio) {
        Subcategory subcategory = subCategoryRepository.findById(request.getSubcategoryId()).get();

        Product newProduct = Product.builder()
                .studioId(studio.getStudioId())
                .themeId(1L)
                .categoryId(request.getCategoryId())
                .subcategory(subcategory)
                .name(request.getName())
                .slug(request.getSlug())
                .subtitle(request.getSubtitle())
                .basePrice(request.getBasePrice())
                .stockQuantity(request.getStockQuantity())
                .backorderable(request.getBackorderable())
                .status(ProductStatus.DRAFT)
                .active(request.getActive())
                .createdDate(LocalDateTime.now())
                .build();

        Product product = productRepository.save(newProduct);
        return product;
    }
    public Product getDetailProduct(Long productId){
        Product product  = productOfStudioRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다."));

        return product;
    }

    public Product modifyProduct(ProductModifyRequest request, Product product) {

        Subcategory subcategory = subCategoryRepository.findById(request.getSubcategoryId()).get();

        product.setCategoryId(request.getCategoryId());
        product.setSubcategory(subcategory);
        product.setName(request.getName());
        product.setSubtitle(request.getSubtitle());
        product.setBasePrice(request.getBasePrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setBackorderable(request.getBackorderable());
        product.setStatus(ProductStatus.valueOf(request.getStatus()));
        product.setActive(request.getActive());

        Product modifiedProduct = productRepository.save(product);

        return modifiedProduct;
    }

    public int getFollowerCount(Long studioId) {
        Studio studio = studioRepository.findById(studioId)
                .orElseThrow(() -> new RuntimeException("Studio not found"));

        System.out.println("실제 매핑되는 Studio.id = " + studio.getStudioId());

        long count = followRepository.countByStudio(studio);
        System.out.println("팔로워 수 = " + count);

        return (int) count;


        //return (int) followRepository.countByStudio(studio);
        //return followRepository.countByStudioStudioId(studioId);
    }

    /**
     * 🔥 단건 삭제 (공통 삭제로직)
     */
    public void deleteProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다. id=" + productId));

        // 필요 시: 삭제 권한 검증 / 상태 변경 / 이미지 삭제 등 추가 가능
        productRepository.delete(product);
    }

    public int deleteProducts(List<Long> productIds) {
        int count = 0;

        for(Long id : productIds) {
            deleteProductById(id);
            count++;
        }
        return count;
    }
}