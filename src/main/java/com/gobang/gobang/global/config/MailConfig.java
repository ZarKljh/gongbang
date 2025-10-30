package com.gobang.gobang.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {
    @Value("${spring.mail.host}")
    private String host; // 이메일 서버의 호스트 주소

    @Value("${spring.mail.port}")
    private int port; // 이메일 서버가 사용하는 포트 번호(587)

    @Value("${spring.mail.username}")
    private String username; // 발신자 이메일

    @Value("${spring.mail.password}")
    private String password; // 앱 비밀번호

    @Bean
    // 해당 메서드의 반환값을 Spring Bean으로 등록하여 다른 곳에서 주입받을 수 있도록 설정
    public JavaMailSender javaMailSender() {
        // JavaMailSender의 기본 구현체 생성
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();

        mailSender.setHost(host);
        mailSender.setPort(port);
        mailSender.setUsername(username);
        mailSender.setPassword(password);

        // 이메일 전송 시 사용할 추가 속성 설정을 위한 객체 생성
        Properties props = mailSender.getJavaMailProperties();

        // 이메일 사이트에게 전달? (dependencies는 스프링에게 전달)
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true"); // SMTP 인증 사용
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.debug", "true"); // 디버깅 활성화 - 메일 전송 시 로그 출력

        return mailSender;
    }
}