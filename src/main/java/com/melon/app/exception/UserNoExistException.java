package com.melon.app.exception;

public class UserNoExistException extends RuntimeException {
    public UserNoExistException(String message) {
        super(message);
    }

    public UserNoExistException(String message, Throwable cause) {
        super(message, cause);
    }
}
