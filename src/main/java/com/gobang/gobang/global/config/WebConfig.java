package com.gobang.gobang.global.config;

import com.gobang.gobang.domain.metrics.interceptor.VisitorLogInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {
    private final VisitorLogInterceptor visitorLogInterceptor;



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



    // 이미지 파일명 접근
     @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 로컬 이미지 폴더
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:C:/gongbangImg/");

        // 프로젝트 내부 uploads 폴더
        String uploadPath = System.getProperty("user.dir") + "/uploads/";
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + System.getProperty("user.dir") + "/uploads/");
 
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(visitorLogInterceptor)
                // 방문 기록을 남길 URL 패턴
                .addPathPatterns("/**")
                // 여기서 다시 한 번 제외 패턴 지정해도 됨
                .excludePathPatterns(
                        "/api/v1/admin/**",
                        "/api/v1/admin/metrics/**",
                        "/css/**",
                        "/js/**",
                        "/images/**",
                        "/webjars/**"
                );
    }
}
