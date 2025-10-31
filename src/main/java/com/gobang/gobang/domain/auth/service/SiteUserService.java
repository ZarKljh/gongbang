package com.gobang.gobang.domain.auth.service;

import com.gobang.gobang.domain.auth.dto.request.SignupSellerRequest;
import com.gobang.gobang.domain.auth.dto.request.SignupUserRequest;
import com.gobang.gobang.domain.auth.entity.RoleType;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.personal.dto.request.SiteUserUpdateRequest;
import com.gobang.gobang.domain.personal.dto.response.SiteUserResponse;
import com.gobang.gobang.domain.seller.service.StudioService;
import com.gobang.gobang.global.RsData.RsData;
import com.gobang.gobang.global.config.SecurityUser;
import com.gobang.gobang.global.jwt.JwtProvider;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class SiteUserService {
    private final SiteUserRepository siteUserRepository;
    private final StudioService studioService;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;


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
                //.password(signupUserRequest.getPassword())
                .password(passwordEncoder.encode(signupUserRequest.getPassword()))
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

    public SiteUser getSiteUserByUserNamePassword(String userName, String password) {
        String encodedPassword = passwordEncoder.encode(password);
        Optional<SiteUser> os = siteUserRepository.findByUserName(userName);

        if (os.isPresent()) {
            SiteUser siteUser = os.get();
            if (passwordEncoder.matches(password, siteUser.getPassword())) {
                return siteUser;
            }
        }
        System.out.println("siteuser를 찾아올 수 없습니다");
        return null;
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
                .password(passwordEncoder.encode(signupSellerRequest.getPassword()))
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
                .categoryId(Long.parseLong(signupSellerRequest.getCategoryId()))
                .studioName(signupSellerRequest.getStudioName())
                .studioDescription(signupSellerRequest.getStudioDescription())
                .studioMobile(signupSellerRequest.getStudioMobile())
                .studioOfficeTell(signupSellerRequest.getStudioOfficeTell())
                .studioFax(signupSellerRequest.getStudioFax())
                .studioEmail(signupSellerRequest.getStudioEmail())
                .studioBusinessNumber(signupSellerRequest.getStudioBusinessNumber())
                .studioAddPostNumber(signupSellerRequest.getStudioAddPostNumber())
                .studioAddMain(signupSellerRequest.getStudioAddMain())
                .studioAddDetail(signupSellerRequest.getStudioAddDetail())
                .build();


        String refreshToken = jwtProvider.genRefreshToken(newUser);
        newUser.setRefreshToken(refreshToken);
        newStudio.setSiteUser(newUser);
        siteUserRepository.save(newUser);
        System.out.println("유저정보가 저장되었습니다");
        studioService.createStudio(newStudio);
        System.out.println("공방이 저장되었습니다");
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

        //System.out.println("accessToken : " + accessToken);

        return RsData.of("200-1", "로그인 성공", new AuthAndMakeTokensResponseBody(siteUser, accessToken, refreshToken));
    }

    // 현재 로그인된 사용자 조회
    public SiteUser getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() ||
                (auth.getPrincipal() instanceof String principal && principal.equals("anonymousUser"))) {
            throw new IllegalStateException("로그인된 사용자가 없습니다.");
        }

        Object principal = auth.getPrincipal();
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

    // 사용자 정보 업데이트
    public SiteUserResponse updateUserInfo(SiteUserUpdateRequest request) {
        SiteUser user = getCurrentUser();

        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            user.setEmail(request.getEmail());
        }
        if (request.getMobilePhone() != null && !request.getMobilePhone().isEmpty()) {
            user.setMobilePhone(request.getMobilePhone());
        }
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        // nickName 필드가 존재하는지 체크 후 업데이트
        if (request.getNickName() != null && !request.getNickName().isEmpty()) {
            if (user.getNickName() != null) { // 필드가 존재하면
                user.setNickName(request.getNickName());
            } else {
                // 엔티티에 필드가 없으면 아예 생성하거나 무시
                // 예: user.setNickName(request.getNickName()); // 필드 생성 필요
            }
        }

        siteUserRepository.save(user);

        return new SiteUserResponse(user);
    }

    public boolean verifyPassword(Long userId, String password) {
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("사용자를 찾을 수 없습니다."));
        return passwordEncoder.matches(password, user.getPassword());
    }
}