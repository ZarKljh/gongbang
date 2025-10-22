package com.gobang.gobang.domain.personal.entity;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "user_address")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_address_id")
    private Long userAddressId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private SiteUser siteUser;

    @Column(name = "recipient_name", nullable = false, length = 50)
    private String recipientName;

    @Column(name = "base_address", nullable = false, length = 10)
    private String baseAddress;

    @Column(name = "detail_address", nullable = false, length = 255)
    private String detailAddress;

    @Column(name = "zipcode", nullable = false, length = 255)
    private String zipcode;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "address", cascade = CascadeType.ALL)
    private List<Delivery> deliveries = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}