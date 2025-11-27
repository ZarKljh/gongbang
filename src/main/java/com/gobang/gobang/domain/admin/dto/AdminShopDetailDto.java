package com.gobang.gobang.domain.admin.dto;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.product.entity.Category;
import com.gobang.gobang.domain.seller.model.StudioStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminShopDetailDto {

    private Long id;

    private String studioName;
    private String studioEmail;

    private Long categoryId;
    private String categoryLabel;

    private String ownerUserName;
    private String ownerEmail;

    private StudioStatus status;

    private LocalDateTime createdAt;

    private String studioAddPostNumber;
    private String studioBusinessNumber;
    private String studioFax;
    private String studioMobile;
    private String studioOfficeTell;
    private String studioAddDetail;
    private String studioAddMain;

    private String studioMainImageUrl;
    private String studioMainImageName;
    private String studioLogoImageUrl;
    private String studioLogoImageName;
    private List<String> studioGalleryImageUrls;
    private List<String> studioGalleryImageNames;




    public static AdminShopDetailDto of(Studio s, Category category) {
        SiteUser owner = s.getSiteUser();

        String ownerName = null;
        String ownerEmail = null;

        if (owner != null) {
            if (owner.getNickName() != null && !owner.getNickName().isBlank()) {
                ownerName = owner.getNickName();
            } else if (owner.getFullName() != null && !owner.getFullName().isBlank()) {
                ownerName = owner.getFullName();
            } else {
                ownerName = owner.getUserName();
            }

            ownerEmail = owner.getEmail();
        }

        Long categoryId = s.getCategoryId();
        String categoryLabel = null;

        if (category != null) {
            if (categoryId == null) {
                categoryId = category.getId();
            }
            categoryLabel = category.getName();
        }

        return AdminShopDetailDto.builder()
                .id(s.getStudioId())
                .studioName(s.getStudioName())
                .studioEmail(s.getStudioEmail())

                .categoryId(s.getCategoryId())
                .categoryLabel(toCategoryLabel(s.getCategoryId()))

                .ownerUserName(ownerName)
                .ownerEmail(ownerEmail)

                .status(s.getStatus())
                .createdAt(s.getCreatedDate())

                .studioAddPostNumber(s.getStudioAddPostNumber())
                .studioBusinessNumber(s.getStudioBusinessNumber())
                .studioFax(s.getStudioFax())
                .studioMobile(s.getStudioMobile())
                .studioOfficeTell(s.getStudioOfficeTell())
                .studioAddDetail(s.getStudioAddDetail())
                .studioAddMain(s.getStudioAddMain())
                .build();
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
