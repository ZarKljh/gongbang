package com.gobang.gobang.domain.faq.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name ="faq")
public class Faq {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch=FetchType.LAZY, optional = false)
    @JoinColumn(name="category_id", nullable = false)
    private FaqCategory category;


    @Column(columnDefinition = "text", nullable = false)
    private String question;

    @Column(columnDefinition ="text", nullable = false)
    private String answer;

    @Column(name="order_no", nullable = false)
    private int orderNo = 0;

    @Column(name="in_published", nullable = false)
    private boolean published = true;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}
