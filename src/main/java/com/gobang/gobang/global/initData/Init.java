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

            // 감성소품 (Mood)
            filterService.initGroupFilter("Mood", "STYLE", "분위기", 1, false, true);
            filterService.initGroupFilter("Mood", "PACKAGE", "포장옵션", 1, false, true);
            filterService.initGroupFilter("Mood", "PRICE", "가격대", 99, true, true);

            // 2) 스몰굿즈
            filterService.initGroupFilter("Mini", "COLOR", "색상", 1, false, true);
            filterService.initGroupFilter("Mini", "DESIGN", "디자인", 2, false, true);
            filterService.initGroupFilter("Mini", "PRICE", "가격대", 99, true, true);

            // 3) 패브릭소품
            filterService.initGroupFilter("Fabric", "MATERIAL", "소재", 1, false, true);
            filterService.initGroupFilter("Fabric", "COLOR", "색상", 2, false, true);
            filterService.initGroupFilter("Fabric", "PRICE", "가격대", 99, true, true);

            // 4) 향/아로마
            filterService.initGroupFilter("Aroma", "SCENT", "향", 1, false, true);
            filterService.initGroupFilter("Aroma", "DURATION", "지속시간", 2, false, true);
            //filterService.initGroupFilter("Aroma", "REFILL", "리필가능", 3, false, true);
            filterService.initGroupFilter("Aroma", "PRICE", "가격대", 99, true, true);

            // 5) 조명/무드등
            filterService.initGroupFilter("Light", "BRIGHTNESS", "밝기", 1, false, true);
            filterService.initGroupFilter("Light", "COLOR_TEMP", "색온도", 2, false, true);
            //filterService.initGroupFilter("Light", "POWER_TYPE", "충전방식", 3, false, true);
            filterService.initGroupFilter("Light", "PRICE", "가격대", 99, true, true);

            // 휴식용품(1차) 공통 필수 세트
            filterService.initGroupFilter("Rest", "REST_TYPE",   "휴식타입",  1, false, true);
            //filterService.initGroupFilter("Rest", "target_area", "사용부위",  2, false, true);
            filterService.initGroupFilter("Rest", "COLOR",       "색상",      4, false, true);
            filterService.initGroupFilter("Rest", "PRICE",       "가격대",   99, true,  true); // 전역

            // 필터항목
            // 🌿 감성소품 (Mood)
            filterService.initOption("Mood", "STYLE", "따뜻한", "WARM", 1, "CHECKBOX", "MULTI");
            filterService.initOption("Mood", "STYLE", "미니멀", "MINIMAL", 2, "CHECKBOX", "MULTI");

            filterService.initOption("Mood", "PACKAGE", "기본포장", "BASIC", 1, "RADIO", "SINGLE");
            filterService.initOption("Mood", "PACKAGE", "선물포장", "GIFT", 2, "RADIO", "SINGLE");

            filterService.initOption("Mood", "PRICE", "~1만원", "UNDER_10000", 1, "CHIP", "SINGLE");
            filterService.initOption("Mood", "PRICE", "1~3만원", "RANGE_1_3", 2, "CHIP", "SINGLE");


// ☕ 스몰굿즈 (Mini)
            filterService.initOption("Mini", "COLOR", "화이트", "WHITE", 1, "COLOR", "MULTI");
            filterService.initOption("Mini", "COLOR", "베이지", "BEIGE", 2, "COLOR", "MULTI");

            filterService.initOption("Mini", "DESIGN", "캐릭터", "CHARACTER", 1, "CHECKBOX", "MULTI");
            filterService.initOption("Mini", "DESIGN", "심플", "SIMPLE", 2, "CHECKBOX", "MULTI");

            filterService.initOption("Mini", "PRICE", "~2만원", "UNDER_20000", 1, "CHIP", "SINGLE");
            filterService.initOption("Mini", "PRICE", "2~4만원", "RANGE_2_4", 2, "CHIP", "SINGLE");


// 🧵 패브릭소품 (Fabric)
            filterService.initOption("Fabric", "MATERIAL", "면", "COTTON", 1, "CHECKBOX", "MULTI");
            filterService.initOption("Fabric", "MATERIAL", "극세사", "MICROFIBER", 2, "CHECKBOX", "MULTI");

            filterService.initOption("Fabric", "COLOR", "아이보리", "IVORY", 1, "COLOR", "MULTI");
            filterService.initOption("Fabric", "COLOR", "그레이", "GRAY", 2, "COLOR", "MULTI");

            filterService.initOption("Fabric", "PRICE", "~2만원", "UNDER_20000", 1, "CHIP", "SINGLE");
            filterService.initOption("Fabric", "PRICE", "2~4만원", "RANGE_2_4", 2, "CHIP", "SINGLE");


// 🌸 향/아로마 (Aroma)
            filterService.initOption("Aroma", "SCENT", "플로럴", "FLORAL", 1, "CHECKBOX", "MULTI");
            filterService.initOption("Aroma", "SCENT", "머스크", "MUSK", 2, "CHECKBOX", "MULTI");

            filterService.initOption("Aroma", "DURATION", "약 2시간", "HOUR_2", 1, "RADIO", "SINGLE");
            filterService.initOption("Aroma", "DURATION", "약 4시간", "HOUR_4", 2, "RADIO", "SINGLE");

            filterService.initOption("Aroma", "PRICE", "~2만원", "UNDER_20000", 1, "CHIP", "SINGLE");
            filterService.initOption("Aroma", "PRICE", "2~4만원", "RANGE_2_4", 2, "CHIP", "SINGLE");


// 💡 조명/무드등 (Light)
            filterService.initOption("Light", "BRIGHTNESS", "약함", "LOW", 1, "RADIO", "SINGLE");
            filterService.initOption("Light", "BRIGHTNESS", "강함", "HIGH", 2, "RADIO", "SINGLE");

            filterService.initOption("Light", "COLOR_TEMP", "2700K (따뜻한빛)", "TEMP_2700", 1, "SELECT", "SINGLE");
            filterService.initOption("Light", "COLOR_TEMP", "6500K (밝은빛)", "TEMP_6500", 2, "SELECT", "SINGLE");

            filterService.initOption("Light", "PRICE", "~3만원", "UNDER_30000", 1, "CHIP", "SINGLE");
            filterService.initOption("Light", "PRICE", "3만원 이상", "OVER_30000", 2, "CHIP", "SINGLE");


// 🧘‍♀️ 휴식용품 (Rest)
            filterService.initOption("Rest", "REST_TYPE", "안대", "EYE_MASK", 1, "CHECKBOX", "MULTI");
            filterService.initOption("Rest", "REST_TYPE", "마사지기", "MASSAGER", 2, "CHECKBOX", "MULTI");

            filterService.initOption("Rest", "COLOR", "베이지", "BEIGE", 1, "COLOR", "MULTI");
            filterService.initOption("Rest", "COLOR", "네이비", "NAVY", 2, "COLOR", "MULTI");

            filterService.initOption("Rest", "PRICE", "~3만원", "UNDER_30000", 1, "CHIP", "SINGLE");
            filterService.initOption("Rest", "PRICE", "3만원 이상", "OVER_30000", 2, "CHIP", "SINGLE");



            System.out.println("✅ 필터 데이터 초기화 완료!");
        };
    }
}
