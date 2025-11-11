package com.gobang.gobang.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    /*공방이미지 저장을 위한 저장폴더 선언*/
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 로컬 이미지 폴더
        registry.addResourceHandler("/images/**") // 요청 경로
                .addResourceLocations("file:C:/gongbangImg/");
        
        // 프로젝트 내부 uploads 폴더
        String uploadPath = System.getProperty("user.dir") + "/uploads/";
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadPath);
 
    }
}
