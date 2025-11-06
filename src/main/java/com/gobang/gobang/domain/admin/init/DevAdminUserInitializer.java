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
    public void run(ApplicationArguments args) {
        final String adminUserName = "admin";
        final String rawPassword = "admin1234!"; // 여기서 비번 원하는 걸로 바꿔도 됨

        SiteUser admin = siteUserRepository.findByUserName(adminUserName).orElse(null);

        if (admin == null) {
            // 관리자 계정이 없으면 새로 생성
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

            log.info("✅ 기본 관리자 계정 생성 완료: userName='{}', password='{}'", adminUserName, rawPassword);
        } else {
            // 이미 admin이라는 user_name 이 있으면: 관리자 권한 + 비번/상태만 맞춰줌
            admin.setRole(RoleType.ADMIN);
            admin.setPassword(passwordEncoder.encode(rawPassword));
            admin.setStatus("ACTIVE");

            // null 이면 그냥 냅둬도 되지만, 최소한 닉네임 정도는 채워줄 수 있음
            if (admin.getNickName() == null) {
                admin.setNickName("관리자");
            }
            if (admin.getCreatedDate() == null) {
                admin.setCreatedDate(LocalDateTime.now());
            }

            siteUserRepository.save(admin);

            log.info("ℹ️ 기존 admin 계정 갱신: userName='{}', password 재설정 완료", adminUserName);
        }
    }
}
