package com.gobang.gobang.domain.delivery.infrastructure;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class CarrierCodeMapper {

    private final Map<String, String> nameToCode = new HashMap<>();

    public CarrierCodeMapper() {
        // tracker.delivery에서 제공하는 리스트에 맞춰 등록
        nameToCode.put("CJ대한통운", "kr.cjlogistics");
        nameToCode.put("한진택배", "kr.hanjin");
        nameToCode.put("롯데택배", "kr.lotte");
        nameToCode.put("우체국택배", "kr.epost");
        // 필요에 따라 계속 추가
    }

    public String toCarrierCode(String courierName) {
        if (courierName == null) return null;
        return nameToCode.getOrDefault(courierName, null);
    }
}
