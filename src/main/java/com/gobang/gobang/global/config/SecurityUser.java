package com.gobang.gobang.global.config;

import lombok.Getter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

public class SecurityUser extends User {
    @Getter
    private long id;

    public SecurityUser(long id, String username, String password, Collection<? extends GrantedAuthority> authorities) {
        super(username, password, authorities);
        this.id = id;
    }

    public Authentication getAuthentication() {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                this, // principal (securityUser 자기 자신)
                this.getPassword(), // 비밀번호
                this.getAuthorities() // 권한 정보
        );

        return auth;
    }
}
