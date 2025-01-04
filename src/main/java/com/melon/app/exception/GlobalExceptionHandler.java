package com.melon.app.exception;

import org.springframework.security.access.AccessDeniedException;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ControllerAdvice;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private void logError(String message, Exception e) {
        logger.error(message, e);
    }

    // Generic exception handler for unexpected exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleUnexpectedException(Exception e) {
        logError("Unexpected error occurred: ", e);
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "An unexpected error occurred. Please try again later."));
    }

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<Map<String, String>> handleInvalidRequestException(InvalidRequestException ex) {
        logError(ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleEmailAlreadyExists(EmailAlreadyExistsException ex) {
        logError(ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(UserNoExistException.class)
    public ResponseEntity<Map<String, String>> handleUserNoExistException(UserNoExistException ex) {
        logError(ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(IncorrectPasswordException.class)
    public ResponseEntity<Map<String, String>> handleIncorrectPasswordException(IncorrectPasswordException ex) {
        logError(ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(OrganizationException.class)
    public ResponseEntity<Map<String, String>> handleOrganizationException(OrganizationException ex) {
        logError(ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(OrganizationDoesNotExistException.class)
    public ResponseEntity<Map<String, String>> handleOrganizationDoesNotExistException(OrganizationDoesNotExistException ex) {
        logError(ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(InvalidIdException.class)
    public ResponseEntity<Map<String, String>> handleInvalidIdException(InvalidIdException ex) {
        logError(ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(CannotJoinOwnedOrgException.class)
    public ResponseEntity<Map<String, String>> handleCannotJoinOwnedOrgException(CannotJoinOwnedOrgException e) {
        logger.warn("Attempt to join owned organization: {}", Map.of("error", e.getMessage()));
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(ConflictingSchedulesException.class)
    public ResponseEntity<Map<String, String>> handleConflictingSchedulesException(ConflictingSchedulesException e) {
        logger.warn("Conflicting schedule detected: {}", Map.of("error", e.getMessage()));
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(CannotRemoveOwnerException.class)
    public ResponseEntity<Map<String, String>> handleCannotRemoveOwnerException(CannotRemoveOwnerException e) {
        logger.warn("Attempt to remove organization owner: {}", Map.of("error", e.getMessage()));
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(UsernameAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleUsernameAlreadyExistsException(UsernameAlreadyExistsException e) {
        logger.warn("Username already exists: {}", Map.of("error", e.getMessage()));
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(UserNotInOrganizationException.class)
    public ResponseEntity<Map<String, String>> handleUserNotInOrganizationException(UserNotInOrganizationException e) {
        logger.warn("User not in organization: {}", Map.of("error", e.getMessage()));
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDeniedException(AccessDeniedException e) {
        logger.warn("Access denied: {}", Map.of("error", e.getMessage()));
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(ChatRoomNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleChatRoomNotFoundException(ChatRoomNotFoundException e) {
        logger.warn("Chat room not found: {}", Map.of("error", e.getMessage()));
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
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
