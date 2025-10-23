package com.gobang.gobang.domain.auth.entity;


import lombok.Getter;

@Getter
public enum RoleType {

    ADMIN,
    SELLER,
    USER,
    GUEST

    /*
    ADMIN("ROLE_ADMIN"),
    SELLER("ROLE_SELLER"),
    USER("ROLE_USER"),
    GUEST("ROLE_GUEST");

    RoleType(String value) {
        this.value = value;
    }

    private String value;

    */
}
