package com.gobang.gobang.domain.notification.dto;

import com.gobang.gobang.domain.notification.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class NotificationResponse {

    private Long id;
    private String message;
    private String link;
    private boolean isRead;
    private LocalDateTime createdAt;

    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getMessage(),
                n.getLink(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}

