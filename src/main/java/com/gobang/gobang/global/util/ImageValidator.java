package com.gobang.gobang.global.util;

import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.Set;

// 유해 이미지 검증용 유틸
public class ImageValidator {

    private static final Set<String> ALLOWED_EXT = Set.of("jpg", "jpeg", "png", "webp", "jfif");
    private static final long MAX_SIZE = 10 * 1024 * 1024; // 10MB

    public static void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("이미지가 비어있습니다.");
        }

        // 1) 확장자 검사
        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.contains(".")) {
            throw new IllegalArgumentException("잘못된 이미지 형식입니다.");
        }

        String ext = originalName.substring(originalName.lastIndexOf(".") + 1).toLowerCase();
        if (!ALLOWED_EXT.contains(ext)) {
            throw new IllegalArgumentException("허용되지 않은 이미지 형식입니다. (jpg, png, webp, jfif 가능)");
        }

        // 2) 파일 크기 검사
        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("이미지 파일 크기는 10MB 이하만 가능합니다.");
        }

        // 3) 실제 이미지인지 검사 (위조파일 차단)
        try {
            BufferedImage img = ImageIO.read(file.getInputStream());
            if (img == null) {
                throw new IllegalArgumentException("정상적인 이미지 파일이 아닙니다.");
            }

            int width = img.getWidth();
            int height = img.getHeight();

            if (width <= 0 || height <= 0) {
                throw new IllegalArgumentException("손상된 이미지입니다.");
            }

        } catch (IOException e) {
            throw new IllegalArgumentException("이미지 파일을 처리할 수 없습니다.");
        }
    }
}
