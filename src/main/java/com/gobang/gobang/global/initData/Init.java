package com.gobang.gobang.global.initData;

import com.gobang.gobang.domain.product.category.Service.CategoryService;
import com.gobang.gobang.domain.product.theme.Service.ThemeService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Init {

    @Bean
    CommandLineRunner initData(ThemeService themeService, CategoryService categoryService) {
        return args -> {
            themeService.InitTheme("Gift", "선물추천테마 GIFT", "", 1);
            themeService.InitTheme("Healing", "힐링/휴식", "", 2);
            themeService.InitTheme("Interior", "인테리어 소품", "", 3);

            System.out.println("✅ 테마 데이터 초기화 완료!");

            categoryService.InitCategory("Mood", "감성소품", "", 1);
            categoryService.InitCategory("Mini", "스몰굿즈", "", 2);
            categoryService.InitCategory("Fabric", "패브릭소품", "", 3);
            categoryService.InitCategory("Aroma", "향/아로마", "", 4);
            categoryService.InitCategory("Light", "조명/무드등", "", 5);
            categoryService.InitCategory("Rest", "휴식용품", "", 6);

            System.out.println("✅ 카테고리 데이터 초기화 완료!");
        };
    }
}
