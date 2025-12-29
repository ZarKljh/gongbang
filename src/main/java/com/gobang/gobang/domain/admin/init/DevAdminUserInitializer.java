package com.gobang.gobang.domain.admin.init;

import com.gobang.gobang.domain.auth.entity.RoleType;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DevAdminUserInitializer implements ApplicationRunner {

    private final SiteUserRepository siteUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        final String adminUserName = "admin";

        // 기본 비밀번호(개발용). 원하면 환경변수로 덮어쓸 수 있음.
        final String rawPassword = env("DEV_ADMIN_PASSWORD", "1234!");

        SiteUser admin = siteUserRepository.findByUserName(adminUserName).orElse(null);

        if (admin == null) {
            admin = SiteUser.builder()
                    .userName(adminUserName)
                    .password(passwordEncoder.encode(rawPassword))
                    .role(RoleType.ADMIN)
                    .status("ACTIVE")
                    .email("admin@example.com")
                    .nickName("관리자")
                    .mobilePhone("010-0000-0000")
                    .birth(LocalDate.of(1990, 1, 1).atStartOfDay())
                    .createdDate(LocalDateTime.now())
                    .build();

            siteUserRepository.save(admin);

            // 비밀번호는 로그에 찍지 않습니다.
            log.info("✅ [dev] 기본 관리자 계정 생성 완료: userName='{}'", adminUserName);
            return;
        }

        // 기존 admin이 있으면: 권한/상태만 보정 (비밀번호는 덮어쓰지 않음)
        boolean changed = false;

        if (admin.getRole() != RoleType.ADMIN) {
            admin.setRole(RoleType.ADMIN);
            changed = true;
        }
        if (!"ACTIVE".equals(admin.getStatus())) {
            admin.setStatus("ACTIVE");
            changed = true;
        }
        if (admin.getNickName() == null) {
            admin.setNickName("관리자");
            changed = true;
        }
        if (admin.getCreatedDate() == null) {
            admin.setCreatedDate(LocalDateTime.now());
            changed = true;
        }

        if (changed) {
            siteUserRepository.save(admin);
            log.info("ℹ️ [dev] 기존 admin 계정 보정 완료(권한/상태/기본값): userName='{}'", adminUserName);
        } else {
            log.info("ℹ️ [dev] 기존 admin 계정 존재: 변경 없음 userName='{}'", adminUserName);
        }
    }

    private static String env(String key, String defaultValue) {
        String v = System.getenv(key);
        return (v == null || v.isBlank()) ? defaultValue : v;
    }
}
