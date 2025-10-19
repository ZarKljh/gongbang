package com.gobang.gobang.domain.qna.entity;

import com.gobang.gobang.global.jpa.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@SQLDelete(sql = "UPDATE open_question_entity SET deleted_date = NOW() where id = ?")
@Where(clause = "deleted_date is NULL")
public class OpenQuestionEntity extends BaseEntity {

    @Column(length = 50, nullable = false)
    private String title;

    @Column(length = 500, nullable = false)
    private String content;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false)
    private boolean visible;

    @Column(length = 20, nullable = false)
    private String status;

    @Column(nullable = false)
    private Long userId;

    private Long sellerId;

    private LocalDateTime deletedDate;
}