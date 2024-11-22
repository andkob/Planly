package com.melon.app.exception;

public class CannotJoinOwnedOrgException extends RuntimeException {
    public CannotJoinOwnedOrgException(String message) {
        super(message);
    }
    public CannotJoinOwnedOrgException(String message, Throwable cause) {
        super(message, cause);
    }
}
