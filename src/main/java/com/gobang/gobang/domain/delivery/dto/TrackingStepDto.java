package com.gobang.gobang.domain.delivery.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TrackingStepDto {

    private final String location;
    private final String status;
    private final LocalDateTime time;
}
