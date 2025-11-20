package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.inquiry.model.InquiryType;
import com.gobang.gobang.domain.personal.dto.response.QnaResponse;
import com.gobang.gobang.domain.personal.service.QnaService;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mypage/qna")
@RequiredArgsConstructor
public class QnaController {

    private final QnaService qnaService;

    // 내 문의 전체 조회
    @GetMapping
    public RsData<List<QnaResponse>> getMyInquiries(@AuthenticationPrincipal SiteUser user) {
        System.out.println("로그인 사용자: " + user);
        if (user == null) {
            return RsData.of("401", "로그인이 필요합니다", null);
        }
        List<QnaResponse> inquiries = qnaService.getMyInquiries(user.getId());
        System.out.println("조회된 문의 수 = " + inquiries.size());
        return RsData.of("200", "내 문의 전체 조회 성공", inquiries);
    }

    // 특정 문의 상세 조회
    @GetMapping("/{qnaId}")
    public RsData<QnaResponse> getInquiryDetail(@AuthenticationPrincipal SiteUser user, @PathVariable Long qnaId) {
        QnaResponse inquiry = qnaService.getInquiryDetail(user.getId(), qnaId);
        return RsData.of("200", "문의 상세 조회 성공", inquiry);
    }

    // 답변 완료 문의 조회
    @GetMapping("/answered")
    public RsData<List<QnaResponse>> getAnsweredInquiries(@AuthenticationPrincipal SiteUser user) {
        List<QnaResponse> inquiries = qnaService.getInquiriesByAnswered(user.getId(), true);
        return RsData.of("200", "답변 완료 문의 조회 성공", inquiries);
    }

    // 답변 대기 문의 조회
    @GetMapping("/pending")
    public RsData<List<QnaResponse>> getPendingInquiries(@AuthenticationPrincipal SiteUser user) {
        List<QnaResponse> inquiries = qnaService.getInquiriesByAnswered(user.getId(), false);
        return RsData.of("200", "답변 대기 문의 조회 성공", inquiries);
    }

    // 타입별 문의 조회
    @GetMapping("/type/{type}")
    public RsData<List<QnaResponse>> getMyInquiriesByType(@AuthenticationPrincipal SiteUser user, @PathVariable InquiryType type) {
        List<QnaResponse> inquiries = qnaService.getMyInquiriesByType(user.getId(), type);
        return RsData.of("200", type + " 문의 조회 성공", inquiries);
    }

    // 타입별 + 답변 완료 문의 조회
    @GetMapping("/type/{type}/answered")
    public RsData<List<QnaResponse>> getAnsweredInquiriesByType(@AuthenticationPrincipal SiteUser user, @PathVariable InquiryType type) {
        List<QnaResponse> inquiries = qnaService.getInquiriesByTypeAndAnswered(user.getId(), type, true);
        return RsData.of("200", type + " 답변 완료 문의 조회 성공", inquiries);
    }

    // 타입별 + 답변 대기 문의 조회
    @GetMapping("/type/{type}/pending")
    public RsData<List<QnaResponse>> getPendingInquiriesByType(@AuthenticationPrincipal SiteUser user, @PathVariable InquiryType type) {
        List<QnaResponse> inquiries = qnaService.getInquiriesByTypeAndAnswered(user.getId(), type, false);
        return RsData.of("200", type + " 답변 대기 문의 조회 성공", inquiries);
    }

    // 문의 삭제
    @DeleteMapping("/{qnaId}")
    public RsData<Void> deleteInquiry(@AuthenticationPrincipal SiteUser user, @PathVariable Long qnaId) {
        qnaService.deleteInquiry(user.getId(), qnaId);
        return RsData.of("200", "문의 삭제 성공");
    }
}