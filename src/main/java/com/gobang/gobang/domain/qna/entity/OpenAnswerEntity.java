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
@SQLDelete(sql = "UPDATE open_answer_entity SET deleted_date = NOW() where id = ?")
@Where(clause = "deleted_date is NULL")
public class OpenAnswerEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "open_question_id", nullable = false)
    private OpenQuestionEntity openQuestion;

    @Column(nullable = false)
    private Long sellerId;

    @Column(length = 500, nullable = false)
    private String content;

    private LocalDateTime deletedDate;
}