package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.personal.dto.request.SendMailRequestDto;
import com.gobang.gobang.domain.personal.service.MailService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/mail")
public class MailController {
    private final MailService mailService;

    // 메일 발송
    @PostMapping("/send")
    public String sendEmail(@RequestBody SendMailRequestDto mailDto) throws MessagingException {
        if (mailDto.getEmail() == null || mailDto.getUsername() == null) {
            throw new IllegalArgumentException("email 또는 username이 없습니다.");
        }
        return mailService.sendSimpleMessage(mailDto.getEmail(), mailDto.getUsername());
    }

    // 인증 후 메세지 조회
    @GetMapping("/verify")
    public String verifyEmail(@RequestParam String token) {
        return mailService.verifyEmail(token);
    }
}