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
public class FormalQuestionEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Member member;
    
    //TODO: product 관계 매핑 필요
    private Product product;

    @Column(length = 200, nullable = false)
    private String title;
    
    @Column(length = 30, nullable = false)
    private String category;

    @Column(length = 2000, nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private QnaStatus status;

    // TODO: 관계 매핑 필요
    private Long imageId;


    // TODO: 관계 매핑 필요
    private Long sellerId;

    // TODO: 관계 매핑 필요
    private Long adminId;

    private LocalDateTime deletedDate;
}