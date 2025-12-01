package com.gobang.gobang.domain.seller.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductAddRequest {
    private Long studioId;
    private String name;
    private String slug;
    private Long categornId;
    private Long subcategoryId;
    private String subtitle;
    private Integer basePrives;
    private Integer StockQuantity;
    private Boolean backorderable;
    private Boolean active;
    private String status;
}
