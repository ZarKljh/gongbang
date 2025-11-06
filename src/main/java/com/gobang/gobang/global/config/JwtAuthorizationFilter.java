package com.gobang.gobang.global.config;

import com.gobang.gobang.domain.auth.service.SiteUserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class JwtAuthorizationFilter extends OncePerRequestFilter {

    private final SiteUserService siteUserService; // ✅ HttpServletRequest 주입 제거

    @Override
    @SneakyThrows
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) {

        String uri = request.getRequestURI();

        // 인증 필터를 타지 않아도 되는 경로들 (로그인/회원가입/로그아웃)
        if (uri.equals("/api/v1/auth/login/seller")
                || uri.equals("/api/v1/auth/login/user")
                || uri.equals("/api/v1/auth/logout")
                || uri.equals("/api/v1/auth/signup/user")
                || uri.equals("/api/v1/auth/signup/seller")) {

            filterChain.doFilter(request, response);
            return;
        }

        // ✅ 이 요청에서 쿠키 직접 읽기
        String accessToken = getCookie(request, "accessToken");

        if (accessToken != null && !accessToken.isBlank()) {
            try {
                // 여기서 내부적으로 JWT 검증 + 유저/권한 세팅
                // (만료/위조 등에서 예외가 나면 catch에서 처리)
                SecurityUser securityUser = siteUserService.getUserFromAccessToken(accessToken);

                // SecurityUser 안에서 권한이 "ADMIN" (또는 "ROLE_ADMIN")으로 설정되어 있어야 함
                SecurityContextHolder.getContext().setAuthentication(securityUser.getAuthentication());

            } catch (io.jsonwebtoken.ExpiredJwtException e) {
                // 토큰 만료: 인증 없이 진행 (또는 401로 끊어도 됨)
                // response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                // return;
            } catch (Exception e) {
                // 그 외 JWT/인증 관련 에러: 인증 없이 진행
                // (로그 찍고 싶으면 여기서 찍기)
                // e.printStackTrace();
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies(); // ✅ 여기서 request 사용
        if (cookies == null) return "";

        return Arrays.stream(cookies)
                .filter(cookie -> cookie.getName().equals(name))
                .findFirst()
                .map(Cookie::getValue)
                .orElse("");
    }
}
