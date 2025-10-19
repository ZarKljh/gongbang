package com.gobang.gobang.domain.qna.entity;

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
public class FormalAnswerEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "formal_question_id", nullable = false)
    private FormalQuestionEntity formalQuestion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnswererType type; // 답변자분류

    // TODO: 관계 매핑 필요
    private Long sellerId;

    // TODO: 관계 매핑 필요
    private Long adminId;

    @Column(length = 2000, nullable = false)
    private String content;

    // TODO: 관계 매핑 필요
    private Long imageId;

    private LocalDateTime deletedDate;
}