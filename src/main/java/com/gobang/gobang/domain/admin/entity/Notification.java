package com.gobang.gobang.domain.admin.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        name = "notification",
        indexes = {
                @Index(name = "ix_notification_created", columnList = "createdAt"),
                @Index(name = "ix_notification_status", columnList = "status"),
                @Index(name = "ix_notification_type", columnList = "type")
        }
)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private Type type;   // MERCHANT_APPLICATION, USER_REPORT


    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.NEW; // NEW | READ


    @Column(nullable = false, length = 80)
    private String refType;


    @Column(nullable = false)
    private Long refId;


    @Column(nullable = false)
    private Instant createdAt;

    public enum Type {
        MERCHANT_APPLICATION,
        USER_REPORT
    }

    public enum Status {
        NEW,
        READ
    }

    @PrePersist
    public void onCreate() {
        if (this.createdAt == null) this.createdAt = Instant.now();
    }
}
