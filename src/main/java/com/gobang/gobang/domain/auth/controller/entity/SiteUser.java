package com.gobang.gobang.domain.auth.controller.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@ToString(callSuper = true)
public class SiteUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto_increment
    private Long id;

    /**
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
}
