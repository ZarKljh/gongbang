package com.gobang.gobang.domain.personal.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SendMailRequestDto {
    private Long userId;
    private String email;
    private String userName; // token에 보관할 것
}