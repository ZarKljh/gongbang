package com.gobang.gobang.domain.seller.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.seller.dto.SellerSimpleResponse;
import com.gobang.gobang.domain.seller.dto.StudioResponse;
import com.gobang.gobang.domain.seller.service.SellerService;
import com.gobang.gobang.domain.seller.service.StudioService;
import com.gobang.gobang.global.RsData.RsData;
import com.gobang.gobang.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/api/v1/personal/seller")
@RequiredArgsConstructor
public class SellerController {
    private final SiteUserService siteUserService;
    private final StudioService studioService;
    private final SellerService sellerService;
    private final Rq rq;

    @GetMapping("/{id}")
    public RsData<Map<String, Object>> getSeller(
            @PathVariable("id") Long id
    ){
        SiteUser seller = sellerService.getSiteUserById(id);

        List<StudioResponse> studioList = new ArrayList<>();
        for (Studio s : seller.getStudioList()) {
            studioList.add(new StudioResponse(seller, s));
            System.out.println("공방ID : " + s.getStudioId());
            System.out.println("공방이름 : " + s.getStudioName());
        }

        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("seller", new SellerSimpleResponse(seller));
        responseMap.put("studioList", studioList);
        return  RsData.of("s-1", "해당공방의 정보와 seller 의 정보를 가져왔습니다", responseMap);
    }
    /*
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

    * */
}
