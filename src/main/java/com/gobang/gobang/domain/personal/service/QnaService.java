package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.inquiry.entity.Inquiry;
import com.gobang.gobang.domain.inquiry.model.InquiryType;
import com.gobang.gobang.domain.inquiry.repository.InquiryRepository;
import com.gobang.gobang.domain.personal.dto.response.QnaResponse;
import com.gobang.gobang.global.RsData.RsData;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class QnaService {

    private final InquiryRepository inquiryRepository;
    private final SiteUserRepository siteUserRepository;
    private static final Logger log = LoggerFactory.getLogger(QnaService.class);

    // 전체 내 문의 조회
    @Transactional(readOnly = true)
    public RsData<List<QnaResponse>> getMyInquiries(Long userId) {
        SiteUser user = siteUserRepository.findById(userId).orElse(null);

        if (user == null) {
            return RsData.of("401", "로그인이 필요합니다", null);
        }

        List<QnaResponse> inquiries = inquiryRepository.findAllByWriter(user)
                .stream()
                .map(QnaResponse::from)
                .collect(Collectors.toList());

        return RsData.of("200", "내 문의 전체 조회 성공", inquiries);
    }

    // 특정 문의 상세 조회
    public RsData<QnaResponse> getInquiryDetail(Long userId, Long qnaId) {
        SiteUser user = siteUserRepository.findById(userId).orElse(null);
        if (user == null) return RsData.of("401", "로그인이 필요합니다", null);

        Inquiry inquiry = inquiryRepository.findByIdAndWriter(qnaId, user)
                .orElse(null);

        if (inquiry == null) return RsData.of("404", "문의가 존재하지 않습니다", null);

        return RsData.of("200", "문의 상세 조회 성공", QnaResponse.from(inquiry));
    }

    // 문의 삭제
    @Transactional
    public RsData<Void> deleteInquiry(Long userId, Long qnaId) {
        SiteUser user = siteUserRepository.findById(userId).orElse(null);
        if (user == null) return RsData.of("401", "로그인이 필요합니다", null);

        Inquiry inquiry = inquiryRepository.findById(qnaId).orElse(null);
        if (inquiry == null) return RsData.of("404", "문의가 존재하지 않습니다", null);

        if (!inquiry.getWriter().getId().equals(user.getId())) {
            return RsData.of("403", "본인 문의만 삭제 가능합니다", null);
        }

        inquiryRepository.delete(inquiry);
        return RsData.of("200", "문의 삭제 성공", null);
    }

    // 타입별 문의 조회
    public RsData<List<QnaResponse>> getInquiriesByType(Long userId, InquiryType type) {
        SiteUser user = siteUserRepository.findById(userId).orElse(null);
        if (user == null) return RsData.of("401", "로그인이 필요합니다", null);

        List<QnaResponse> inquiries = inquiryRepository.findByWriterAndType(user, type)
                .stream()
                .map(QnaResponse::from)
                .collect(Collectors.toList());

        return RsData.of("200", type + " 문의 조회 성공", inquiries);
    }

    // 답변 완료/대기 상태별 조회
    public RsData<List<QnaResponse>> getInquiriesByAnswered(Long userId, boolean answered) {
        SiteUser user = siteUserRepository.findById(userId).orElse(null);
        if (user == null) return RsData.of("401", "로그인이 필요합니다", null);

        List<QnaResponse> inquiries = inquiryRepository.findByWriterAndAnswered(user, answered)
                .stream()
                .map(QnaResponse::from)
                .collect(Collectors.toList());

        String statusMsg = answered ? "답변 완료" : "답변 대기";
        return RsData.of("200", statusMsg + " 문의 조회 성공", inquiries);
    }
}