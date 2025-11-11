package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.inquiry.entity.Inquiry;
import com.gobang.gobang.domain.inquiry.model.InquiryType;
import com.gobang.gobang.domain.inquiry.repository.InquiryRepository;
import com.gobang.gobang.domain.personal.dto.response.QnaResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QnaService {

    private final InquiryRepository inquiryRepository;
    private final SiteUserService siteUserService;

    // 전체 내 문의 조회
    public List<QnaResponse> getMyInquiries() {
        SiteUser currentUser = siteUserService.getCurrentUser();
        return inquiryRepository.findByUser(currentUser)
                .stream()
                .map(QnaResponse::from)
                .collect(Collectors.toList());
    }

    // 특정 문의 상세 조회
    public QnaResponse getInquiryDetail(Long qnaId) {
        SiteUser currentUser = siteUserService.getCurrentUser();
        Inquiry inquiry = inquiryRepository.findById(qnaId)
                .orElseThrow(() -> new IllegalArgumentException("해당 문의를 찾을 수 없습니다."));

        if (!inquiry.getUser().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("본인의 문의만 조회할 수 있습니다.");
        }

        return QnaResponse.from(inquiry);
    }

    // 답변 완료/대기 상태별 조회
    public List<QnaResponse> getInquiriesByAnswered(boolean answered) {
        SiteUser currentUser = siteUserService.getCurrentUser();
        return inquiryRepository.findByUserAndAnswered(currentUser, answered)
                .stream()
                .map(QnaResponse::from)
                .collect(Collectors.toList());
    }

    // 타입별 조회
    public List<QnaResponse> getMyInquiriesByType(InquiryType type) {
        SiteUser currentUser = siteUserService.getCurrentUser();
        return inquiryRepository.findByUserAndType(currentUser, type)
                .stream()
                .map(QnaResponse::from)
                .collect(Collectors.toList());
    }

    // 타입 + 답변 상태별 조회
    public List<QnaResponse> getInquiriesByTypeAndAnswered(InquiryType type, boolean answered) {
        SiteUser currentUser = siteUserService.getCurrentUser();
        return inquiryRepository.findByUserAndTypeAndAnswered(currentUser, type, answered)
                .stream()
                .map(QnaResponse::from)
                .collect(Collectors.toList());
    }

    // 문의 삭제
    @Transactional
    public void deleteInquiry(Long qnaId) {
        SiteUser currentUser = siteUserService.getCurrentUser();
        Inquiry inquiry = inquiryRepository.findById(qnaId)
                .orElseThrow(() -> new IllegalArgumentException("해당 문의를 찾을 수 없습니다."));

        if (!inquiry.getUser().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("본인의 문의만 삭제할 수 있습니다.");
        }

        inquiryRepository.delete(inquiry);
    }
}