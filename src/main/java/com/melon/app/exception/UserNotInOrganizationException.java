package com.melon.app.exception;

public class UserNotInOrganizationException extends RuntimeException {
    public UserNotInOrganizationException(String message) {
        super(message);
    }
}