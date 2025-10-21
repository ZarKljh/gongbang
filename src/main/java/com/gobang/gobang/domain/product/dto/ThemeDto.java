package com.gobang.gobang.domain.product.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ThemeDto {
    private Long id;
    private String name;
    private String code;

}