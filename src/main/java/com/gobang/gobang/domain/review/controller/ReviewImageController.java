package com.gobang.gobang.domain.review.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewImageController {

    private final String uploadDir = System.getProperty("user.dir") + "/uploads/";

    @PostMapping("images/upload")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        // 폴더 없으면 생성
        File directory = new File(uploadDir);
        if (!directory.exists()) directory.mkdirs();

        // 파일명 UUID로 변경
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String newFilename = UUID.randomUUID() + extension;

        // 실제 저장
        Path path = Paths.get(uploadDir + newFilename);
        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

        // 접근 가능한 URL 반환 (Spring static mapping 필요)
        String imageUrl = "/uploads/" + newFilename;
        return ResponseEntity.ok(imageUrl);
    }
}
