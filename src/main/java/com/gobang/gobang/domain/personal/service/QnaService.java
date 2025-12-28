package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
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
@Transactional(readOnly = true)
public class QnaService {

    private final InquiryRepository inquiryRepository;

    public List<QnaResponse> getMyInquiries(SiteUser user) {
        return inquiryRepository.findAllByWriterWithFetchJoin(user)
                .stream()
                .map(QnaResponse::from)
                .toList();
    }

    public QnaResponse getInquiryDetail(SiteUser user, Long qnaId) {
        Inquiry inquiry = inquiryRepository.findByIdAndWriter(qnaId, user)
                .orElseThrow(() -> new IllegalArgumentException("요청을 처리할 수 없습니다."));

        return QnaResponse.from(inquiry);
    }

    @Transactional
    public void deleteInquiry(SiteUser user, Long qnaId) {
        System.out.println("🔥 deleteInquiry 호출됨 qnaId = " + qnaId);
        Inquiry inquiry = inquiryRepository.findById(qnaId)
                .orElseThrow(() -> new IllegalArgumentException("요청을 처리할 수 없습니다."));

        if (!inquiry.getWriter().getId().equals(user.getId())) {
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }

        if (inquiry.isAnswered()) {
            throw new IllegalStateException("답변 완료된 문의는 삭제할 수 없습니다.");
        }

        inquiryRepository.delete(inquiry);
        System.out.println("🔥 deleteInquiry 완료 qnaId = " + qnaId);
    }

    public List<QnaResponse> getInquiriesByType(SiteUser user, InquiryType type) {
        return inquiryRepository.findByWriterAndType(user, type)
                .stream()
                .map(QnaResponse::from)
                .toList();
    }

    public List<QnaResponse> getInquiriesByAnswered(SiteUser user, boolean answered) {
        return inquiryRepository.findByWriterAndAnswered(user, answered)
                .stream()
                .map(QnaResponse::from)
                .toList();
    }
}