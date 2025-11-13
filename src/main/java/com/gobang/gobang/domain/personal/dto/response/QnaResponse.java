package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.inquiry.entity.Inquiry;
import com.gobang.gobang.domain.inquiry.model.InquiryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class QnaResponse {
    private Long qnaId;
    private Long userId;
    private String title;
    private String content;
    private InquiryType type;
    private Boolean answered;
    private LocalDateTime createdAt;

    public static QnaResponse from(Inquiry inquiry) {
        Long userId = null;
        try {
            if (inquiry.getWriter() != null) {
                userId = inquiry.getWriter().getId();
            }
        } catch (Exception e) {
            userId = null; // Lazy 로딩 예외 방지
        }

        return QnaResponse.builder()
                .qnaId(inquiry.getId())
                .userId(userId)
                .title(inquiry.getTitle() != null ? inquiry.getTitle() : "")
                .content(inquiry.getContent() != null ? inquiry.getContent() : "")
                .type(inquiry.getType())
                .answered(inquiry.isAnswered())
                .createdAt(inquiry.getCreatedAt())
                .build();
    }
}