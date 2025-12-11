package com.gobang.gobang.domain.delivery.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TrackingStepDto {

    private String location;
    private String status;
    private String statusCode;
    private String driverPhone;
    private LocalDateTime time;
}
