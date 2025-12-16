package com.gobang.gobang.domain.seller.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gobang.gobang.domain.auth.entity.RoleType;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.image.service.ProfileImageService;
import com.gobang.gobang.domain.product.dto.ProductDto;
import com.gobang.gobang.domain.product.entity.Category;
import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.domain.product.entity.Subcategory;
import com.gobang.gobang.domain.seller.dto.*;
import com.gobang.gobang.domain.seller.service.StudioService;
import com.gobang.gobang.global.RsData.RsData;
import com.gobang.gobang.global.rq.Rq;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping(value = "/api/v1/studio")
@RequiredArgsConstructor
public class StudioController {
    private final SiteUserService siteUserService;
    private final StudioService studioService;
    private final Rq rq;
    private final ProfileImageService profileImageService;


    @GetMapping("/{id}")
    public RsData<Map<String, Object>> getStudioAndStuidioList(@PathVariable("id") Long id){
        Studio studio = studioService.getStudioById(id);
        SiteUser seller = siteUserService.getSiteUserByUserName(studio.getSiteUser().getUserName());
        Image studioMainImage = studioService.getMainImage(studio.getStudioId());
        Image studioLogoImage = new Image();
        List<Image> studioImages = studioService.getStudioImages(studio.getStudioId());;

        List<StudioSimpleDto> studioList = new ArrayList<>();
        for (Studio s : seller.getStudioList()) {
            studioLogoImage = studioService.getLogoImage(s.getStudioId());
            studioList.add(new StudioSimpleDto(s.getStudioId(), s.getStudioName(), studioLogoImage));
            System.out.println("공방ID : " + s.getStudioId());
            System.out.println("공방이름 : " + s.getStudioName());
        }
        studioLogoImage = studioService.getLogoImage(studio.getStudioId());
        StudioResponse studioResponse = new StudioResponse(seller, studio, studioMainImage, studioLogoImage, studioImages);

        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("studio", studioResponse);
        responseMap.put("studioList", studioList);

        return  RsData.of("s-1", "해당공방의 정보와 seller 의 정보를 가져왔습니다", responseMap);
    }

    @GetMapping("/{id}/products")
    public RsData<Page<ProductListOfStudioPageResponse>> getProductList(
            @PathVariable("id") Long studioId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ){
        //List<ProductDto> productList = studioService.getProductList(subCategoryId, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<ProductDto> productPage = studioService.getProductListByStudioId(studioId, pageable);

        Page<ProductListOfStudioPageResponse> responsePage = productPage.map(productDto -> {
            // 각 상품의 ID를 이용해 메인 이미지를 조회합니다.
            // (조회 메서드 명칭은 studioService의 실제 메서드명으로 확인해주세요)
            Image productImage = studioService.getProductMainImage(productDto.getId());

            // ProductDto + Image -> ProductListOfStudioPageResponse 변환
            return ProductListOfStudioPageResponse.of(productDto, productImage);
        });

        return RsData.of("s-1", "해당공방의 상품리스트를 가져왔습니다", responsePage);
    }

    @GetMapping("/{id}/studio-products")
    public RsData<Page<ProductListOfStudioResponse>> getProductListWithCategory(
            @PathVariable("id") Long studioId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer priceMin,
            @RequestParam(required = false) Integer priceMax,
            @RequestParam(required = false) String active,
            @RequestParam(required = false) String stock,
            @RequestParam(required = false) String status

    ){

        System.out.println("🔥 전달된 stock 파라미터 = " + stock);
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        List<String> activeList = convertToList(active);
        List<String> stockList = convertToList(stock);
        List<String> statusList = convertToList(status);

        ProductFilterRequest filterRequest = new ProductFilterRequest(
                keyword, parseCategoryId(category), parseSubcategoryId(category), priceMin, priceMax, activeList, stockList, statusList);

        Page<ProductListOfStudioResponse> productPage = studioService.getProductListByStudioIdWithFilter(studioId, filterRequest, pageable);
        //Page<ProductListOfStudioResponse> productPage = studioService.getProductListByStudioIdWithCategory(studioId, keyword, pageable);
        return RsData.of("s-1", "해당공방의 상품리스트를 가져왔습니다", productPage);
    }

    @GetMapping("/{studioId}/followers/count")
    public RsData<Integer> getFollowerCount(@PathVariable("studioId") Long studioId) {
        System.out.println("공방 팔러워수 조회를 위한 아이디값: " + studioId);
        //System.out.println("팔로우수 : " + count);
        return RsData.of("200", "팔로워 수 조회 성공", studioService.getFollowerCount(studioId));
    }

    @GetMapping("/{id}/category-summary")
    public RsData<CategoryTreeResponse> getCategorySummary(@PathVariable("id") Long studioId) {

        CategoryTreeResponse response = studioService.getCategorySummary(studioId);

        return RsData.of("s-1", "카테고리 요약을 조회했습니다.", response);
    }

    //공방정보 수정
    //studioId로 공방검색
    @PatchMapping("/{id}")
    public RsData<StudioResponse> studioModify(
            @RequestPart("request") @Valid StudioAddRequest studioAddRequest,
            @PathVariable("id") Long studioId,
            @RequestPart(value = "studioMainImage", required = false) MultipartFile studioMainImage,
            @RequestPart(value = "studioLogoImage", required = false) MultipartFile studioLogoImage,
            @RequestPart(value = "studioGalleryImages", required = false) List<MultipartFile> studioGalleryImages,
            @RequestPart(value = "deletedGalleryImageIds", required = false) String deletedGalleryImageIdsJson
            ){

        List<Long> deletedGalleryIds = new ArrayList<>();

        if (deletedGalleryImageIdsJson != null && !deletedGalleryImageIdsJson.isBlank()) {
            try {
                deletedGalleryIds = new ObjectMapper()
                        .readValue(deletedGalleryImageIdsJson, new TypeReference<List<Long>>() {});
            } catch (Exception e) {
                throw new RuntimeException("JSON 파싱 실패: " + deletedGalleryImageIdsJson, e);
            }
        }

        Studio studio = studioService.getStudioById(studioId);
        if(studio == null){
            throw new IllegalArgumentException("해당 공방의 정보를 찾을 수 없습니다.");
        }

        SiteUser siteUser = siteUserService.getSiteUserById(studio.getSiteUser().getId());
        studio = studioService.modifyStudio(studioAddRequest, studio, siteUser);

        if(studioMainImage != null && !studioMainImage.isEmpty()){
            profileImageService.replaceStudioImage(studio.getStudioId(), studioMainImage, Image.RefType.STUDIO_MAIN, 0);
        }

        if(studioLogoImage != null && !studioLogoImage.isEmpty()){
            profileImageService.replaceStudioImage(studio.getStudioId(), studioLogoImage, Image.RefType.STUDIO_LOGO, 0);
        }
        System.out.println("삭제대상 이미지 아이디");
        for(Long i : deletedGalleryIds){
            System.out.println("삭제대상 이미지 아이디: " + i);
        }

        profileImageService.replaceStudioGalleryImages(studio.getStudioId(), studioGalleryImages, deletedGalleryIds);

        StudioResponse studioResponse = new StudioResponse(siteUser, studio);
        return  RsData.of("200", studio.getStudioName()+"의 공방정보가 수정되었습니다", studioResponse);
    }
    /*신규공방등록*/
    @PostMapping("/add")
    public RsData<Map<String, Object>> studioAdd(
            @RequestPart("request") @Valid StudioAddRequest studioAddRequest,
            @RequestPart(value = "studioMainImage", required = false) MultipartFile studioMainImage,
            @RequestPart(value = "studioLogoImage", required = false) MultipartFile studioLogoImage,
            @RequestPart(value = "studioGalleryImages", required = false) List<MultipartFile> studioGalleryImages
        ){

        SiteUser seller = rq.getSiteUser();

        if(seller == null){
            throw new IllegalArgumentException("판매자로그인 혹은 회원가입을 해주세요.");
        } else if( seller.getRole() != RoleType.SELLER){
            throw new IllegalArgumentException("판매자 전용 기능입니다. 판매자로 로그인해주세요.");
        }

        Studio newStudio = studioService.AddStudio(seller, studioAddRequest);
        Long studioId = newStudio.getStudioId();

        if (studioMainImage != null && !studioMainImage.isEmpty()) {
            profileImageService.uploadStudioImage(
                    studioId,
                    studioMainImage,
                    Image.RefType.STUDIO_MAIN,
                    0
            );
        }

        if (studioLogoImage != null && !studioLogoImage.isEmpty()) {
            profileImageService.uploadStudioImage(
                    studioId,
                    studioLogoImage,
                    Image.RefType.STUDIO_LOGO,
                    0
            );
        }

        if (studioGalleryImages != null && !studioGalleryImages.isEmpty()) {
            for (int i = 0; i < studioGalleryImages.size(); i++) {
                MultipartFile file = studioGalleryImages.get(i);
                profileImageService.uploadStudioImage(
                        studioId,
                        file,
                        Image.RefType.STUDIO,
                        i
                );
            }
        }

        List<StudioSimpleDto> studioList = new ArrayList<>();
        for (Studio s : seller.getStudioList()) {
            studioList.add(new StudioSimpleDto(s.getStudioId(), s.getStudioName(), studioService.getLogoImage(s.getStudioId())));
        }

        StudioResponse studioResponse = new StudioResponse(seller, newStudio);

        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("studio", studioResponse);
        responseMap.put("studioList", studioList);

        return  RsData.of("200", "신규공방이 등록되었습니다", responseMap);
    }

    private List<String> convertToList(String str) {
        if (str == null || str.isBlank()) return List.of();
        return Arrays.stream(str.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    private Long parseCategoryId(String input) {
        if (input == null || input.isBlank()) return null;
        if ( input.startsWith("CAT:")){
            return Long.valueOf(input.substring(4)); // CAT: 뒤의 값만 반환
        }
        return null;
    }

    private Long parseSubcategoryId(String input) {
        if (input == null || input.isBlank()) return null;
        if (input.startsWith("SUB:")) {
            return Long.valueOf(input.substring(4)); // SUB: 뒤의 값만 반환
        }
        return null;
    }

    @GetMapping("/globalCategories")
    public RsData<Map<String, Object>> getGlobalCategories() {

        List<GlobalCategoryDto> categories = studioService.getAllCategories();
        List<GlobalSubcategoryDto> subcategories = studioService.getAllSubcategories();

        Map<String, Object> result = new HashMap<>();
        result.put("categories", categories);
        result.put("subcategories", subcategories);

        return RsData.of(
                "200",
                "전역 카테고리 목록 조회 성공",
                result
        );
    }
    /* 신규상품등록 */
    @PostMapping("/product/new")
    public RsData<ProductAddlResponse> addProduct(
            @RequestPart("request") ProductAddRequest request,
            @RequestPart(value = "productMainImage", required = false) MultipartFile productMainImage,
            @RequestPart(value = "productGalleryImages", required = false) List<MultipartFile> galleryImages
    ){
        SiteUser seller = rq.getSiteUser();
        if(seller == null){
            throw new IllegalArgumentException("판매자로그인 혹은 회원가입을 해주세요.");
        } else if( seller.getRole() != RoleType.SELLER) {
            throw new IllegalArgumentException("판매자 전용 기능입니다. 판매자로 로그인해주세요.");
        }
        Studio studio = studioService.getStudioById(request.getStudioId());
        if(studio == null){
            throw new IllegalArgumentException("요청하신 공방을 찾을 수 없습니다. 다시 확인해주세요.");
        } else if( seller.getRole() != RoleType.SELLER) {
            throw new IllegalArgumentException("판매자 전용 기능입니다. 판매자로 로그인해주세요.");
        }

        Product newProduct = studioService.productAdd(request, studio);

        if( productMainImage != null && !productMainImage.isEmpty()) {
            profileImageService.uploadProductImage(
                    newProduct.getId(),
                    productMainImage,
                    Image.RefType.PRODUCT,
                    0
            );
        }
        return RsData.of("200","신규상품이 등록되었습니다", new ProductAddlResponse(newProduct));

    }

    /* 상품id 상품1건 조회*/
    @GetMapping("/product/{id}")
    public RsData<ProductDetailResponse> getProductDetail(
            @PathVariable("id") Long productId
    ) {
        System.out.println("상품단건조회 시작");
        Product product = studioService.getDetailProduct(productId);
        System.out.println("상품이미지조회 시작");
        Image image = studioService.getProductMainImage(productId);

        Category category = studioService.getCategory(product.getCategoryId());
        Subcategory subcategory = product.getSubcategory();
        System.out.println("상품데이터 front 전달");
        return RsData.of("200", "상품1건을 조회하였습니다.",new ProductDetailResponse(product, image, category));
    }

    @PatchMapping("/product/{id}")
    public RsData<ProductDetailResponse> modifyProduct(
            @PathVariable("id") Long productId,
            @RequestPart("request") ProductModifyRequest request,
            @RequestPart(value = "productMainImage", required = false) MultipartFile productMainImage
            ){
        System.out.println("상품 수정 요청 시작");

        Studio studio = studioService.getStudioById(request.getStudioId());
        Product product = studioService.getDetailProduct(productId);

        if(studio == null){
            throw new IllegalArgumentException("해당 공방의 정보를 찾을 수 없습니다.");
        } else if (product == null ){
            throw new IllegalArgumentException("해당 상품을 찾을 수 없습니다");
        }

        Product modifiedProduct = studioService.modifyProduct(request, product);
        if(productMainImage != null && !productMainImage.isEmpty()){
            profileImageService.replaceProductImage(request.getProductId(), productMainImage, Image.RefType.PRODUCT);
        }
        Category category = studioService.getCategory(modifiedProduct.getCategoryId());
        Image image = studioService.getProductMainImage(productId);

        return RsData.of("200", "상품 정보가 성공적으로 수정되었습니다.", new ProductDetailResponse(modifiedProduct, image, category));
    }

    /**
     * 🔥 단건 상품 삭제
     */
    @DeleteMapping("/single-delete/{productId}")
    public RsData<?> deleteProduct(
            @PathVariable Long productId
    ) {
        studioService.deleteProductById(productId);
        return RsData.of("200", "상품이 삭제되었습니다.", null);
    }


    /**
     * 🔥 복수 상품 삭제
     */
    @PostMapping("/multiple-delete")
    public RsData<?> deleteProducts(
            @RequestBody List<Long> productIds
    ) {
        int deletedCount = studioService.deleteProducts(productIds);
        return RsData.of("200", deletedCount + "개의 상품이 삭제되었습니다.", deletedCount);
    }

}
