package com.gobang.gobang.domain.auth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gobang.gobang.domain.personal.entity.*;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.data.redis.core.RedisHash;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString(callSuper = true)
@RedisHash("SiteUser")
public class SiteUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment
    private Long id;

    @Column(unique = true, length = 50)
    private String userName;

    @JsonIgnore
    private String password;

    @Column(length=50)
    private String fullName;

    @Column(unique = true, length = 100)
    private String email;

    @Column(length = 20)
    private String mobilePhone;

    @Column(length = 50)
    private String nickName;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private RoleType role;

    @Column(length = 10)
    private String status;

    @Column(length = 10)
    private String gender;

    @Column(length = 254)
    private String profileImg;

    private LocalDateTime birth;

    @JsonIgnore
    @Column(length = 254)
    private String refreshToken;

    private LocalDateTime createdDate;

    private LocalDateTime updatedDate;

    private LocalDateTime deletedDate;

    @OneToMany(mappedBy = "siteUser", cascade = CascadeType.REMOVE)
    private List<Studio> studioList;
    /**

     @Column(name = "CREATEDATE", nullable = false, updatable = false)
     private LocalDateTime createDate; // 계정 생성일

     @Column(unique = true)
     @Column(columnDefinition = "TEXT")

     Long id
     String email
     String password
     String userName
     String phone
     String nickName
     String role
     LocalDateTime createDate
     LocalDateTime updateDate
     String status
     Long profileImgId
     LocalDateTime deletedDate
     LocalDateTime birthDay
     String refreshToken
     String gender
    */

    @OneToMany(mappedBy = "siteUser", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Cart> carts = new ArrayList<>();

    @OneToMany(mappedBy = "siteUser", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Follow> follows = new ArrayList<>();

    @OneToMany(mappedBy = "siteUser", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Orders> orders = new ArrayList<>();

    @OneToMany(mappedBy = "siteUser", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PaymentMethod> paymentMethods = new ArrayList<>();

    @OneToMany(mappedBy = "siteUser", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserAddress> userAddresses = new ArrayList<>();

    @OneToMany(mappedBy = "siteUser", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WishList> wishLists = new ArrayList<>();
}
