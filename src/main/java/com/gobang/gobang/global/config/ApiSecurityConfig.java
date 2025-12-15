package com.gobang.gobang.global.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;


@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class ApiSecurityConfig {
    private final JwtAuthorizationFilter jwtAuthorizationFilter;
    private final WebConfig webConfig;
    @Bean
    SecurityFilterChain apiFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/api/**")
                .authorizeRequests(
                        authorizeRequests -> authorizeRequests
                                // 🔹 관리자/api/home
                                .requestMatchers(HttpMethod.GET, "/api/v1/admin/**").hasRole("ADMIN")
                                .requestMatchers(HttpMethod.POST, "/api/v1/admin/**").hasRole("ADMIN")

                                //메인페이지,목록페이지,상세페이지 게스트용 허용
                                .requestMatchers(HttpMethod.GET, "/api/v1/home/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/product/**").permitAll()
                                //.requestMatchers(HttpMethod.POST, "/api/v1/product/**").permitAll() //<<비로그인 사용자 상품 등록, 상품 수정/삭제 가능 .authenticated()로 변경해야함
                                .requestMatchers(HttpMethod.GET, "/api/v1/filter/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/category/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/theme/**").permitAll()

                                // 🔥 주문 관련은 반드시 로그인 필요
                                .requestMatchers(HttpMethod.POST, "/api/v1/orders/**").authenticated()
                                .requestMatchers(HttpMethod.GET, "/api/v1/orders/**").authenticated()

                                // 마이페이지 접속 시 로그인 필요
                                .requestMatchers("/api/v1/mypage/**").authenticated()

                                // 🔓 인증/회원/스튜디오 등 공개 API들
                                .requestMatchers(HttpMethod.GET, "/api/v1/auth/**").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/v1/auth/**").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/*/members/login").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/*/members/logout").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/studio/**").permitAll()
                                //.requestMatchers(HttpMethod.POST, "/api/v1/studio/**").permitAll() //<<셀러가 아니어도 누구나 스튜디오 생성 가능 .authenticated()로 변경해야함
                                .requestMatchers(HttpMethod.GET, "/api/v1/reviews/**").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/v1/reviews/**").authenticated()
                                .requestMatchers(HttpMethod.GET, "/api/v1/faq/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/faq/categories").permitAll()

                                .anyRequest().authenticated()
                )
                .csrf(
                        csrf -> csrf
                                .disable()
                ) // csrf 토큰 끄기
                .cors(cors -> cors.configurationSource(webConfig.corsConfigurationSource()))
                .httpBasic(
                        httpBasic -> httpBasic.disable()
                ) // httpBasic 로그인 방식 끄기
                .formLogin(
                        formLogin -> formLogin.disable()
                ) // 폼 로그인 방식 끄기
                .sessionManagement(
                        sessionManagement -> sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(
                        jwtAuthorizationFilter, // 엑세스 토큰을 이용한 로그인 처리
                        UsernamePasswordAuthenticationFilter.class
                );
        ;
        return http.build();
    }

}
