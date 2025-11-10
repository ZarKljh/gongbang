package com.gobang.gobang.domain.seller.dto;

import com.gobang.gobang.domain.image.entity.Image;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StudioSimpleDto {
    private Long studioId;
    private String studioName;
    private Image studioLogoImage;
}
