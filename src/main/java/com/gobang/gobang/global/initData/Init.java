package com.gobang.gobang.global.initData;

import com.gobang.gobang.domain.product.themaService.ThemeService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Init {

    @Bean
    CommandLineRunner initData(ThemeService themeService) {
        return args -> {
            themeService.InitTheme("Gift", "선물추천테마 GIFT", "", 1);
            themeService.InitTheme("Healing", "힐링/휴식", "", 2);
            themeService.InitTheme("Interior", "인테리어 소품", "", 3);

            System.out.println("✅ 테마 데이터 초기화 완료!");
        };
    }
}
