package com.gobang.gobang.global.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
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

        // ✔ 프론트 주소 두 개 허용 (PC, 모바일)
        config.setAllowedOrigins(List.of(
                "https://api.gongyedam.shop:3000",
                "https://gongyedam.shop:3000",
                "http://localhost:3000"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
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
