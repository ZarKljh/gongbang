package com.gobang.gobang.domain.personal.dto.request;

import lombok.Getter;

import java.util.List;

@Getter
public class CartDeleteRequest {
    private List<Long> cartIds;
}