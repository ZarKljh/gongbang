package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.inquiry.entity.Inquiry;
import com.gobang.gobang.domain.inquiry.model.InquiryType;
import com.gobang.gobang.domain.inquiry.repository.InquiryRepository;
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
        List<QnaResponse> inquiries = qnaService.getMyInquiries(userId);
        return RsData.of("200", "내 문의 전체 조회 성공", inquiries);
    }

    // 특정 문의 상세 조회
    @GetMapping("/{qnaId}")
    public RsData<QnaResponse> getInquiryDetail(@RequestParam Long userId, @PathVariable Long qnaId) {
        QnaResponse inquiry = qnaService.getInquiryDetail(userId, qnaId);
        return RsData.of("200", "문의 상세 조회 성공", inquiry);
    }

    // 답변 완료 문의 조회
    @GetMapping("/answered")
    public RsData<List<QnaResponse>> getAnsweredInquiries(@RequestParam Long userId) {
        List<QnaResponse> inquiries = qnaService.getInquiriesByAnswered(userId, true);
        return RsData.of("200", "답변 완료 문의 조회 성공", inquiries);
    }

    // 답변 대기 문의 조회
    @GetMapping("/pending")
    public RsData<List<QnaResponse>> getPendingInquiries(@RequestParam Long userId) {
        List<QnaResponse> inquiries = qnaService.getInquiriesByAnswered(userId, false);
        return RsData.of("200", "답변 대기 문의 조회 성공", inquiries);
    }

    // 타입별 문의 조회
    @GetMapping("/type/{type}")
    public RsData<List<QnaResponse>> getMyInquiriesByType(@RequestParam Long userId, @PathVariable InquiryType type) {
        List<QnaResponse> inquiries = qnaService.getMyInquiriesByType(userId, type);
        return RsData.of("200", type + " 문의 조회 성공", inquiries);
    }

    // 타입별 + 답변 완료 문의 조회
    @GetMapping("/type/{type}/answered")
    public RsData<List<QnaResponse>> getAnsweredInquiriesByType(@RequestParam Long userId, @PathVariable InquiryType type) {
        List<QnaResponse> inquiries = qnaService.getInquiriesByTypeAndAnswered(userId, type, true);
        return RsData.of("200", type + " 답변 완료 문의 조회 성공", inquiries);
    }

    // 타입별 + 답변 대기 문의 조회
    @GetMapping("/type/{type}/pending")
    public RsData<List<QnaResponse>> getPendingInquiriesByType(@RequestParam Long userId, @PathVariable InquiryType type) {
        List<QnaResponse> inquiries = qnaService.getInquiriesByTypeAndAnswered(userId, type, false);
        return RsData.of("200", type + " 답변 대기 문의 조회 성공", inquiries);
    }

    // 문의 삭제
    @DeleteMapping("/{qnaId}")
    public RsData<Void> deleteInquiry(@RequestParam Long userId, @PathVariable Long qnaId) {
        qnaService.deleteInquiry(userId, qnaId);
        return RsData.of("200", "문의 삭제 성공");
    }
}