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


            // 1차 카테고리
            categoryService.InitCategory("Mood", "감성소품", "", 1);
            categoryService.InitCategory("Mini", "스몰굿즈", "", 2);
            categoryService.InitCategory("Fabric", "패브릭소품", "", 3);
            categoryService.InitCategory("Aroma", "향/아로마", "", 4);
            categoryService.InitCategory("Light", "조명/무드등", "", 5);
            categoryService.InitCategory("Rest", "휴식용품", "", 6);


            // 서브카테고리 시작
            // 감성소품 (Mood)
            categoryService.initSubCategory("Mood", "MoodLight", "무드조명", 1);
            categoryService.initSubCategory("Mood", "DisplayShelf", "소품진열장", 2);
            categoryService.initSubCategory("Mood", "DeskDeco", "탁상데코", 3);

            // 스몰굿즈 (Mini)
            categoryService.initSubCategory("Mini", "Keyring", "키링/뱃지", 1);
            categoryService.initSubCategory("Mini", "Sticker", "스티커/엽서", 2);
            categoryService.initSubCategory("Mini", "Toy", "인형/피규어", 3);

            // 패브릭소품 (Fabric)
            categoryService.initSubCategory("Fabric", "Cushion", "쿠션/방석", 1);
            categoryService.initSubCategory("Fabric", "Rug", "러그/매트", 2);
            categoryService.initSubCategory("Fabric", "Curtain", "커튼/패브릭포스터", 3);

            // 향/아로마 (Aroma)
            categoryService.initSubCategory("Aroma", "Diffuser", "디퓨저", 1);
            categoryService.initSubCategory("Aroma", "Candle", "캔들", 2);
            categoryService.initSubCategory("Aroma", "Incense", "인센스", 3);

            // 조명/무드등 (Light)
            categoryService.initSubCategory("Light", "Stand", "스탠드", 1);
            categoryService.initSubCategory("Light", "Lamp", "무드램프", 2);
            categoryService.initSubCategory("Light", "LED", "LED소품", 3);

            // 휴식용품 (Rest)
            categoryService.initSubCategory("Rest", "Massage", "안마용품", 1);
            categoryService.initSubCategory("Rest", "Sleep", "수면용품", 2);
            categoryService.initSubCategory("Rest", "Sound", "힐링음향기기", 3);

            System.out.println("✅ 카테고리 데이터 초기화 완료!");
        };
    }
}
