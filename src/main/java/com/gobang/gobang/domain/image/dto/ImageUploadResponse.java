package com.gobang.gobang.domain.image.dto;

import com.gobang.gobang.domain.image.entity.Image;
import lombok.Data;

@Data
public class ImageUploadResponse {
    private Long id;
    //private RefType refType;
    private Long refId;
    private String imageUrl;
    private Integer sortOrder;

    public ImageUploadResponse(Image image){
        this.id = image.getId();
        //this.refType = getRefType();
        this.refId = image.getRefId();
        this.imageUrl = image.getImageUrl();
        this.sortOrder = image.getSortOrder();
    }
}
