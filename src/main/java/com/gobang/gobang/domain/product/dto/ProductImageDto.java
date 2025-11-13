package com.gobang.gobang.domain.product.dto;

import com.gobang.gobang.domain.image.entity.Image;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductImageDto {
    private Long id;
    private String imageUrl;         // 실제 이미지 경로
    private String imageFileName;    // 파일명
    private Long refId;              // 참조 대상 ID (상품, 리뷰 등)
    private Image.RefType refType;          // 참조 타입 (예: PRODUCT, REVIEW, BANNER 등)
    private Integer sortOrder;       // 정렬 순서
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;


    public ProductImageDto(Image image) {
        this.id = image.getId();
        this.imageUrl = image.getImageUrl();
        this.refId = image.getRefId();
        this.refType = image.getRefType();
        this.sortOrder = image.getSortOrder();
        this.createdDate = image.getCreatedDate();
        this.modifiedDate = image.getModifiedDate();
    }

}