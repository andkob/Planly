package com.melon.app.controller;

import org.owasp.encoder.Encode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;

import java.util.Map;
import java.util.regex.Pattern;

public abstract class BaseController {
    protected final Logger logger = LoggerFactory.getLogger(getClass());

    // Common constants for validation
    protected static final int MAX_EMAIL_LENGTH = 254;
    protected static final int MAX_USERNAME_LENGTH = 50;
    protected static final int MAX_PASSWORD_LENGTH = 128;
    protected static final int MAX_STRING_LENGTH = 1000;
    protected static final int MAX_NAME_LENGTH = 100;
    
    // Regex patterns
    protected static final Pattern EMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,63}$");
    protected static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9._-]{3,50}$");
    protected static final Pattern SAFE_STRING_PATTERN = Pattern.compile("^[a-zA-Z0-9\\s.,!?@#$%^&*()_+-=\\[\\]{}|;:'\"><~/]{1,1000}$");
    protected static final Pattern NAME_PATTERN = Pattern.compile("^[a-zA-Z0-9\\s-]{1,100}$");

    // Input validation methods
     /**
     * Validates if a string can be parsed into a valid ID.
     * 
     * @param id The ID string to validate
     * @return true if the ID is valid, false otherwise
     */
    protected boolean isValidId(String id) {
        if (id == null || id.trim().isEmpty()) {
            return false;
        }
        try {
            long numericId = Long.parseLong(id.trim());
            return isValidId(numericId);
        } catch (NumberFormatException e) {
            return false;
        }
    }

    /**
     * Validates if a numeric ID is valid.
     * 
     * @param id The numeric ID to validate
     * @return true if the ID is valid, false otherwise
     */
    protected boolean isValidId(Long id) {
        return id != null && id > 0 && id <= Long.MAX_VALUE;
    }

    protected boolean isValidEmail(String email) {
        return email != null && 
               email.length() <= MAX_EMAIL_LENGTH && 
               EMAIL_PATTERN.matcher(email).matches();
    }

    protected boolean isValidUsername(String username) {
        return username != null && 
               USERNAME_PATTERN.matcher(username).matches();
    }

    protected boolean isValidPassword(String password) {
        if (password == null || 
            password.length() < 8 || 
            password.length() > MAX_PASSWORD_LENGTH) {
            return false;
        }

        boolean hasUpper = false;
        boolean hasLower = false;
        boolean hasDigit = false;
        boolean hasSpecial = false;

        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else if (isSpecialCharacter(c)) hasSpecial = true;
        }

        return hasUpper && hasLower && hasDigit && hasSpecial;
    }

    protected boolean isValidSafeString(String input) {
        return input != null && 
               SAFE_STRING_PATTERN.matcher(input).matches();
    }

    protected boolean isValidName(String name) {
        return name != null && 
               NAME_PATTERN.matcher(name).matches();
    }

    // Input sanitization methods
    protected String sanitizeInput(String input) {
        if (input == null) return null;
        return Encode.forHtml(input.trim());
    }

    // TODO - may want to handle this exception in the GEH
    protected Long validateId(String id) {
        try {
            return Long.parseLong(id);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid ID format");
        }
    }

    // Common response methods
    protected ResponseEntity<Map<String, String>> handleValidationErrors(BindingResult bindingResult) {
        String errorMessage = bindingResult.getAllErrors().get(0).getDefaultMessage();
        return createErrorResponse(HttpStatus.BAD_REQUEST, errorMessage);
    }

    protected ResponseEntity<Map<String, String>> createErrorResponse(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("error", message));
    }

    protected ResponseEntity<Map<String, String>> createSuccessResponse(String message) {
        return ResponseEntity.ok().body(Map.of("message", message));
    }

    protected ResponseEntity<Map<String, Object>> createSuccessResponseWithPayload(String message, Object payload) {
        return ResponseEntity.ok().body(Map.of("message", message, "content", payload));
    }

    // Utility methods
    protected boolean isSpecialCharacter(char c) {
        String specialChars = "!@#$%^&*(),.?\":{}|<>";
        return specialChars.indexOf(c) != -1;
    }

    protected boolean isValidLength(String input, int min, int max) {
        return input != null && 
               input.length() >= min && 
               input.length() <= max;
    }

    // Logging methods
    protected void logSecurityEvent(String event, String details) {
        logger.info("Security Event - {}: {}", event, details);
    }

    protected void logError(String message, Exception e) {
        logger.error(message, e);
    }
}