package com.gobang.gobang.global.initData;

import com.gobang.gobang.domain.auth.entity.RoleType;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.global.jwt.JwtProvider;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Configuration
@Profile({"dev"})
public class InitUsers {

    @Bean
    CommandLineRunner initUsersData(
            SiteUserRepository siteUserRepository,
            PasswordEncoder passwordEncoder,
            JwtProvider jwtProvider
    ) {
        return args -> {
            // 이미 어느 정도 만들어놨다면, 중복 생성 막기
            long existingUsers = siteUserRepository.count();
            if (existingUsers >= 200) return;

            for (int i = 1; i <= 200; i++) {

                String userName = "user%03d".formatted(i);
                String email = userName + "@example.com";

                Optional<SiteUser> existByName = siteUserRepository.findByUserName(userName);
                if (existByName.isPresent()) continue;

                SiteUser u = SiteUser.builder()
                        .email(email)
                        .password(passwordEncoder.encode("password")) // 공통 비밀번호
                        .userName(userName)
                        .fullName("일반유저" + i)
                        .mobilePhone("010-0000-%04d".formatted(i))
                        .role(RoleType.USER)
                        .status("ACTIVE")
                        .gender((i % 2 == 0) ? "M" : "F")
                        .birth(LocalDate.now().minusYears(20 + (i % 10)).atStartOfDay())
                        .createdDate(LocalDateTime.now().minusDays(i % 30))
                        .build();

                // 리프레시 토큰 발급
                String refreshToken = jwtProvider.genRefreshToken(u);
                u.setRefreshToken(refreshToken);

                siteUserRepository.save(u);
            }
        };
    }
}
