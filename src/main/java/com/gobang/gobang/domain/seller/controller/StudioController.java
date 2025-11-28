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
    public RsData<Page<ProductDto>> getProductList(
            @PathVariable("id") Long studioId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ){
        //List<ProductDto> productList = studioService.getProductList(subCategoryId, size);
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<ProductDto> productPage = studioService.getProductListByStudioId(studioId, pageable);


        return RsData.of("s-1", "해당공방의 상품리스트를 가져왔습니다", productPage);
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


}
