package com.gobang.gobang.domain.qna.entity;

import com.gobang.gobang.global.jpa.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@SQLDelete(sql = "UPDATE formal_answer_entity SET deleted_date = NOW() where id = ?")
@Where(clause = "deleted_date is NULL")
public class FormalAnswerEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "formal_question_id", nullable = false)
    private FormalQuestionEntity formalQuestion;

    @Column(nullable = false)
    private Integer type; // 답변자분류

    private Long sellerId;

    private Long adminId;

    @Column(length = 2000, nullable = false)
    private String content;

    private Long imageId;

    private LocalDateTime deletedDate;
}