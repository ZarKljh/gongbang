package com.gobang.gobang.global.mail;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ShopMailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    public void sendShopRejectedMail(String toEmail, String studioName, String reasonText) {
        if (toEmail == null || toEmail.isBlank()) {
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(toEmail);
        message.setSubject("[공예담] 입점 신청 반려 안내");

        String body = """
                안녕하세요, 공예담입니다.

                신청해 주신 스튜디오 "%s"의 입점 신청이 검토 결과 '반려' 처리되었습니다.

                ─────────────────────────
                [반려 사유]
                %s
                ─────────────────────────

                보다 좋은 서비스 제공을 위해 최선을 다하겠습니다.
                추가 문의 사항이 있으시면 고객센터로 문의해 주세요.

                감사합니다.
                """.formatted(studioName, reasonText);

        message.setText(body);

        mailSender.send(message);
    }
}
