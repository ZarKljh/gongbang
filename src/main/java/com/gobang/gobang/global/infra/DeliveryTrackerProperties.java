package com.gobang.gobang.global.infra;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "delivery-tracker")
public class DeliveryTrackerProperties {
    private String clientId;
    private String clientSecret;
}
