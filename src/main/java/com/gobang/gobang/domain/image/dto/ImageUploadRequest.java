package com.gobang.gobang.domain.image.dto;

import com.gobang.gobang.domain.image.entity.Image;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ImageUploadRequest {
    /** 이미지 파일 */
    private MultipartFile file;

    /** 참조 타입 (REVIEW, PRODUCT, USER_PROFILE, SELLER 등) */
    private Image.RefType refType;

    /** 참조 대상 ID */
    private Long refId;

    /** 정렬 순서 (대표 이미지 = 0) */
    private Integer sortOrder = 0;

    /*
    STUDIO: 공방내부사진, 회원가입심사용
    STUDIO_MAIN: 공방대표이미지
    STUDIO_LOGO: 공방로고이미지
    */

}
