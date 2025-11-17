package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.inquiry.entity.Inquiry;
import com.gobang.gobang.domain.inquiry.model.InquiryType;
import com.gobang.gobang.domain.inquiry.repository.InquiryRepository;
import com.gobang.gobang.domain.personal.dto.response.QnaResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class QnaService {

    private final InquiryRepository inquiryRepository;
    private final SiteUserRepository siteUserRepository;
    private static final Logger log = LoggerFactory.getLogger(QnaService.class);

    // 전체 내 문의 조회git add .
    @Transactional(readOnly = true)
    public List<QnaResponse> getMyInquiries(Long userId) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        List<Inquiry> inquiries = inquiryRepository.findAllByWriter(user);
        List<QnaResponse> safeList = new ArrayList<>();

        System.out.println("userId = " + userId);
        System.out.println("조회된 문의 수 = " + (inquiries != null ? inquiries.size() : "null"));

        for (Inquiry inquiry : inquiries) {
            try {
                safeList.add(QnaResponse.from(inquiry));
            } catch (Exception e) {
                log.warn("Inquiry 변환 실패 id={} reason={}", inquiry.getId(), e.getMessage());
            }
        }
        return safeList;
    }

    // 특정 문의 상세 조회
    public QnaResponse getInquiryDetail(Long userId, Long qnaId) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        Inquiry inquiry = inquiryRepository.findByIdAndWriter(qnaId, user)
                .orElseThrow(() -> new IllegalArgumentException("해당 문의를 찾을 수 없습니다."));
        return QnaResponse.from(inquiry);
    }

    // 답변 완료/대기 상태별 조회
    public List<QnaResponse> getInquiriesByAnswered(Long userId, boolean answered) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        List<Inquiry> inquiries = inquiryRepository.findByWriterAndAnswered(user, answered);
        List<QnaResponse> safeList = new ArrayList<>();

        for (Inquiry inquiry : inquiries) {
            try {
                safeList.add(QnaResponse.from(inquiry));
            } catch (Exception e) {
                log.warn("Inquiry 변환 실패 id={} reason={}", inquiry.getId(), e.getMessage());
            }
        }
        return safeList;
    }

    // 타입별 조회
    public List<QnaResponse> getMyInquiriesByType(Long userId, InquiryType type) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return inquiryRepository.findByWriterAndType(user, type)
                .stream()
                .map(QnaResponse::from)
                .toList();
    }

    // 타입 + 답변 상태별 조회
    public List<QnaResponse> getInquiriesByTypeAndAnswered(Long userId, InquiryType type, boolean answered) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return inquiryRepository.findByWriterAndTypeAndAnswered(user, type, answered)
                .stream()
                .map(QnaResponse::from)
                .toList();
    }

    // 문의 삭제
    @Transactional
    public void deleteInquiry(Long userId, Long qnaId) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        Inquiry inquiry = inquiryRepository.findById(qnaId)
                .orElseThrow(() -> new IllegalArgumentException("해당 문의를 찾을 수 없습니다."));

        if (!inquiry.getWriter().getId().equals(user.getId())) {
            throw new IllegalArgumentException("본인의 문의만 삭제할 수 있습니다.");
        }

        inquiryRepository.delete(inquiry);
    }
}