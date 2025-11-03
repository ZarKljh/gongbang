package com.gobang.gobang.domain.seller.controller;

import com.gobang.gobang.domain.auth.entity.RoleType;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.product.dto.ProductDto;
import com.gobang.gobang.domain.seller.dto.StudioAddRequest;
import com.gobang.gobang.domain.seller.dto.StudioResponse;
import com.gobang.gobang.domain.seller.dto.StudioSimpleDto;
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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/api/v1/studio")
@RequiredArgsConstructor
public class StudioController {
    private final SiteUserService siteUserService;
    private final StudioService studioService;
    private final Rq rq;

    @GetMapping("/{id}")
    public RsData<Map<String, Object>> getStudio(@PathVariable("id") Long id){
        Studio studio = studioService.getStudioById(id);
        SiteUser seller = siteUserService.getSiteUserByUserName(studio.getSiteUser().getUserName());

        List<StudioSimpleDto> studioList = new ArrayList<>();
        for (Studio s : seller.getStudioList()) {
            studioList.add(new StudioSimpleDto(s.getStudioId(), s.getStudioName()));
            System.out.println("공방ID : " + s.getStudioId());
            System.out.println("공방이름 : " + s.getStudioName());
        }

        StudioResponse studioResponse = new StudioResponse(seller, studio);

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



    @PostMapping("/add")
    public RsData<Map<String, Object>> studioAdd(@Valid @RequestBody StudioAddRequest studioAddRequest){

        SiteUser seller = rq.getSiteUser();
        if(seller == null){
            throw new IllegalArgumentException("판매자로그인 혹은 회원가입을 해주세요.");
        } else if( seller.getRole() != RoleType.SELLER){
            throw new IllegalArgumentException("판매자 전용 기능입니다. 판매자로 로그인해주세요.");
        }
        Studio newStudio = studioService.AddStudio(seller, studioAddRequest);

        List<StudioSimpleDto> studioList = new ArrayList<>();
        for (Studio s : seller.getStudioList()) {
            studioList.add(new StudioSimpleDto(s.getStudioId(), s.getStudioName()));
        }

        StudioResponse studioResponse = new StudioResponse(seller, newStudio);

        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("studio", studioResponse);
        responseMap.put("studioList", studioList);

        return  RsData.of("s-1", "신규공방이 등록되었습니다", responseMap);
    }


}
