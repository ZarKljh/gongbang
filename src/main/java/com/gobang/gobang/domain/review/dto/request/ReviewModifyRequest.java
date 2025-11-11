package com.gobang.gobang.domain.review.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ReviewModifyRequest {
    @NotNull
    private Integer rating;

    @NotBlank
    private String content;

    private List<String> imageUrls = new ArrayList<>();
}