package com.gobang.gobang.domain.auth.service;

import com.gobang.gobang.domain.auth.dto.request.SignupUserRequest;
import com.gobang.gobang.domain.auth.entity.RoleType;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@RequiredArgsConstructor
@Service
public class SiteUserService {
    private final SiteUserRepository siteUserRepository;
    //private final JwtProvider jwtProvider;


    public SiteUser signupUser(SignupUserRequest signupUserRequest){

        SiteUser checkedSiteUser = siteUserRepository.findByEmail(signupUserRequest.getEmail());
        if(checkedSiteUser != null){
            throw new RuntimeException("이미 가입된 사용자입니다.");
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
                .birth(signupUserRequest.getBirth())
                .createdDate(LocalDateTime.now())
                .build();
        /*
        String refreshToken = jwtProvider.genRefreshToken(newUser);
        newUser.setRefreshToken(refreshToken);
        */
        siteUserRepository.save(newUser);

        return newUser;
    }

    /*
        Member checkedMember = memberRepository.findByUsername(username);
        if(checkedMember != null){
            throw new RuntimeException("이미 가입된 사용자입니다.");
        }
        Member member = Member.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .build();

        String refreshToken = jwtProvider.genRefreshToken(member);
        member.setRefreshToken(refreshToken);

        memberRepository.save(member);
        return member;
    */
}
