package com.melon.app.exception;

public class OrganizationDoesNotExistException extends OrganizationException {
    public OrganizationDoesNotExistException(String message) {
        super(message);
    }

    public OrganizationDoesNotExistException(String message, Throwable cause) {
        super(message, cause);
    }
}
