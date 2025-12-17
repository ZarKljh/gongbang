package com.gobang.gobang.global.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    @Value("${custom.genFileDirPath}")
    private String uploadPath;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "https://gongyedam.shop",         // 운영 환경 프론트 (표준 HTTPS)
                "https://www.gongyedam.shop",     // www 포함 주소
                "http://localhost:3000",          // 로컬 개발 환경
                "http://43.202.46.218:3000"       // 만약 IP로 직접 접속하는 경우 (필요시)
        ));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization")); // JWT를 헤더로 보낸다면 필수 추가
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 모든 경로(/**)에 대해 위 설정 적용
        source.registerCorsConfiguration("/**", config);
        return source;
    }



    // 이미지 파일명 접근
     @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
         // uploadPath 끝에 슬래시가 없으면 추가
         String path = uploadPath.endsWith("/") ? uploadPath : uploadPath + "/";
         registry.addResourceHandler("/images/**")
                 .addResourceLocations("file:" + path);

        // 프로젝트 내부 uploads 폴더 (테스트 데이터용으로 살려둠)
        String staticUploadPath = System.getProperty("user.dir") + "/uploads/";
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + staticUploadPath);
    }

    // ai 리뷰 요약 타임아웃 시간 늘리기
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .requestFactory(() -> {
                    SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
                    factory.setConnectTimeout(5000);  // 5초
                    factory.setReadTimeout(60000);    // 30초
                    return factory;
                })
                .build();
    }
}
