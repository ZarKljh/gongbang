package com.gobang.domain.member.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class MemberResponseDto {

    private final Long id;
    private final String username;
}
