package com.gobang.gobang.domain.personal.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.personal.dto.request.SendMailRequestDto;
import com.gobang.gobang.domain.personal.service.MailService;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/mypage")
public class MailController {
    private final Map<String, String> emailCodeMap = new ConcurrentHashMap<>();
    private final Map<String, Long> emailExpireMap = new ConcurrentHashMap<>();
    private final JavaMailSender javaMailSender;
    private final SiteUserRepository siteUserRepository;

    @Value("${spring.mail.username}")
    private String senderEmail;

    // 메일 발송
    @PostMapping("/mail/send")
    public String sendEmail(@RequestBody SendMailRequestDto mailDto) throws MessagingException {
        if (mailDto == null || mailDto.getEmail() == null) {
            throw new IllegalArgumentException("email이 필요합니다.");
        }

        String username = mailDto.getUserName();
        if (username == null && mailDto.getUserId() != null) {
            SiteUser user = siteUserRepository.findById(mailDto.getUserId())
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
            username = user.getUserName();
        }

        // 6자리 랜덤 숫자 생성
        String code = String.format("%06d", new Random().nextInt(1000000));

        // 메모리에 저장 (3분 유효)
        emailCodeMap.put(mailDto.getEmail(), code);
        emailExpireMap.put(mailDto.getEmail(), System.currentTimeMillis() + 3 * 60 * 1000);

        // 메일 생성
        MimeMessage message = javaMailSender.createMimeMessage();
        message.setFrom(senderEmail);
        message.setRecipients(MimeMessage.RecipientType.TO, mailDto.getEmail());
        message.setSubject("이메일 인증 코드");
        message.setText(
                "<h3>이메일 인증 코드 안내</h3>" +
                        "<p>인증번호: <strong>" + code + "</strong></p>" +
                        "<p>3분 내 입력해주세요.</p>",
                "UTF-8",
                "html"
        );

        javaMailSender.send(message);
        return "메일 발송 완료";
    }

    // 인증 확인
    @PostMapping("/mail/verify")
    public Map<String, String> verifyEmail(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String token = body.get("token");

        Map<String, String> res = new HashMap<>();
        String savedCode = emailCodeMap.get(email);
        Long expireTime = emailExpireMap.get(email);

        if (savedCode == null || expireTime == null || System.currentTimeMillis() > expireTime) {
            res.put("status", "expired");
        } else if (savedCode.equals(token)) {
            res.put("status", "success");
            emailCodeMap.remove(email);
            emailExpireMap.remove(email);
        } else {
            res.put("status", "error");
        }
        return res;
    }
}