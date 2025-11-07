package com.gobang.gobang.domain.image.entity;

import com.gobang.gobang.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString(callSuper = true)
public class Image extends BaseEntity {


    /** REVIEW, PRODUCT, USER_PROFILE 등 */
    @Enumerated(EnumType.STRING)
    @Column(name = "ref_type", length = 50, nullable = false)
    private RefType refType;

    /** 참조 대상 PK (review_id, product_id, user_id 등) */
    @Column(name = "ref_id", nullable = false)
    private Long refId;

    /** 이미지 경로 또는 절대 URL */
//    @Column(name = "image_url", length = 255, nullable = false)
//    private String imageUrl;

            //테스트용 임시 hy
    @Column(name = "image_url", columnDefinition = "TEXT", nullable = false)
    private String imageUrl;  // ✅ TEXT 타입으로 변경

    /** 정렬 순서(대표=0 권장) */
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    /** DB 기본값을 안 쓰는 환경에서도 안전하게 세팅 */
    @PrePersist
    void onCreate() {
        if (sortOrder == null) sortOrder = 0;
    }

    public enum RefType {
        REVIEW, PRODUCT, USER_PROFILE, SELLER
    }
}
