package com.gobang.gobang.tools.admininit;

import com.gobang.gobang.domain.auth.entity.RoleType;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@SpringBootApplication(scanBasePackages = "com.gobang.gobang")
@Profile("admin-init") // admin-init 프로파일로 실행할 때만 동작
@RequiredArgsConstructor
public class AdminInitTool implements CommandLineRunner {

    private final SiteUserRepository siteUserRepository;
    private final PasswordEncoder passwordEncoder;

    public static void main(String[] args) {
        // 실행 -> Runner 수행 -> 종료
        ConfigurableApplicationContext ctx = SpringApplication.run(AdminInitTool.class, args);
        SpringApplication.exit(ctx, () -> 0);
    }

    @Override
    @Transactional
    public void run(String... args) {
        String username = env("ADMIN_INIT_USERNAME", "admin");
        String rawPassword = System.getenv("ADMIN_INIT_PASSWORD"); // 필수
        String email = env("ADMIN_INIT_EMAIL", "admin@example.com");

        // 기존 계정이 존재할 때 비번까지 리셋할지(기본 false)
        boolean resetPassword = Boolean.parseBoolean(env("ADMIN_INIT_RESET_PASSWORD", "false"));

        if (rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalStateException("ADMIN_INIT_PASSWORD is empty. Refusing to create/update admin.");
        }

        SiteUser admin = siteUserRepository.findByUserName(username).orElse(null);

        if (admin == null) {
            admin = SiteUser.builder()
                    .userName(username)
                    .password(passwordEncoder.encode(rawPassword))
                    .role(RoleType.ADMIN)
                    .status("ACTIVE")
                    .email(email)
                    .nickName("관리자")
                    .mobilePhone("010-0000-0000")
                    .birth(LocalDate.of(1990, 1, 1).atStartOfDay())
                    .createdDate(LocalDateTime.now())
                    .build();

            siteUserRepository.save(admin);
            System.out.println("✅ Admin CREATED: user_name=" + username);
            return;
        }

        // 기존 계정 보정
        admin.setRole(RoleType.ADMIN);
        admin.setStatus("ACTIVE");

        if (resetPassword) {
            admin.setPassword(passwordEncoder.encode(rawPassword));
            System.out.println("ℹ️ Admin UPDATED + password reset: user_name=" + username);
        } else {
            System.out.println("ℹ️ Admin UPDATED (role/status only): user_name=" + username);
        }

        if (admin.getNickName() == null) admin.setNickName("관리자");
        if (admin.getCreatedDate() == null) admin.setCreatedDate(LocalDateTime.now());

        siteUserRepository.save(admin);
    }

    private static String env(String key, String defaultValue) {
        String v = System.getenv(key);
        return (v == null || v.isBlank()) ? defaultValue : v;
    }
}


//docker run --rm \
//  -e SPRING_PROFILES_ACTIVE=prod,secret,admin-init \
//  -e SPRING_DATASOURCE_URL='jdbc:postgresql://43.202.46.218:5432/postgres' \
//  -e SPRING_DATASOURCE_USERNAME='postgres' \
//  -e SPRING_DATASOURCE_PASSWORD='1234' \
//  -e ADMIN_INIT_USERNAME='admin' \
//  -e ADMIN_INIT_PASSWORD='원하는비밀번호' \
//  -e ADMIN_INIT_EMAIL='admin@example.com' \
//  -e ADMIN_INIT_RESET_PASSWORD='false' \
//  <이미지명:태그>
// 도커에서 위의 커맨드 실행하시면 됩니다.