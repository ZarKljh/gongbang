package com.gobang.gobang.domain.mypage.controller;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.mypage.dto.request.FollowRequest;
import com.gobang.gobang.domain.mypage.dto.response.FollowResponse;
import com.gobang.gobang.domain.mypage.service.FollowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/api/v1/mypage/follow")
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    // 팔로우 목록 페이지
    @GetMapping
    public String followList(@RequestParam(required = false) SiteUser siteUser, Model model) {
        // TODO: 실제로는 세션에서 userId를 가져와야 함
        if (siteUser == null) {
            return null; // 테스트용 기본값
        }

        List<FollowResponse> follows = followService.getFollowsByUserId(siteUser);
        long followingCount = followService.getFollowingCount(siteUser);

        model.addAttribute("follows", follows);
        model.addAttribute("followingCount", followingCount);
        model.addAttribute("siteUser", siteUser);

        return "mypage/follow";
    }

    // 팔로우 추가 (AJAX)
    @PostMapping
    @ResponseBody
    public ResponseEntity<FollowResponse> addFollow(@RequestBody FollowRequest request) {
        FollowResponse response = followService.addFollow(request);
        return ResponseEntity.ok(response);
    }

    // 팔로우 취소 (AJAX)
    @DeleteMapping
    @ResponseBody
    public ResponseEntity<Void> unfollow(
            @RequestParam SiteUser siteUser,
            @RequestParam Studio studio) {
        followService.unfollow(siteUser, studio);
        return ResponseEntity.ok().build();
    }

    // 팔로우 여부 확인 (AJAX)
    @GetMapping("/check")
    @ResponseBody
    public ResponseEntity<Boolean> isFollowing(
            @RequestParam SiteUser siteUser,
            @RequestParam Studio studio) {
        boolean isFollowing = followService.isFollowing(siteUser, studio);
        return ResponseEntity.ok(isFollowing);
    }

    // 셀러의 팔로워 수 조회 (AJAX)
    @GetMapping("/count/followers")
    @ResponseBody
    public ResponseEntity<Long> getFollowerCount(@RequestParam Studio studio) {
        long count = followService.getFollowerCount(studio);
        return ResponseEntity.ok(count);
    }

    // 사용자의 팔로잉 수 조회 (AJAX)
    @GetMapping("/count/following")
    @ResponseBody
    public ResponseEntity<Long> getFollowingCount(@RequestParam SiteUser siteUser) {
        long count = followService.getFollowingCount(siteUser);
        return ResponseEntity.ok(count);
    }
}