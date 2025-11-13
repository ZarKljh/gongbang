package com.gobang.gobang.global.initData;

import com.gobang.gobang.domain.auth.entity.RoleType;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.seller.service.StudioService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Random;

import static com.gobang.gobang.domain.seller.model.StudioStatus.PENDING;

@Slf4j
@Component("initSellerApplications")
@Profile("dev")
@RequiredArgsConstructor
@Order(30)
public class InitSellerApplications {

    private final SiteUserRepository siteUserRepository;
    private final StudioService studioService;
    private final PasswordEncoder passwordEncoder;

    private final Random rnd = new Random();

    @PostConstruct
    @Transactional
    public void run() {
        long existingSellerCount = siteUserRepository.count();
        if (existingSellerCount > 200) {
            log.info("[InitSellerApplications] Skip: existing users = {}", existingSellerCount);
            return;
        }

        int created = 0;
        for (int i = 1; i <= 100; i++) {
            String username = "seller" + i;
            String email = "seller" + i + "@example.com";

            if (siteUserRepository.findByUserName(username).isPresent()) {
                continue;
            }

            // Seller 유저 생성
            SiteUser user = SiteUser.builder()
                    .email(email)
                    .password(passwordEncoder.encode("pass1234!")) // 공통 패스워드
                    .userName(username)
                    .fullName("판매자" + i)
                    .nickName("셀러" + i)
                    .mobilePhone("010-" + String.format("%04d", 1000 + i) + "-" + String.format("%04d", 2000 + i))
                    .role(RoleType.SELLER)
                    .status("ACTIVE")
                    .gender(i % 2 == 0 ? "MALE" : "FEMALE")  // 임의 성별
                    .birth(LocalDate.of(1988 + (i % 12), 1 + (i % 12), 1 + (i % 27)).atStartOfDay())
                    .createdDate(LocalDateTime.now().minusDays(rnd.nextInt(30))) // 최근 30일 내 랜덤
                    .build();

            siteUserRepository.save(user);

            // Studio(입점 신청) 생성
            long categoryId = 1L + (i % 6); // 카테고리 1~6 사이 분배(프로젝트 카테고리 수에 맞춰 조정)
            Studio studio = Studio.builder()
                    .categoryId(categoryId)
                    .studioName("스튜디오 " + i)
                    .studioDescription("스튜디오 " + i + " 의 소개 문구입니다. 수공예/공예/디자인 카테고리로 테스트 데이터.")
                    .studioMobile("010-" + String.format("%04d", 3000 + i) + "-" + String.format("%04d", 4000 + i))
                    .studioOfficeTell("02-" + String.format("%04d", 5000 + i))
                    .studioFax("02-" + String.format("%04d", 6000 + i))
                    .studioEmail("studio" + i + "@example.com")
                    .studioBusinessNumber(String.format("%03d-%02d-%05d", 100 + (i % 900), (10 + i) % 90, 10000 + i))
                    .studioAddPostNumber("0" + (40000 + i))
                    .studioAddMain("서울시 테스트구 테스트로 " + (10 + (i % 90)))
                    .studioAddDetail((i % 20 + 1) + "층 " + (i % 5 + 1) + "호")
                    .status(PENDING)
                    .createdDate(LocalDateTime.now().minusDays(i % 30))
                    .build();


            studio.setSiteUser(user);

            studioService.createStudio(studio);

            created++;
        }

        log.info("[InitSellerApplications] created {} seller+studio applications.", created);
    }
}
