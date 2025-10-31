package com.gobang.gobang.domain.personal.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteUserUpdateRequest {
    private String password;
    private String email;
    private String mobilePhone;
    private String nickName;
}