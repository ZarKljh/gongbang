package com.gobang.gobang.domain.inquiry.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.inquiry.entity.Inquiry;
import com.gobang.gobang.domain.inquiry.model.InquiryType;
import com.gobang.gobang.domain.inquiry.repository.InquiryRepository;
import com.gobang.gobang.domain.inquiry.dto.InquiryRequest;
import com.gobang.gobang.domain.notification.entity.Notification;
import com.gobang.gobang.domain.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InquiryService {
    private final InquiryRepository inquiryRepository;
    private final SiteUserRepository siteUserRepository;
    private final NotificationRepository notificationRepository;

    @Transactional
    public Inquiry createInquiryForUser(InquiryRequest req, Long userId) {
        // 1. userId로 SiteUser 조회
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 2. Inquiry 엔티티 생성 + user 세팅
        Inquiry inquiry = new Inquiry();
        inquiry.setTitle(req.getTitle());
        inquiry.setContent(req.getContent());
        inquiry.setType(req.getType());
        inquiry.setAnswered(false);
        inquiry.setWriter(user);           // 작성자

        inquiry.setEmail(req.getEmail() != null ? req.getEmail() : user.getEmail());




        return inquiryRepository.save(inquiry);
    }

    @Transactional(readOnly = true)
    public List<Inquiry> findByUserId(Long userId) {
        return inquiryRepository.findByWriter_Id(userId);
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

    @Transactional
    public void answerInquiry(Long id, String answerContent) {
        Inquiry inq = getById(id);

        inq.setAnswerContent(answerContent);
        inq.setAnswered(true);
        inq.setAnsweredAt(LocalDateTime.now());

        SiteUser target = inq.getWriter();

        String link = "/personal?tab=qna";

        notificationRepository.save(new Notification(
                target,
                "문의에 답변이 등록되었습니다.",
                link
        ));
    }




}
