package com.gobang.gobang.domain.product.home.homeController;

import com.gobang.gobang.domain.product.home.dto.response.TopStudioResponse;
import com.gobang.gobang.domain.product.home.service.HomeService;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/home/v1")
public class HomeController {
    private final HomeService homeService;

    @GetMapping("/top-studios")
    public RsData<List<TopStudioResponse>> getTopStudios(
            @RequestParam(defaultValue = "24") int hours
    ) {
        List<TopStudioResponse> result = homeService.getTopStudios(hours);
        return RsData.of("200", "최근 24시간 인기 공방 조회 성공", result);
    }
}
