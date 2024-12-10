package com.melon.app.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.ResponseBody;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Generic exception handler for unexpected exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleUnexpectedException(Exception e) {
        logger.error("Unexpected error occurred: ", e);
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("An unexpected error occurred. Please try again later.");
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT) // 409 Conflict
    @ResponseBody
    public String handleEmailAlreadyExists(EmailAlreadyExistsException ex) {
        return ex.getMessage();
    }

    @ExceptionHandler(UserNoExistException.class)
    public ResponseEntity<String> handleUserNoExistException(UserNoExistException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(IncorrectPasswordException.class)
    public ResponseEntity<String> handleIncorrectPasswordException(IncorrectPasswordException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
    }

    @ExceptionHandler(OrganizationException.class)
    public ResponseEntity<String> handleOrganizationException(OrganizationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }

    @ExceptionHandler(OrganizationDoesNotExistException.class)
    public ResponseEntity<String> handleOrganizationDoesNotExistException(OrganizationDoesNotExistException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(InvalidIdException.class)
    public ResponseEntity<String> handleInvalidIdException(InvalidIdException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    @ExceptionHandler(CannotJoinOwnedOrgException.class)
    public ResponseEntity<String> handleCannotJoinOwnedOrgException(CannotJoinOwnedOrgException e) {
        logger.warn("Attempt to join owned organization: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }

    @ExceptionHandler(ConflictingSchedulesException.class)
    public ResponseEntity<String> handleConflictingSchedulesException(ConflictingSchedulesException e) {
        logger.warn("Conflicting schedule detected: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }

    @ExceptionHandler(CannotRemoveOwnerException.class)
    public ResponseEntity<String> handleCannotRemoveOwnerException(CannotRemoveOwnerException e) {
        logger.warn("Attempt to remove organization owner: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
    }

    @ExceptionHandler(UsernameAlreadyExistsException.class)
    public ResponseEntity<String> handleUsernameAlreadyExistsException(UsernameAlreadyExistsException e) {
        logger.warn("Username already exists: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
    }

    @ExceptionHandler(UserNotInOrganizationException.class)
    public ResponseEntity<String> handleUserNotInOrganizationException(UserNotInOrganizationException e) {
        logger.warn("User not in organization: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
    }

    // Class to represent the error response structure
    public static class ErrorResponse {
        private String error;
        private String message;

        public ErrorResponse(String error, String message) {
            this.error = error;
            this.message = message;
        }

        public String getError() {
            return error;
        }

        public String getMessage() {
            return message;
        }
    }
}
