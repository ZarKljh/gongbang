package com.gobang.gobang.domain.admin.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
        name = "admin_account",
        indexes = {
                @Index(name = "ix_admin_email", columnList = "email", unique = true)
        }
)
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false, length = 120, unique = true)
    private String email;


    @Column(nullable = false, length = 255)
    private String passwordHash;


    @Column(nullable = false, length = 60)
    private String name;


    @Column(nullable = false)
    private boolean active = true;
}
