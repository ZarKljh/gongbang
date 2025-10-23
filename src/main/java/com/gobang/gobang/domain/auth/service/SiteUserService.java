package com.gobang.gobang.domain.auth.service;

import com.gobang.gobang.domain.auth.dto.request.SignupUserRequest;
import com.gobang.gobang.domain.auth.entity.RoleType;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.global.RsData.RsData;
import com.gobang.gobang.global.config.SecurityUser;
import com.gobang.gobang.global.jwt.JwtProvider;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
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
    private final JwtProvider jwtProvider;


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
        String username = (String) payloadBody.get("username");
        List<GrantedAuthority> authorities = new ArrayList<>();

        return new SecurityUser(id, username, "", authorities);

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
}
