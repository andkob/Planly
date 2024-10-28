package com.melon.app.exception;

public class ConflictingSchedulesException extends RuntimeException {
    public ConflictingSchedulesException(String message) {
        super(message);
    }
    public ConflictingSchedulesException(String message, Throwable cause) {
        super(message, cause);
    }
}
