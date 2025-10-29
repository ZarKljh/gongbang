package com.gobang.gobang.domain.auth.service;

import com.gobang.gobang.domain.auth.dto.request.SignupSellerRequest;
import com.gobang.gobang.domain.auth.dto.request.SignupUserRequest;
import com.gobang.gobang.domain.auth.entity.RoleType;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.personal.dto.request.SiteUserUpdateRequest;
import com.gobang.gobang.domain.personal.dto.response.SiteUserResponse;
import com.gobang.gobang.domain.personal.service.SmsVerificationService;
import com.gobang.gobang.global.RsData.RsData;
import com.gobang.gobang.global.config.SecurityUser;
import com.gobang.gobang.global.jwt.JwtProvider;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class SiteUserService {
    private final SiteUserRepository siteUserRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;
    private final SmsVerificationService smsVerificationService;

    public SiteUser signupUser(SignupUserRequest signupUserRequest){

        Optional<SiteUser> checkedSiteUser = siteUserRepository.findByUserName(signupUserRequest.getUserName());

        if(checkedSiteUser.isPresent()){
            throw new RuntimeException("이미 가입된 사용자입니다.");
        }
        if (signupUserRequest.getStatus() == null) {
            signupUserRequest.setStatus("ACTIVE");
        }
        SiteUser newUser = SiteUser.builder()
                .email(signupUserRequest.getEmail())
                .password(signupUserRequest.getPassword())
                .userName(signupUserRequest.getUserName())
                .mobilePhone(signupUserRequest.getMobilePhone())
                .nickName(signupUserRequest.getNickName())
                .role(RoleType.USER)
                .status(signupUserRequest.getStatus())
                .gender(signupUserRequest.getGender())
                //.profileImg(signupUserRequest.getProfileImg())
                .birth(signupUserRequest.getBirth().atStartOfDay())
                .createdDate(LocalDateTime.now())
                .build();

        String refreshToken = jwtProvider.genRefreshToken(newUser);
        newUser.setRefreshToken(refreshToken);

        siteUserRepository.save(newUser);

        return newUser;
    }

    public SiteUser getSiteUserByEmail(String email) {
        return siteUserRepository.findByEmail(email);
    }
    public SiteUser getSiteUserByUserName(String userName) {

        Optional<SiteUser> os = siteUserRepository.findByUserName(userName);

        if ( os.isPresent() ) {
            return os.get();
        } else {
            return null;
        }

    }
    public boolean validateToken(String accessToken) {
        return jwtProvider.verify(accessToken);
    }
    public RsData<String> refreshAccessToken(String refreshToken) {
        SiteUser siteUser = siteUserRepository.findByRefreshToken(refreshToken).orElseThrow(() -> new RuntimeException("존재하지 않는 리프레시 토큰입니다."));

        String accessToken = jwtProvider.genAccessToken(siteUser);

        return RsData.of("200", "토큰 갱신 성공", accessToken);
    }
    public SecurityUser getUserFromAccessToken(String accessToken) {
        Map<String, Object> payloadBody = jwtProvider.getClaims(accessToken);

        long id = (int) payloadBody.get("id");
        String userName = (String) payloadBody.get("userName");
        List<GrantedAuthority> authorities = new ArrayList<>();

        return new SecurityUser(id, userName, "", authorities);

    }

    public SiteUser signupSeller(@Valid SignupSellerRequest signupSellerRequest) {
        Optional<SiteUser> checkedSiteUser = siteUserRepository.findByUserName(signupSellerRequest.getUserName());

        if(checkedSiteUser.isPresent()){
            throw new RuntimeException("이미 가입된 사용자입니다.");
        }
        if (signupSellerRequest.getStatus() == null) {
            signupSellerRequest.setStatus("ACTIVE");
        }

        SiteUser newUser = SiteUser.builder()
                .email(signupSellerRequest.getEmail())
                .password(signupSellerRequest.getPassword())
                .userName(signupSellerRequest.getUserName())
                .mobilePhone(signupSellerRequest.getMobilePhone())
                .nickName(signupSellerRequest.getNickName())
                .role(RoleType.SELLER)
                .status(signupSellerRequest.getStatus())
                .gender(signupSellerRequest.getGender())
                .birth(signupSellerRequest.getBirth().atStartOfDay())
                .createdDate(LocalDateTime.now())
                //.profileImg(signupUserRequest.getProfileImg())
                .build();

        Studio newStudio = Studio.builder()
                .categoryId(signupSellerRequest.getCategoryId())
                .studioName(signupSellerRequest.getStudioName())
                .studioDescription(signupSellerRequest.getStudioDescription())
                .studioMobile(signupSellerRequest.getStudioMobile())
                .studioOfficeTell(signupSellerRequest.getStudioOfficeTell())
                .studioFax(signupSellerRequest.getStudioFax())
                .studioEmail(signupSellerRequest.getStudioEmail())
                .studioBusinessNumber(signupSellerRequest.getStudioBusinessNumber())
                .build();


        String refreshToken = jwtProvider.genRefreshToken(newUser);
        newUser.setRefreshToken(refreshToken);

        siteUserRepository.save(newUser);

        return newUser;

    }


    @AllArgsConstructor
    @Getter
    public static class AuthAndMakeTokensResponseBody{
        private SiteUser siteUser;
        private String accessToken;
        private String refreshToken;
    }

    public RsData<AuthAndMakeTokensResponseBody> authAndMakeTokens(String userName, String password) {
        SiteUser siteUser = siteUserRepository.findByUserName(userName).orElseThrow(() -> new RuntimeException("사용자가 존재하지 않습니다."));

        // 시간 설정 및 토큰 생성
        //String accessToken = jwtProvider.genToken(siteUser, 60 * 60 * 5);
        String accessToken = jwtProvider.genAccessToken(siteUser);
        String refreshToken = jwtProvider.genRefreshToken(siteUser);

        System.out.println("accessToken : " + accessToken);

        return RsData.of("200-1", "로그인 성공", new AuthAndMakeTokensResponseBody(siteUser, accessToken, refreshToken));
    }

//    public SiteUserResponse getCurrentUserInfo() {
//        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
//        String username;
//
//        if (principal instanceof UserDetails userDetails) {
//            username = userDetails.getUsername();
//        } else {
//            username = principal.toString();
//        }
//
//        SiteUser siteUser = siteUserRepository.findByUserName(username)
//                .orElseThrow(() -> new IllegalStateException("로그인된 사용자를 찾을 수 없습니다."));
//
//        return new SiteUserResponse(siteUser);
//    }

    // 현재 로그인된 사용자 조회
    public SiteUser getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;

        if (principal instanceof UserDetails userDetails) {
            username = userDetails.getUsername();
        } else {
            username = principal.toString();
        }

        return siteUserRepository.findByUserName(username)
                .orElseThrow(() -> new IllegalStateException("로그인된 사용자를 찾을 수 없습니다."));
    }

    // 현재 로그인된 사용자 정보 반환
    public SiteUserResponse getCurrentUserInfo() {
        return new SiteUserResponse(getCurrentUser());
    }

    // 현재 로그인된 사용자 상세 정보 반환
    public SiteUserResponse getCurrentUserDetail() {
        SiteUser user = getCurrentUser();
        // 필요하다면 SiteUserResponse를 상세정보용으로 확장 가능
        return new SiteUserResponse(user);
    }

    // 사용자 정보 수정 (전화번호 인증 필요)
    @Transactional
    public SiteUserResponse updateUserInfo(SiteUserUpdateRequest request) {
        SiteUser currentUser = getCurrentUser();

        // 전화번호 인증 확인
        if (!smsVerificationService.isVerified(currentUser.getMobilePhone())) {
            throw new IllegalStateException("전화번호 인증이 필요합니다.");
        }

        // 비밀번호, 이메일, 전화번호 변경
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            currentUser.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            currentUser.setEmail(request.getEmail());
        }
        if (request.getMobilePhone() != null && !request.getMobilePhone().isBlank()) {
            currentUser.setMobilePhone(request.getMobilePhone());
        }

        siteUserRepository.save(currentUser);

        // 인증 상태 초기화
        smsVerificationService.clearVerification(currentUser.getMobilePhone());

        return new SiteUserResponse(currentUser);
    }
}