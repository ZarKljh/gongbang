package com.gobang.gobang.domain.image.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/v1/images")
public class StudioImageController {

    @Value("${custom.genFileDirPath}")
    private String uploadPath;


    @GetMapping("/studio/{fileName:.+}")
    public ResponseEntity<Resource> getStudioImage(@PathVariable String fileName) {
        try {
            Path path = Paths.get(uploadPath).resolve(fileName).normalize();

            if (!Files.exists(path)) {
                System.out.println("⚠ 파일 없음: " + path);
                return ResponseEntity.notFound().build();
            }

            byte[] bytes = Files.readAllBytes(path);
            String contentType = Files.probeContentType(path);
            if (contentType == null) {
                contentType = "image/png";
            }

            return ResponseEntity
                    .ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(new ByteArrayResource(bytes));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
