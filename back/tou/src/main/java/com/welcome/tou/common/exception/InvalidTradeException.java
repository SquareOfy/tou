package com.welcome.tou.common.exception;

public class InvalidTradeException extends RuntimeException{

    public static final String CANT_SAME_BRANCH = "동일한 지점의 거래는 불가능합니다.";

    public static final String NOT_SIGNING_PROCEDURE = "서명이 필요한 상태가 아닙니다.";

    public static final String INVALID_STOCK_FOR_TRADE = "거래할 수 없는 품목이 포함되어 있습니다.";

    public static final String NOT_REFUSING_PROCEDURE = "거절이 가능한 상태가 아닙니다.";

    public static final String WE_NEED_ITEMS = "거래 시 하나 이상의 품목을 포함해야합니다.";

    public InvalidTradeException(String message) {
        super(message);
    }
}
