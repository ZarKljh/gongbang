package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.inquiry.entity.Inquiry;
import com.gobang.gobang.domain.inquiry.model.InquiryType;
import com.gobang.gobang.domain.inquiry.repository.InquiryRepository;
import com.gobang.gobang.domain.personal.dto.response.QnaResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class QnaService {

    private final InquiryRepository inquiryRepository;
    private final SiteUserRepository siteUserRepository;

    // 전체 내 문의 조회
    public List<QnaResponse> getMyInquiries(Long userId) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return inquiryRepository.findAllByUser(user)
                .stream()
                .map(QnaResponse::from)
                .toList();
    }

    // 특정 문의 상세 조회
    public QnaResponse getInquiryDetail(Long userId, Long qnaId) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        Inquiry inquiry = inquiryRepository.findByIdAndUser(qnaId, user)
                .orElseThrow(() -> new IllegalArgumentException("해당 문의를 찾을 수 없습니다."));
        return QnaResponse.from(inquiry);
    }

    // 답변 완료/대기 상태별 조회
    public List<QnaResponse> getInquiriesByAnswered(Long userId, boolean answered) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return inquiryRepository.findByUserAndAnswered(user, answered)
                .stream()
                .map(QnaResponse::from)
                .toList();
    }

    // 타입별 조회
    public List<QnaResponse> getMyInquiriesByType(Long userId, InquiryType type) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return inquiryRepository.findByUserAndType(user, type)
                .stream()
                .map(QnaResponse::from)
                .toList();
    }

    // 타입 + 답변 상태별 조회
    public List<QnaResponse> getInquiriesByTypeAndAnswered(Long userId, InquiryType type, boolean answered) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        return inquiryRepository.findByUserAndTypeAndAnswered(user, type, answered)
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

        if (!inquiry.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("본인의 문의만 삭제할 수 있습니다.");
        }

        inquiryRepository.delete(inquiry);
    }
}