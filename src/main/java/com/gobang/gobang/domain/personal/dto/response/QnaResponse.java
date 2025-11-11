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
    private Long userId;
    private String title;
    private String content;
    private InquiryType type;
    private Boolean answered;
    private LocalDateTime createdAt;

    public static QnaResponse from(Inquiry inquiry) {
        return QnaResponse.builder()
                .userId(inquiry.getUser() != null ? inquiry.getUser().getId() : null)
                .title(inquiry.getTitle() != null ? inquiry.getTitle() : "")
                .content(inquiry.getContent() != null ? inquiry.getContent() : "")
                .type(inquiry.getType())
                .answered(inquiry.isAnswered())
                .createdAt(inquiry.getCreatedAt())
                .build();
    }
}