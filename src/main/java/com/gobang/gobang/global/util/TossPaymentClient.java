package com.gobang.gobang.global.util;

import com.gobang.gobang.domain.personal.dto.response.TossPaymentResponse;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;

@Component
public class TossPaymentClient {

    @Value("${toss.secret-key}")
    private String secretKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostConstruct
    public void check() {
        System.out.println("🔥 toss.secret-key = " + secretKey);
    }

    public TossPaymentResponse confirm(String paymentKey) {

        String url = "https://api.tosspayments.com/v1/payments/" + paymentKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(Base64.getEncoder()
                .encodeToString((secretKey + ":").getBytes()));
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<TossPaymentResponse> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        entity,
                        TossPaymentResponse.class
                );

        return response.getBody();
    }
}
