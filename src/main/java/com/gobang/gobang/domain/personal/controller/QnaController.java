package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.inquiry.model.InquiryType;
import com.gobang.gobang.domain.personal.dto.response.QnaResponse;
import com.gobang.gobang.domain.personal.service.QnaService;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mypage/qna")
@RequiredArgsConstructor
public class QnaController {

    private final QnaService qnaService;

    // 내 문의 전체 조회
    @GetMapping
    public RsData<List<QnaResponse>> getMyInquiries(@RequestParam Long userId) {
        return qnaService.getMyInquiries(userId);
    }

    // 특정 문의 상세 조회
    @GetMapping("/{qnaId}")
    public RsData<QnaResponse> getInquiryDetail(@RequestParam Long userId, @PathVariable Long qnaId) {
        return qnaService.getInquiryDetail(userId, qnaId);
    }

    // 문의 삭제
    @DeleteMapping("/{qnaId}")
    public RsData<Void> deleteInquiry(@RequestParam Long userId, @PathVariable Long qnaId) {
        return qnaService.deleteInquiry(userId, qnaId);
    }

    // 타입별 조회
    @GetMapping("/type/{type}")
    public RsData<List<QnaResponse>> getInquiriesByType(@RequestParam Long userId, @PathVariable InquiryType type) {
        return qnaService.getInquiriesByType(userId, type);
    }

    // 답변 완료/대기 조회
    @GetMapping("/answered")
    public RsData<List<QnaResponse>> getAnsweredInquiries(@RequestParam Long userId) {
        return qnaService.getInquiriesByAnswered(userId, true);
    }

    @GetMapping("/pending")
    public RsData<List<QnaResponse>> getPendingInquiries(@RequestParam Long userId) {
        return qnaService.getInquiriesByAnswered(userId, false);
    }
}