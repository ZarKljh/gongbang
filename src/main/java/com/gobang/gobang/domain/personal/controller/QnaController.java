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
    public RsData<List<QnaResponse>> getMyInquiries() {
        List<QnaResponse> inquiries = qnaService.getMyInquiries();
        return RsData.of("200", "내 문의 전체 조회 성공", inquiries);
    }

    // 특정 문의 상세 조회
    @GetMapping("/{qnaId}")
    public RsData<QnaResponse> getInquiryDetail(@PathVariable Long qnaId) {
        QnaResponse inquiry = qnaService.getInquiryDetail(qnaId);
        return RsData.of("200", "문의 상세 조회 성공", inquiry);
    }

    // 답변 완료 문의 조회
    @GetMapping("/answered")
    public RsData<List<QnaResponse>> getAnsweredInquiries() {
        List<QnaResponse> inquiries = qnaService.getInquiriesByAnswered(true);
        return RsData.of("200", "답변 완료 문의 조회 성공", inquiries);
    }

    // 답변 대기 문의 조회
    @GetMapping("/pending")
    public RsData<List<QnaResponse>> getPendingInquiries() {
        List<QnaResponse> inquiries = qnaService.getInquiriesByAnswered(false);
        return RsData.of("200", "답변 대기 문의 조회 성공", inquiries);
    }

    // 타입별 문의 조회
    @GetMapping("/type/{type}")
    public RsData<List<QnaResponse>> getMyInquiriesByType(@PathVariable InquiryType type) {
        List<QnaResponse> inquiries = qnaService.getMyInquiriesByType(type);
        return RsData.of("200", type + " 문의 조회 성공", inquiries);
    }

    // 타입별 + 답변 완료 문의 조회
    @GetMapping("/type/{type}/answered")
    public RsData<List<QnaResponse>> getAnsweredInquiriesByType(@PathVariable InquiryType type) {
        List<QnaResponse> inquiries = qnaService.getInquiriesByTypeAndAnswered(type, true);
        return RsData.of("200", type + " 답변 완료 문의 조회 성공", inquiries);
    }

    // 타입별 + 답변 대기 문의 조회
    @GetMapping("/type/{type}/pending")
    public RsData<List<QnaResponse>> getPendingInquiriesByType(@PathVariable InquiryType type) {
        List<QnaResponse> inquiries = qnaService.getInquiriesByTypeAndAnswered(type, false);
        return RsData.of("200", type + " 답변 대기 문의 조회 성공", inquiries);
    }

    // 문의 삭제
    @DeleteMapping("/{qnaId}")
    public RsData<Void> deleteInquiry(@PathVariable Long qnaId) {
        qnaService.deleteInquiry(qnaId);
        return RsData.of("200", "문의 삭제 성공");
    }
}