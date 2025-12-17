package com.gobang.gobang.domain.notification.entity;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "notification")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private SiteUser user;

    @Column(nullable = false)
    private String message;

    private String link;

    @Column(nullable = false)
    private boolean isRead = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Notification(SiteUser user, String message, String link) {
        this.user = user;
        this.message = message;
        this.link = link;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
    }

    public void markAsRead() {
        this.isRead = true;
    }
}
