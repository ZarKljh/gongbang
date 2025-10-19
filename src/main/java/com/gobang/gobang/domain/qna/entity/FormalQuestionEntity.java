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
@SQLDelete(sql = "UPDATE formal_question_entity SET deleted_date = NOW() where id = ?")
@Where(clause = "deleted_date is NULL")
public class FormalQuestionEntity extends BaseEntity {

    @Column(length = 30, nullable = false)
    private String category;

    @Column(length = 200, nullable = false)
    private String title;

    @Column(length = 2000, nullable = false)
    private String content;

    @Column(length = 20, nullable = false)
    private String status;

    private Long imageId;

    @Column(nullable = false)
    private Long userId;

    private Long sellerId;

    private Long adminId;

    private LocalDateTime deletedDate;
}