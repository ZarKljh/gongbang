package com.gobang.gobang.domain.product.dto;

import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.seller.model.StudioStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudioDto {

    private Long studioId;
    private Long siteUserId;
    private String studioName;
    private String studioDescription;
    private String studioMobile;
    private String studioOfficeTell;
    private String studioFax;
    private String studioEmail;
    private String studioBusinessNumber;
    private String studioAddPostNumber;
    private String studioAddMain;
    private String studioAddDetail;
    private Long categoryId;
    private String studioImg;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private StudioStatus status;

    // ⭐ 생성자 방식
    public StudioDto(
            Studio studio
    ) {
        this.studioId = studio.getStudioId();
        this.siteUserId = (studio.getSiteUser() != null ? studio.getSiteUser().getId() : null);
        this.studioName = studio.getStudioName();
        this.studioDescription = studio.getStudioDescription();
        this.studioMobile = studio.getStudioMobile();
        this.studioOfficeTell = studio.getStudioOfficeTell();
        this.studioFax = studio.getStudioFax();
        this.studioEmail = studio.getStudioEmail();
        this.studioBusinessNumber = studio.getStudioBusinessNumber();
        this.studioAddPostNumber = studio.getStudioAddPostNumber();
        this.studioAddMain = studio.getStudioAddMain();
        this.studioAddDetail = studio.getStudioAddDetail();
        this.categoryId = studio.getCategoryId();
        this.studioImg = studio.getStudioImg();
        this.createdDate = studio.getCreatedDate();
        this.updatedDate = studio.getUpdatedDate();
        this.status = studio.getStatus();
    }
    // ⭐⭐ 팩토리 메서드: Entity → DTO
    public static StudioDto fromEntity(Studio studio) {
        return new StudioDto(
                studio.getStudioId(),
                studio.getSiteUser() != null ? studio.getSiteUser().getId() : null,
                studio.getStudioName(),
                studio.getStudioDescription(),
                studio.getStudioMobile(),
                studio.getStudioOfficeTell(),
                studio.getStudioFax(),
                studio.getStudioEmail(),
                studio.getStudioBusinessNumber(),
                studio.getStudioAddPostNumber(),
                studio.getStudioAddMain(),
                studio.getStudioAddDetail(),
                studio.getCategoryId(),
                studio.getStudioImg(),
                studio.getCreatedDate(),
                studio.getUpdatedDate(),
                studio.getStatus()
        );
    }
}