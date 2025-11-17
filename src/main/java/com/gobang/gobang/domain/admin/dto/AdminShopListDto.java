package com.gobang.gobang.domain.admin.dto;

import com.gobang.gobang.domain.auth.entity.Studio;

import java.time.LocalDateTime;

public record AdminShopListDto(
        Long id,
        String studioName,
        String studioEmail,
        Long categoryId,
        String categoryLabel,
        String ownerUserName,
        String ownerEmail,
        String status,
        LocalDateTime createdAt) {
    public static AdminShopListDto of(Studio s) {
        return new AdminShopListDto(
                s.getStudioId(),
                s.getStudioName(),
                s.getStudioEmail(),
                s.getCategoryId(),
                toCategoryLabel(s.getCategoryId()),                            // 🔹 여기서 라벨 세팅

                s.getSiteUser() != null ? s.getSiteUser().getUserName() : null,
                s.getSiteUser() != null ? s.getSiteUser().getEmail() : null,
                s.getStatus() != null ? s.getStatus().name() : null,
                s.getCreatedDate()
        );
    }

    private static String toCategoryLabel(Long categoryId) {
        if (categoryId == null) return null;

        return switch (categoryId.intValue()) {
            case 1  -> "캔들/디퓨저";
            case 2  -> "비누/화장품";
            case 3  -> "가죽공예";
            case 4  -> "목공/가구";
            case 5  -> "도자기/세라믹";
            case 6  -> "금속/주얼리";
            case 7  -> "섬유/자수";
            case 8  -> "드로잉/일러스트";
            case 9  -> "플라워/식물";
            case 10 -> "종이공예/북아트";
            case 11 -> "레진/몰드공예";
            case 12 -> "향/아로마";
            case 13 -> "키즈/DIY 키트";
            case 14 -> "반려동물용품";
            case 15 -> "유리공예";
            case 16 -> "천연염색/직조";
            case 17 -> "미니어처/디오라마";
            case 18 -> "업사이클링";
            case 19 -> "종이접기/오리가미";
            case 20 -> "조명/무드등";
            case 21 -> "휴식용품";
            case 22 -> "수제간식/천연식품";
            case 23 -> "디지털아트/프린팅";
            case 24 -> "전통공예";
            case 25 -> "DIY 전자키트";
            case 26 -> "감성소품";
            case 27 -> "스몰굿즈";
            default -> "기타";
        };
    }
}

