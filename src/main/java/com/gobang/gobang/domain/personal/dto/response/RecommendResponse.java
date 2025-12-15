package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.domain.product.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
public class RecommendResponse {

    private List<Item> items;
    private String aiMessage;

    @Data
    @AllArgsConstructor
    public static class Item {
        private Long productId;
        private String productName;
        private String imageUrl;
        private int price;
    }

    public static RecommendResponse from(List<Product> products, String aiMessage, ImageRepository imageRepository) {

        List<Item> itemList = products.stream()
                .map(p -> {

                    // 각 상품마다 이미지 1개씩 가져오기
                    String imageUrl = imageRepository
                            .findByRefTypeAndRefIdOrderBySortOrderAsc(Image.RefType.PRODUCT, p.getId())
                            .stream()
                            .findFirst()
                            .map(img -> "/images/" + img.getImageFileName())
                            .orElse(null);

                    return new Item(
                            p.getId(),
                            p.getName(),
                            imageUrl,
                            p.getBasePrice()
                    );
                })
                .collect(Collectors.toList());

        return new RecommendResponse(itemList, aiMessage);
    }
}