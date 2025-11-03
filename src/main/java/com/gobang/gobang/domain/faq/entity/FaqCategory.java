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
@Table(name="faq_category")
public class FaqCategory {
    @Id
    @GeneratedValue private UUID id;

    @Column(nullable=false, length = 64, unique = true)
    private String slug;

    @Column( nullable=false, length = 50)
    private String name;

    @Column(name="order_no", nullable = false)
    private int orderNo = 0;

    @Column(name="is_active", nullable=false)
    private boolean active = true;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}
