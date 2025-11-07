package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.auth.entity.SiteUser;
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
    private boolean answered; //답변여부
    private LocalDateTime createdAt;

    public static QnaResponse from(Inquiry inquiry, SiteUser siteUser) {
        return QnaResponse.builder()
                .userId(siteUser.getId())
                .title(inquiry.getTitle())
                .content(inquiry.getContent())
                .type(inquiry.getType())
                .answered(inquiry.isAnswered())
                .createdAt(inquiry.getCreatedAt())
                .build();
    }
}