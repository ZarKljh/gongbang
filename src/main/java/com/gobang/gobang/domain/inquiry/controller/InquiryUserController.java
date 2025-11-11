package com.gobang.gobang.domain.inquiry.controller;

import com.gobang.gobang.domain.inquiry.dto.InquiryRequest;
import com.gobang.gobang.domain.inquiry.dto.InquiryResponse;
import com.gobang.gobang.domain.inquiry.service.InquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inquiries")
@RequiredArgsConstructor
public class InquiryUserController {

    private final InquiryService inquiryService;

    // 1:1 문의 저장 (유저/셀러가 사용하는 엔드포인트)
    @PostMapping
    public InquiryResponse create(
            @RequestBody InquiryRequest req,
            @AuthenticationPrincipal(expression = "id") Long userId
    ) {
        // 로그인 한 유저 id를 Inquiry 에 같이 저장하고 싶다면 이렇게 넘겨주면 됨
        return InquiryResponse.from(inquiryService.createInquiryForUser(req, userId));
    }

    // 내가 쓴 문의 목록 가져오기
    @GetMapping("/me")
    public List<InquiryResponse> getMyInquiries(
            @AuthenticationPrincipal(expression = "id") Long userId
    ) {
        return inquiryService.findByUserId(userId)
                .stream()
                .map(InquiryResponse::from)
                .toList();
    }
}
