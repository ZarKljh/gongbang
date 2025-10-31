package com.gobang.gobang.domain.inquiry.service;

import com.gobang.gobang.domain.inquiry.entity.Inquiry;
import com.gobang.gobang.domain.inquiry.model.InquiryType;
import com.gobang.gobang.domain.inquiry.repository.InquiryRepository;
import com.gobang.gobang.domain.inquiry.dto.InquiryRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InquiryService {
    private final InquiryRepository inquiryRepository;

    @Transactional
    public Inquiry createInquiry(InquiryRequest req) {
        var type = req.getType() != null ? req.getType() : InquiryType.OTHER;
        return inquiryRepository.save(Inquiry.builder()
                .email(req.getEmail())
                .title(req.getTitle())
                .content(req.getContent())
                .type(type)
                .answered(false)
                .build());
    }

    @Transactional(readOnly = true)
    public List<Inquiry> getAll() { return inquiryRepository.findAll(); }

    @Transactional(readOnly = true)
    public Inquiry getById(Long id) {
        return inquiryRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("not found: " + id));
    }

    @Transactional(readOnly = true)
    public long countUnread() { return inquiryRepository.countByAnsweredFalse(); }

    @Transactional(readOnly = true)
    public long countUnreadByType(InquiryType type) { return inquiryRepository.countByTypeAndAnsweredFalse(type); }

    @Transactional
    public void markAllAnswered() { inquiryRepository.markAllAnswered(); }

    @Transactional
    public void markAllAnsweredByType(InquiryType type) { inquiryRepository.markAllAnsweredByType(type); }
}
