package com.gobang.gobang.domain.inquiry.dto;

import com.gobang.gobang.domain.inquiry.model.InquiryType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class InquiryRequest {

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String title;

    @NotBlank
    private String content;

    private InquiryType type = InquiryType.OTHER;

}
