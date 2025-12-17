package com.gobang.gobang.domain.admin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;


// 임시용 컨트롤러

@RestController
@RequestMapping("/api/v1/admin")
public class ApiV1AdminController {


    //관리자 정보, 추후 시큐리티 연동 시 수정
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me() {
        return ResponseEntity.ok(Map.of(
                "id", 1,
                "email", "admin@example.com",
                "role", "ADMIN"
        ));
    }





}
