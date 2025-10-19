package com.gobang.gobang.domain.qna.entity;

import com.gobang.gobang.domain.member.entity.Member;
import com.gobang.gobang.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
public class OpenQuestionEntity extends BaseEntity {

    @Column(length = 50, nullable = false)
    private String title;

    @Column(length = 500, nullable = false)
    private String content;

    // TODO: 관계 매핑 필요
    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false)
    private boolean visible;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private QnaStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Member member;

    // TODO: 관계 매핑 필요
    private Long sellerId;

    private LocalDateTime deletedDate;
}