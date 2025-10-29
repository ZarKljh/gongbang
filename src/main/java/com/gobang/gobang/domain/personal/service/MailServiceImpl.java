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
    private static String senderEmail;

    @Override
    public MimeMessage createMail(String mail, String token) throws MessagingException {
        // 메일 내용을 생상하는 메서드
        // : 메일 주소와 JWT 토큰을 매개변수로 받음
        MimeMessage message = javaMailSender.createMimeMessage();
        message.setFrom(senderEmail); // 발신자 이메일 주소 설정
        message.setRecipients(MimeMessage.RecipientType.TO, mail); // 수신자 이메일 주소 설정
        message.setSubject("이메일 인증 링크"); // 이메일 제목 설정

        String body = "";
        body += "<h3>이메일 인증 링크입니다.</h3>";
        body += "<a href=\"http://localhost:4040/api/v1/mail/verify?token=" + token + "\">여기를 클릭하여 인증하세요</a>";
        body += "<p>감사합니다.</p>";

        message.setText(body, "UTF-8", "html");

        return message; // 생성된 MimeMessage 객체 반환
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
            return username;
        } catch (ExpiredJwtException e) {
            return "토큰이 만료되었습니다. 다시 진행해주세요.";
        }
    }
}