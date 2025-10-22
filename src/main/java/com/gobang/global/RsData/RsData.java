package com.gobang.global.RsData;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class RsData<T> {
    private String resultCode;
    private String msg;
    private T data;

    public static <T> RsData<T> of(String resultCode, String msg, T data) {
        return new RsData<>(resultCode, msg, data);
    }

    public static <T> RsData<T> of(String resultCode, String msg) {
        return new RsData<>(resultCode, msg, null);
    }

    @JsonIgnore
    public boolean isSuccess() {
        return resultCode.startsWith("200");
    }

    @JsonIgnore
    public boolean isFail() {
        return !isSuccess();
    }
}