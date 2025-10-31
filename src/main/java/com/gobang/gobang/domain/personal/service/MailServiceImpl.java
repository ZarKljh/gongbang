package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.global.jwt.JwtProvider;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailServiceImpl implements MailService {

    private final JavaMailSender javaMailSender;
    private final JwtProvider jwtProvider;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Override
    public MimeMessage createMail(String mail, String token) throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        message.setFrom(senderEmail);
        message.setRecipients(MimeMessage.RecipientType.TO, mail);
        message.setSubject("이메일 인증번호 안내");

        // body에 인증번호(token) 직접 표시
        String body = "";
        body += "<h3>이메일 인증번호 안내</h3>";
        body += "<p>인증번호: <strong>" + token + "</strong></p>";
        body += "<p>해당 인증번호를 사이트에 입력하여 인증을 완료해주세요.</p>";
        body += "<p>감사합니다.</p>";

        message.setText(body, "UTF-8", "html");
        return message;
    }

    @Override
    public String sendSimpleMessage(String sendEmail, String username) throws MessagingException {
        String token = jwtProvider.generateEmailValidToken(username);

        MimeMessage message = createMail(sendEmail, token);

        try {
            javaMailSender.send(message);
        } catch (MailException e) {
            e.printStackTrace();
            return "메일 발송 중 오류가 발생하였습니다.";
        }
        return token;
    }

    // 인증 만료 시 적절한 에러 반환을 위해 try-catch 구문 사용
    @Override
    public String verifyEmail(String token) {
        try {
            String username = jwtProvider.getUsernameFromEmailJwt(token);
            System.out.println("이메일 인증이 완료되었습니다. 사용자명: " + username);
            return "success";
        } catch (ExpiredJwtException e) {
            return "토큰이 만료되었습니다. 다시 진행해주세요.";
        }
    }
}