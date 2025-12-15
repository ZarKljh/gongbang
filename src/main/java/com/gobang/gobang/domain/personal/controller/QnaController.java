package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.service.SiteUserService;
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
    private final SiteUserService siteUserService;

    @GetMapping
    public RsData<List<QnaResponse>> getMyInquiries() {
        SiteUser user = siteUserService.getCurrentUser();
        return RsData.of("200", "내 문의 조회 성공",
                qnaService.getMyInquiries(user));
    }

    @GetMapping("/{qnaId}")
    public RsData<QnaResponse> getInquiryDetail(@PathVariable Long qnaId) {
        SiteUser user = siteUserService.getCurrentUser();
        return RsData.of("200", "문의 상세 조회 성공",
                qnaService.getInquiryDetail(user, qnaId));
    }

    @DeleteMapping("/{qnaId}")
    public RsData<Void> deleteInquiry(@PathVariable Long qnaId) {
        SiteUser user = siteUserService.getCurrentUser();
        qnaService.deleteInquiry(user, qnaId);
        return RsData.of("200", "문의 삭제 성공");
    }

    @GetMapping("/type/{type}")
    public RsData<List<QnaResponse>> getInquiriesByType(@PathVariable InquiryType type) {
        SiteUser user = siteUserService.getCurrentUser();
        return RsData.of("200", "타입별 문의 조회 성공",
                qnaService.getInquiriesByType(user, type));
    }

    @GetMapping("/answered")
    public RsData<List<QnaResponse>> getAnsweredInquiries() {
        SiteUser user = siteUserService.getCurrentUser();
        return RsData.of("200", "답변 완료 문의 조회 성공",
                qnaService.getInquiriesByAnswered(user, true));
    }

    @GetMapping("/pending")
    public RsData<List<QnaResponse>> getPendingInquiries() {
        SiteUser user = siteUserService.getCurrentUser();
        return RsData.of("200", "답변 대기 문의 조회 성공",
                qnaService.getInquiriesByAnswered(user, false));
    }
}