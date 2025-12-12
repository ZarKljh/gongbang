package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.product.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@Builder
public class RecommendResponse {

    private List<Item> items;
    private String aiMessage;

    @Getter
    @AllArgsConstructor
    public static class Item {
        private Long productId;
        private String name;
        private Integer price;
        private String imageUrl;
    }

    public static RecommendResponse from(
            List<Product> products,
            String aiMessage,
            Map<Long, String> imageMap
    ) {
        List<Item> items = products.stream()
                .map(product -> {
                    String fileName = imageMap.get(product.getId());

                    String imageUrl = (fileName != null)
                            ? "/images/" + fileName    // ⇒ 여기서만 URL 조립
                            : "/images/default-product.png";

                    return new Item(
                            product.getId(),
                            product.getName(),
                            product.getBasePrice(),
                            imageUrl
                    );
                })
                .toList();

        return new RecommendResponse(items, aiMessage);
    }
}