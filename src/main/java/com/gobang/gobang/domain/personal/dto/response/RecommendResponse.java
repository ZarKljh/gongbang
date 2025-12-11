package com.gobang.gobang.domain.personal.dto.response;

import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.domain.product.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
public class RecommendResponse {

    private List<Map<String, Object>> items;
    private String aiMessage;

    public static RecommendResponse from(
            List<Product> products,
            String message,
            ImageRepository imageRepository
    ) {
        List<Map<String, Object>> items = products.stream()
                .map(p -> {
                    String imageUrl = imageRepository
                            .findByRefTypeAndRefIdOrderBySortOrderAsc(Image.RefType.PRODUCT, p.getId())
                            .stream()
                            .findFirst()
                            .map(img -> "/images/" + img.getImageFileName())
                            .orElse(null);

                    Map<String, Object> map = new HashMap<>();
                    map.put("productId", p.getId());
                    map.put("productName", p.getName());
                    map.put("price", p.getBasePrice());
                    map.put("imageUrl", imageUrl);

                    return map;
                })
                .collect(Collectors.toList());

        return new RecommendResponse(items, message);
    }
}