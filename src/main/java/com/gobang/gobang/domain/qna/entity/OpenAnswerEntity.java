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
public class OpenAnswerEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "open_question_id", nullable = false)
    private OpenQuestionEntity openQuestion;

    // TODO: 관계 매핑 필요
    @Column(nullable = false)
    private Long sellerId;

    @Column(length = 500, nullable = false)
    private String content;

    private LocalDateTime deletedDate;
}