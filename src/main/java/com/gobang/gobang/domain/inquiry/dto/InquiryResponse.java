package com.gobang.gobang.domain.inquiry.dto;

import com.gobang.gobang.domain.inquiry.entity.Inquiry;
import com.gobang.gobang.domain.inquiry.model.InquiryType;

import java.time.LocalDateTime;

public record InquiryResponse(
        Long id,
        String email,
        String title,
        String content,
        InquiryType type,
        boolean answered,
        LocalDateTime createdAt
) {
    public static InquiryResponse from(Inquiry i) {
        return new InquiryResponse(
                i.getId(), i.getEmail(), i.getTitle(), i.getContent(),
                i.getType(), i.isAnswered(), i.getCreatedAt()
        );
    }
}
