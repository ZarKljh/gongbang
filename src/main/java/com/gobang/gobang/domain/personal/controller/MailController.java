package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.personal.dto.request.SendMailRequestDto;
import com.gobang.gobang.domain.personal.service.MailService;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/mypage")
public class MailController {
    private final MailService mailService;
    private final SiteUserRepository siteUserRepository;

    // 메일 발송
    @PostMapping("/mail/send")
    public String sendEmail(@RequestBody SendMailRequestDto mailDto) throws MessagingException {
        if (mailDto.getEmail() == null && mailDto.getUserId() == null) {
            throw new IllegalArgumentException("email 또는 userId가 필요합니다.");
        }

        String username = mailDto.getUserName();
        if (username == null && mailDto.getUserId() != null) {
            // DB에서 사용자 이름 조회
            SiteUser user = siteUserRepository.findById(mailDto.getUserId())
                    .orElseThrow(() -> new RuntimeException("❌ 사용자를 찾을 수 없습니다."));
            username = user.getUserName();
        }

        return mailService.sendSimpleMessage(mailDto.getEmail(), username);
    }

    // 인증 후 메세지 조회
    @GetMapping("/mail/verify")
    public Map<String, String> verifyEmail(@RequestParam String token) {
        Map<String, String> res = new HashMap<>();
        try {
            String username = mailService.verifyEmail(token); // JWT 검증
            res.put("status", "success");
            res.put("username", username);
        } catch (ExpiredJwtException e) {
            res.put("status", "expired");
        } catch (Exception e) {
            res.put("status", "error");
        }
        return res;
    }
}