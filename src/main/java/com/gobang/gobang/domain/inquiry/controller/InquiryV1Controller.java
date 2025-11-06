
package com.gobang.gobang.domain.inquiry.controller;

import com.gobang.gobang.domain.inquiry.dto.InquiryRequest;
import com.gobang.gobang.domain.inquiry.dto.InquiryResponse;
import com.gobang.gobang.domain.inquiry.model.InquiryType;
import com.gobang.gobang.domain.inquiry.service.InquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/v1/inquiries")
@RequiredArgsConstructor
public class InquiryV1Controller {

    private final InquiryService service;


    // 전체 조회, 필터링 미구현 상태 필요시 구현 예정
    @GetMapping
    public List<InquiryResponse> getAll(@RequestParam(required = false) InquiryType type) {
        var list = service.getAll();
        return list.stream().map(InquiryResponse::from).toList();
    }

    //단건 조회, 문의 상세 페이지 조회
    @GetMapping("/{id}")
    public InquiryResponse getOne(@PathVariable Long id) {
        return InquiryResponse.from(service.getById(id));
    }

    // 전체 미확인 카운트, 프론트에서 보여주기 위함
    @GetMapping("/count")
    public Map<String, Long> countAll() {
        return Map.of("count", service.countUnread());
    }

    // 타입별 미확인 카운트, 일반 유저의 신고와 사업자의 신고의 유형을 나누기 위함
    @GetMapping("/count/by-type")
    public Map<String, Long> countByType(@RequestParam InquiryType type) {
        return Map.of("count", service.countUnreadByType(type));
    }

    // 전체 ACK, 답변 처리 및 읽음 처리
    @PostMapping("/ack")
    public Map<String, Boolean> ackAll() {
        service.markAllAnswered();
        return Map.of("ok", true);
    }
}
