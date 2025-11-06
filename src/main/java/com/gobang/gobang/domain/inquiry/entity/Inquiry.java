package com.gobang.gobang.domain.inquiry.entity;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.inquiry.model.InquiryType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "inquiries")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Inquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 200)
    private String title;

    @Lob // 상세 내용은 아주 긴 내용이 될 수도 있으니 대용량 텍스트를 안전하게 저장하기 위한 어노테이션입니다
    @Column(nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private InquiryType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn( name = "writer_id", nullable = true)
    private SiteUser writer;



    @Column(nullable = false)
    private boolean answered;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
