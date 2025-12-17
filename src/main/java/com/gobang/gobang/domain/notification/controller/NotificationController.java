package com.gobang.gobang.domain.notification.controller;

import com.gobang.gobang.domain.notification.dto.NotificationResponse;
import com.gobang.gobang.domain.notification.service.NotificationService;
import com.gobang.gobang.global.RsData.RsData;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public RsData<List<NotificationResponse>> myNotifications(Authentication authentication) {
        String username = authentication.getName();
        return RsData.of("200", "알림 목록 조회 성공", notificationService.getMyNotifications(username));
    }

    @GetMapping("/unread-count")
    public RsData<Long> unreadCount(Authentication authentication) {
        String username = authentication.getName();
        return RsData.of("200", "안읽은 알림 개수 조회 성공", notificationService.getUnreadCount(username));
    }

    @PostMapping("/{id}/read")
    public RsData<Void> markAsRead(@PathVariable Long id, Authentication authentication) {
        String username = authentication.getName();
        notificationService.markAsRead(id, username);
        return RsData.of("200", "알림 읽음 처리 성공");
    }
}
