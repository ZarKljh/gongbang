package com.gobang.gobang.domain.seller.controller;

import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.seller.service.StudioService;
import com.gobang.gobang.global.RsData.RsData;
import com.gobang.gobang.global.rq.Rq;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping(value = "/api/v1/personal/seller")
@RequiredArgsConstructor
public class SellerController {
    private final SiteUserService siteUserService;
    private final StudioService studioService;
    private final Rq rq;

    @GetMapping("/{id}")
    public RsData<Map<String, Object>> getSeller(
            @PathVariable("id") Long id
    ){

        Map<String, Object> responseMap = new HashMap<>();
        return  RsData.of("s-1", "해당공방의 정보와 seller 의 정보를 가져왔습니다", responseMap);
    }

}
