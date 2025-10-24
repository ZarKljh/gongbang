package com.gobang.gobang.domain.auth.controller;

import com.gobang.gobang.domain.auth.dto.SiteUserDto;
import com.gobang.gobang.domain.auth.dto.request.LoginUserRequest;
import com.gobang.gobang.domain.auth.dto.request.SignupSellerRequest;
import com.gobang.gobang.domain.auth.dto.request.SignupUserRequest;
import com.gobang.gobang.domain.auth.dto.response.LoginUserResponse;
import com.gobang.gobang.domain.auth.dto.response.SignupSellerResponse;
import com.gobang.gobang.domain.auth.dto.response.SignupUserResponse;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.auth.service.StudioService;
import com.gobang.gobang.global.RsData.RsData;
import com.gobang.gobang.global.jwt.JwtProvider;
import com.gobang.gobang.global.rq.Rq;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping(value = "/api/auth")
@RequiredArgsConstructor
@Tag(name = "ApiV1SiteUserController", description = "회원 인증/인가 API")
public class SiteUserController {
    private final SiteUserService siteUserService;
    private final StudioService studioService;
    private final JwtProvider jwtProvider;
    //private final HttpServletResponse resp;
    private final Rq rq;

    @PostMapping("/signup/user")
    public RsData<SignupUserResponse> joinUser (@Valid @RequestBody SignupUserRequest signupUserRequest) {
        SiteUser siteUser = siteUserService.signupUser(signupUserRequest);
        //System.out.println("여기까지 확인되었습니다");
        return RsData.of("200", "회원가입이 완료되었습니다.", new SignupUserResponse(siteUser));
    }
    @PostMapping("/signup/seller")
    public RsData<SignupSellerResponse> joinSeller(@Valid @RequestBody SignupSellerRequest signupSellerRequest){
        SiteUser newUser = siteUserService.signupSeller(signupSellerRequest);
        Studio newStudio = studioService.getStudio(newUser);
        return RsData.of("200", "회원가입이 완료되었습니다", new SignupSellerResponse(newUser, newStudio));
    }

    @Getter
    @AllArgsConstructor
    public static class LoginResponseBody{
        private SiteUserDto siteUserDto;
    }

    @PostMapping("/login/user")
    public RsData<LoginResponseBody> login(@Valid @RequestBody LoginUserRequest loginUserRequest, HttpServletResponse res) {
        SiteUser siteUser = siteUserService.getSiteUserByUserName(loginUserRequest.getUserName());
        RsData<SiteUserService.AuthAndMakeTokensResponseBody> authAndMakeTokensRs = siteUserService.authAndMakeTokens(loginUserRequest.getUserName(), loginUserRequest.getPassword());


        // accessToken 발급
        rq.setCrossDomainCookie("accessToken", authAndMakeTokensRs.getData().getAccessToken());
        rq.setCrossDomainCookie("refreshToken", authAndMakeTokensRs.getData().getRefreshToken());


        return RsData.of(
                authAndMakeTokensRs.getResultCode(),
                authAndMakeTokensRs.getMsg(),
                new LoginResponseBody(new SiteUserDto(authAndMakeTokensRs.getData().getSiteUser()))
        );
    }

    @GetMapping("/me")
    public RsData<LoginUserResponse> me(HttpServletRequest req) {
        Cookie[] cookies = req.getCookies();
        String accessToken = "";

        for (Cookie cookie : cookies) {
            if ("accessToken".equals(cookie.getName())) {
                accessToken = cookie.getValue();
            }
        }

        Map<String, Object> claims = jwtProvider.getClaims(accessToken);
        String userName = (String) claims.get("userName");
        SiteUser siteUser = this.siteUserService.getSiteUserByUserName(userName);

        return RsData.of("200", "내 회원정보", new LoginUserResponse(siteUser));
    }
    @PostMapping("/logout")
    public RsData logout() {
        rq.removeCrossDomainCookie("accessToken");
        rq.removeCrossDomainCookie("refreshToken");

        return RsData.of("200","로그아웃 성공");
    }
    /*
    private void _addHeaderCookie(String tokenName, String token) {
        ResponseCookie cookie = ResponseCookie
                .from(tokenName, token)
                .path("/")
                .sameSite("None")
                .secure(true)
                .httpOnly(true)
                .build();

        resp.addHeader("Set-Cookie", cookie.toString());
    }
    */
}
