package com.gobang.gobang.global.rq;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.global.config.SecurityUser;
import jakarta.persistence.EntityManager;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import java.util.Arrays;
import java.util.Optional;

@Component
@RequestScope
@RequiredArgsConstructor
public class Rq {
    private static final String COOKIE_DOMAIN = ".gongyedam.shop";

    private final HttpServletResponse resp;
    private final HttpServletRequest req;
    private final EntityManager entityManager;

    private SiteUser siteUser;

    public void setCrossDomainCookie(String tokenName, String token) {
        ResponseCookie cookie = ResponseCookie.from(tokenName, token)
                .domain(COOKIE_DOMAIN)
                .path("/")
                .sameSite("None")
                .secure(true)
                .httpOnly(true)
                .build();

        resp.addHeader("Set-Cookie", cookie.toString());
    }

    public String getCookie(String name) {
        Cookie[] cookies = req.getCookies();
        if (cookies == null || cookies.length == 0) return "";

        return Arrays.stream(cookies)
                .filter(cookie -> cookie.getName().equals(name))
                .findFirst()
                .map(Cookie::getValue)
                .orElse("");
    }

    public SiteUser getSiteUser() {
        if (isLogout()) return null;

        if (siteUser == null) {
            SecurityUser user = getUser();
            if (user == null) return null;
            siteUser = entityManager.getReference(SiteUser.class, user.getId());
        }

        return siteUser;
    }

    public void setLogin(SecurityUser securityUser) {
        SecurityContextHolder.getContext().setAuthentication(securityUser.getAuthentication());
    }

    private SecurityUser getUser() {
        return Optional.ofNullable(SecurityContextHolder.getContext())
                .map(context -> context.getAuthentication())
                .filter(authentication -> authentication != null && authentication.getPrincipal() instanceof SecurityUser)
                .map(authentication -> (SecurityUser) authentication.getPrincipal())
                .orElse(null);
    }

    private boolean isLogin() {
        return getUser() != null;
    }

    private boolean isLogout() {
        return !isLogin();
    }

    public void removeCrossDomainCookie(String tokenName) {
        expireCookie(tokenName, COOKIE_DOMAIN);
        expireCookie(tokenName, null);
    }

    private void expireCookie(String tokenName, String domainOrNull) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(tokenName, "")
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .secure(true)
                .httpOnly(true);

        if (domainOrNull != null && !domainOrNull.isBlank()) {
            builder.domain(domainOrNull);
        }

        resp.addHeader("Set-Cookie", builder.build().toString());
    }
}
