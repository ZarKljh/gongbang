package com.gobang.gobang.domain.auth.controller;

import com.gobang.gobang.domain.auth.dto.request.SignupUserRequest;
import com.gobang.gobang.domain.auth.dto.response.SignupUserResponse;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.global.RsData.RsData;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "ApiV1SiteUserController", description = "회원 인증/인가 API")
public class SiteUserController {
    private final SiteUserService siteUserService;

    @PostMapping("/signup/user")
    public RsData<SignupUserResponse> join (@Valid @RequestBody SignupUserRequest signupUserRequest) {
        SiteUser siteUser = siteUserService.signupUser(signupUserRequest);
        System.out.println("여기까지 확인되었습니다");
        return RsData.of("200", "회원가입이 완료되었습니다.", new SignupUserResponse(siteUser));
    }
}
