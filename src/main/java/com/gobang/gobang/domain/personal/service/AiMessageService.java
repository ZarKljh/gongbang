package com.gobang.gobang.domain.personal.service;


import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.domain.product.entity.Subcategory;
import org.springframework.stereotype.Service;

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
}
