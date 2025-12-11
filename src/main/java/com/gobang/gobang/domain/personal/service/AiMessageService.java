package com.gobang.gobang.domain.personal.service;


import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.domain.product.entity.Subcategory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AiMessageService {

    public String generateCategoryMessage(Product base, Subcategory sub) {

        if (sub != null) {
            return String.format(
                    "최근 '%s > %s' 취향을 기반으로 비슷한 스타일의 상품을 추천드렸어요.",
                    sub.getCategory().getName(),
                    sub.getName()
            );
        }

        return String.format(
                "'%s' 카테고리를 기반으로 유사한 상품을 추천드렸어요.",
                base.getCategoryId()
        );
    }

    public String generateContextualMessage(Product base, Subcategory sub, List<Product> list) {

        String name = base.getName();

        if (sub != null) {
            return String.format(
                    "%s와 비슷한 분위기의 상품들을 바탕으로 취향에 맞춰 추천해드렸어요. " +
                            "최근 많이 찾는 제품들도 함께 골라드렸으니 확인해보세요!",
                    sub.getName()
            );
        }

        return String.format(
                "%s를 기준으로 취향을 분석해 추천해드렸어요. " +
                        "새로 등록된 인기 상품들도 함께 담아드렸습니다.",
                name
        );
    }
}
