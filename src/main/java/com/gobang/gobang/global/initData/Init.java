package com.gobang.gobang.global.initData;

import com.gobang.gobang.domain.product.category.service.CategoryService;
import com.gobang.gobang.domain.product.filter.service.FilterService;
import com.gobang.gobang.domain.product.theme.service.ThemeService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Init {

    @Bean
    CommandLineRunner initData(ThemeService themeService, CategoryService categoryService, FilterService filterService) {
        return args -> {
            themeService.InitTheme("Gift", "선물추천테마 GIFT", "", 1);
            themeService.InitTheme("Healing", "힐링/휴식", "", 2);
            themeService.InitTheme("Interior", "인테리어 소품", "", 3);

            System.out.println("✅ 테마 데이터 초기화 완료!");


            // 1차 카테고리
            categoryService.initCategory("Mood", "감성소품", "", 1);
            categoryService.initCategory("Mini", "스몰굿즈", "", 2);
            categoryService.initCategory("Fabric", "패브릭소품", "", 3);
            categoryService.initCategory("Aroma", "향/아로마", "", 4);
            categoryService.initCategory("Light", "조명/무드등", "", 5);
            categoryService.initCategory("Rest", "휴식용품", "", 6);


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


            filterService.initGroupFilter("Mood", "style", "분위기", 1, false, true);
            filterService.initGroupFilter("Mood", "PACKAGE", "포장옵션", 1, false, true);

            // 2) 스몰굿즈
            filterService.initGroupFilter("Mini", "COLOR", "색상", 1, false, true);
            filterService.initGroupFilter("Mini", "DESIGN", "디자인", 2, false, true);
            filterService.initGroupFilter("Mini", "PRICE", "가격대", 99, true, true);

            // 3) 패브릭소품
            filterService.initGroupFilter("Fabric", "MATERIAL", "소재", 1, false, true);
            filterService.initGroupFilter("Fabric", "COLOR", "색상", 2, false, true);
            filterService.initGroupFilter("Fabric", "SIZE", "사이즈", 3, false, true);
            filterService.initGroupFilter("Fabric", "PRICE", "가격대", 99, true, true);

            // 4) 향/아로마
            filterService.initGroupFilter("Aroma", "SCENT", "향", 1, false, true);
            filterService.initGroupFilter("Aroma", "DURATION", "지속시간", 2, false, true);
            filterService.initGroupFilter("Aroma", "REFILL", "리필가능", 3, false, true);
            filterService.initGroupFilter("Aroma", "PRICE", "가격대", 99, true, true);

            // 5) 조명/무드등
            filterService.initGroupFilter("Light", "BRIGHTNESS", "밝기", 1, false, true);
            filterService.initGroupFilter("Light", "COLOR_TEMP", "색온도", 2, false, true);
            filterService.initGroupFilter("Light", "POWER_TYPE", "충전방식", 3, false, true);
            filterService.initGroupFilter("Light", "PRICE", "가격대", 99, true, true);

            // 휴식용품(1차) 공통 필수 세트
            filterService.initGroupFilter("Rest", "rest_type",   "휴식타입",  1, false, true);
            filterService.initGroupFilter("Rest", "target_area", "사용부위",  2, false, true);
            filterService.initGroupFilter("Rest", "color",       "색상",      4, false, true);
            filterService.initGroupFilter("Rest", "price",       "가격대",   99, true,  true); // 전역

            System.out.println("✅ 필터 데이터 초기화 완료!");
        };
    }
}
