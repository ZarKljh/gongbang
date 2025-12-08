package com.gobang.gobang.global.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    @Value("${custom.genFileDirPath}")
    private String uploadPath;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // 🔥 개발환경: 모든 도메인 허용
        config.addAllowedOriginPattern("*");
        config.addAllowedMethod("*");         // 모든 HTTP 메소드 허용
        config.addAllowedHeader("*");         // 모든 Header 허용
        config.setAllowCredentials(true);      // 쿠키/토큰 포함 요청 허용 (필요 없으면 false)

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config); // 모든 요청 경로 허용
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

}
