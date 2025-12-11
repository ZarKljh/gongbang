package com.gobang.gobang.domain.auth.controller;

import com.gobang.gobang.domain.auth.dto.SiteUserDto;
import com.gobang.gobang.domain.auth.dto.request.LoginSellerRequest;
import com.gobang.gobang.domain.auth.dto.request.LoginUserRequest;
import com.gobang.gobang.domain.auth.dto.request.SignupSellerRequest;
import com.gobang.gobang.domain.auth.dto.request.SignupUserRequest;
import com.gobang.gobang.domain.auth.dto.response.LoginUserResponse;
import com.gobang.gobang.domain.auth.dto.response.SignupSellerResponse;
import com.gobang.gobang.domain.auth.dto.response.SignupUserResponse;
import com.gobang.gobang.domain.auth.entity.RoleType;
import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.auth.service.SiteUserService;
import com.gobang.gobang.domain.image.entity.Image;
import com.gobang.gobang.domain.image.service.ProfileImageService;
import com.gobang.gobang.domain.seller.service.StudioService;
import com.gobang.gobang.global.RsData.RsData;
import com.gobang.gobang.global.jwt.JwtProvider;
import com.gobang.gobang.global.rq.Rq;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping(value = "/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "ApiV1SiteUserController", description = "회원 인증/인가 API")
public class SiteUserController {
    private final SiteUserService siteUserService;
    private final StudioService studioService;
    private final JwtProvider jwtProvider;
    private final Rq rq;
    private final PasswordEncoder passwordEncoder;
    private final ProfileImageService profileImageService;

    @PostMapping("/signup/user")
    public RsData<SignupUserResponse> joinUser (@RequestPart("data") @Valid SignupUserRequest signupUserRequest, @RequestPart(value = "file", required = false) MultipartFile file) {
        if (!signupUserRequest.getPassword().equals(signupUserRequest.getConfirmPassword())) {
            throw new IllegalArgumentException("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        } else if (siteUserService.existsByUserName(signupUserRequest.getUserName())){
            throw new IllegalArgumentException("이미 사용중인 아이디입니다.");
        }
        SiteUser siteUser = siteUserService.signupUser(signupUserRequest);

        if (file != null && !file.isEmpty()) {
            profileImageService.uploadProfileImage(siteUser.getId(), file);
        }

        //System.out.println("여기까지 확인되었습니다");
        return RsData.of("200", "회원가입이 완료되었습니다.", new SignupUserResponse(siteUser));
    }

    @GetMapping("/signup/user/checkusername")
    public RsData<Boolean> checkUserName(@RequestParam String userName) {

        boolean exists = siteUserService.existsByUserName(userName);

        if (exists) {
            return RsData.of("200", "이미 사용중인 아이디입니다.", false);
        } else {
            return RsData.of("200", "사용 가능한 아이디입니다.", true);
        }
    }

    @GetMapping("/signup/user/checknickname")
    public RsData<Boolean> checkNickName(@RequestParam String nickName) {

        boolean exists = siteUserService.existsByNickName(nickName);

        if (exists) {
            return RsData.of("200", "이미 사용중인 닉네임입니다.", false);
        } else {
            return RsData.of("200", "사용 가능한 닉네임입니다.", true);
        }
    }

    @GetMapping("/signup/user/checkemail")
    public RsData<Boolean> checkEmail(@RequestParam String email) {

        boolean exists = siteUserService.existsByEmail(email);

        if (exists) {
            return RsData.of("200", "이미 사용중인 이메일입니다.", false);
        } else {
            return RsData.of("200", "사용 가능한 이메일입니다.", true);
        }
    }


    @PostMapping("/signup/seller")
    public RsData<SignupSellerResponse> joinSeller(
            @Valid @RequestPart("request") SignupSellerRequest signupSellerRequest,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage,
            @RequestPart(value = "studioMainImage", required = false) MultipartFile studioMainImage,
            @RequestPart(value = "studioLogoImage", required = false) MultipartFile studioLogoImage,
            @RequestPart(value = "studioGalleryImages", required = false) List<MultipartFile> studioGalleryImages
    ){
        if (!signupSellerRequest.getPassword().equals(signupSellerRequest.getConfirmPassword())) {
            throw new IllegalArgumentException("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        }
        SiteUser newUser = siteUserService.signupSeller(signupSellerRequest);
        Studio newStudio = studioService.getStudioBySiteUser(newUser);

        // 3️⃣ 🔥 프로필 이미지 저장
        if (profileImage != null && !profileImage.isEmpty()) {
            profileImageService.uploadProfileImage(newUser.getId(), profileImage);
        }

        // 4️⃣ 🔥 스튜디오 이미지 저장 (대표 이미지)
        if (studioMainImage != null && !studioMainImage.isEmpty()) {
            profileImageService.uploadStudioImage(newStudio.getStudioId(), studioMainImage, Image.RefType.STUDIO_MAIN, 0);
        }

        // 5️⃣ 🔥 스튜디오 이미지 저장 (로고 이미지)
        if (studioLogoImage != null && !studioLogoImage.isEmpty()) {
            profileImageService.uploadStudioImage(newStudio.getStudioId(), studioLogoImage,Image.RefType.STUDIO_LOGO, 0);
        }

        profileImageService.uploadStudioGalleryImages(newStudio.getStudioId(), studioGalleryImages);

        return RsData.of("200", "회원가입이 완료되었습니다", new SignupSellerResponse(newUser, newStudio));
    }

    @Getter
    @AllArgsConstructor
    public static class LoginResponseBody{
        private SiteUserDto siteUserDto;
    }

    @PostMapping("/login/user")
    public RsData<LoginResponseBody> loginUser(@Valid @RequestBody LoginUserRequest loginUserRequest, HttpServletResponse res) {
        SiteUser siteUser = siteUserService.getSiteUserByUserNamePassword(loginUserRequest.getUserName(), loginUserRequest.getPassword());
        if(siteUser == null){
            throw new IllegalArgumentException("해당 사용자 정보를 찾을 수 없습니다.");
        }
        RsData<SiteUserService.AuthAndMakeTokensResponseBody> authAndMakeTokensRs = siteUserService.authAndMakeTokens(loginUserRequest.getUserName(), loginUserRequest.getPassword());


        // accessToken 발급
        rq.setCrossDomainCookie("accessToken", authAndMakeTokensRs.getData().getAccessToken());
        rq.setCrossDomainCookie("refreshToken", authAndMakeTokensRs.getData().getRefreshToken());


        return RsData.of(
                authAndMakeTokensRs.getResultCode(),
                authAndMakeTokensRs.getMsg(),
                new LoginResponseBody(new SiteUserDto(authAndMakeTokensRs.getData().getSiteUser()))
        );
    }
    @PostMapping("/login/seller")
    public RsData<LoginResponseBody> loginSeller(@Valid @RequestBody LoginSellerRequest loginSellerRequest, HttpServletResponse res){
        if(!"SELLER".equals(loginSellerRequest.getRole()) && !"ADMIN".equals(loginSellerRequest.getRole())){
            throw new IllegalArgumentException("사업자전용 로그인 화면입니다.");
        }

        SiteUser siteUser = siteUserService.getSiteUserByUserNamePassword(loginSellerRequest.getUserName(), loginSellerRequest.getPassword());
        if(siteUser == null){
            throw new IllegalArgumentException("해당 사용자 정보를 찾을 수 없습니다.");
        }
        // 실제 사용자 role 확인
        RoleType actualRole = siteUser.getRole();
        if (actualRole != RoleType.SELLER && actualRole != RoleType.ADMIN) {
            throw new IllegalArgumentException("해당 사용자는 사업자 또는 관리자 권한이 없습니다.");
        }

        RsData<SiteUserService.AuthAndMakeTokensResponseBody> authAndMakeTokensRs = siteUserService.authAndMakeTokens(loginSellerRequest.getUserName(), loginSellerRequest.getPassword());


        // accessToken 발급
        rq.setCrossDomainCookie("accessToken", authAndMakeTokensRs.getData().getAccessToken());
        rq.setCrossDomainCookie("refreshToken", authAndMakeTokensRs.getData().getRefreshToken());


        return RsData.of(
                authAndMakeTokensRs.getResultCode(),
                authAndMakeTokensRs.getMsg(),
                new LoginResponseBody(new SiteUserDto(authAndMakeTokensRs.getData().getSiteUser()))
        );
    }
    @GetMapping("/me")
    public RsData<LoginUserResponse> me() {
        SiteUser siteUser = rq.getSiteUser();

        if (siteUser == null) {
            return RsData.of(
                    "401",
                    "로그인이 필요합니다.",
                    null
            );
        }
        return RsData.of(
                "200",
                "내 정보 조회 성공",
                new LoginUserResponse(siteUser)
        );
    }

    @PostMapping("/logout")
    public RsData logout() {
        rq.removeCrossDomainCookie("accessToken");
        rq.removeCrossDomainCookie("refreshToken");

        return RsData.of("200","로그아웃 성공");
    }
}
