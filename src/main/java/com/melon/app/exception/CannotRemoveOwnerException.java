package com.melon.app.exception;

public class CannotRemoveOwnerException extends RuntimeException {
    public CannotRemoveOwnerException(String message) {
        super(message);
    }
}