package com.gobang.gobang.domain.auth.controller;

import com.gobang.gobang.domain.auth.dto.request.LoginUserRequest;
import com.gobang.gobang.domain.auth.dto.request.SignupUserRequest;
import com.gobang.gobang.domain.auth.dto.response.LoginUserResponse;
import com.gobang.gobang.domain.auth.dto.response.SignupUserResponse;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.global.RsData.RsData;
import com.gobang.gobang.global.jwt.JwtProvider;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping(value = "/api/auth")
@RequiredArgsConstructor
@Tag(name = "ApiV1SiteUserController", description = "회원 인증/인가 API")
public class SiteUserController {
    private final SiteUserService siteUserService;
    private final JwtProvider jwtProvider;

    @PostMapping("/signup/user")
    public RsData<SignupUserResponse> join (@Valid @RequestBody SignupUserRequest signupUserRequest) {
        SiteUser siteUser = siteUserService.signupUser(signupUserRequest);
        //System.out.println("여기까지 확인되었습니다");
        return RsData.of("200", "회원가입이 완료되었습니다.", new SignupUserResponse(siteUser));
    }

    @PostMapping("/login/user")
    public RsData<LoginUserResponse> login(@Valid @RequestBody LoginUserRequest loginUserRequest, HttpServletResponse res) {
        SiteUser siteUser = siteUserService.getSiteUser(loginUserRequest.getEmail());

        // accessToken 발급
        String accessToken = jwtProvider.genAccessToken(siteUser);
        //res.addCookie(new Cookie("accessToken", accessToken));
        Cookie accessTokenCookie = new Cookie("accessToken", accessToken);
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setSecure(true);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(60 * 60);
        res.addCookie(accessTokenCookie);

        String refreshToken = siteUser.getRefreshToken();
        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(60 * 60);
        res.addCookie(refreshTokenCookie);

        return RsData.of("200", "토큰 발급 성공" + accessToken, new LoginUserResponse(siteUser));
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
        String email = (String) claims.get("email");
        SiteUser siteUser = this.siteUserService.getSiteUser(email);

        return RsData.of("200", "내 회원정보", new LoginUserResponse(siteUser));
    }
    @GetMapping("/logout")
    public RsData logout(HttpServletResponse res) {
        Cookie accessTokenCookie = new Cookie("accessToken", null);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(0);
        res.addCookie(accessTokenCookie);

        Cookie refreshTokenCookie = new Cookie("refreshToken", null);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(0);
        res.addCookie(refreshTokenCookie);

        return RsData.of("200", "로그아웃 성공");
    }
}
