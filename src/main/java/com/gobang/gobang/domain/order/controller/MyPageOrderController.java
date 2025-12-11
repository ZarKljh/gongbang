package com.gobang.gobang.domain.order.controller;


import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.personal.dto.response.OrdersResponse;
import com.gobang.gobang.domain.personal.service.OrdersService;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mypage")
@RequiredArgsConstructor
public class MyPageOrderController {


    private final OrdersService ordersService;

    // 셀러가 받은 주문 리스트
    @GetMapping("/studios/{studioId}/orders")
    public RsData<List<OrdersResponse>> getStudioReceivedOrders(
            @PathVariable Long studioId
    ) {
        List<OrdersResponse> orders = ordersService.getReceivedOrdersByStudio(studioId);
        return RsData.of("200", "받은 주문 리스트 조회 성공", orders);
    }
}
