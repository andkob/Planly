package com.melon.app.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.melon.app.controller.DTO.Auth.LoginRequest;
import com.melon.app.controller.DTO.Auth.RegistrationRequest;
import com.melon.app.entity.User;
import com.melon.app.exception.EmailAlreadyExistsException;
import com.melon.app.exception.IncorrectPasswordException;
import com.melon.app.exception.UserNoExistException;
import com.melon.app.exception.UsernameAlreadyExistsException;
import com.melon.app.security.JwtUtil;
import com.melon.app.service.UserService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

/**
 * Controller for handling authentication-related operations, such as login and user registration.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController extends BaseController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    private void addJwtCookie(HttpServletResponse response, String jwt) {
        Cookie cookie = new Cookie("jwt", jwt);
        cookie.setHttpOnly(true);
        cookie.setSecure(true); // only send over https
        cookie.setPath("/");
        cookie.setMaxAge(36000); // 10 hrs

        // In development, you might want to set the domain explicitly
        // jwtCookie.setDomain("localhost");

        response.addCookie(cookie);
    }

    /**
     * Handles user login by verifying credentials and generating a JWT token on successful authentication.
     */
    @PostMapping("/sessions")
    public ResponseEntity<Map<String, String>> login(
            @Valid @RequestBody LoginRequest loginReqest,
            BindingResult bindingResult,
            HttpServletResponse response) {
            
        if (bindingResult.hasErrors()) {
            return handleValidationErrors(bindingResult);
        }

        String sanitizedIdentifier = sanitizeInput(loginReqest.getIdentifier());

        if (!isValidLength(sanitizedIdentifier, 3, MAX_USERNAME_LENGTH)) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid identifier length");
        }

        try {
            Optional<User> user = userService.loginWithIdentifier(sanitizedIdentifier, loginReqest.getPassword());
            
            if (user.isPresent()) {
                String jwt = jwtUtil.generateToken(user.get().getUsername());
                addJwtCookie(response, jwt); // Add the HTTP only cookie containing the JWT
                logSecurityEvent("Login", "Successful login for user: " + sanitizedIdentifier);
                return createSuccessResponse("Login successful");
            } else {
                logSecurityEvent("Login", "Failed login attempt for user: " + sanitizedIdentifier);
                return createErrorResponse(HttpStatus.UNAUTHORIZED, "Invalid credentials");
            }
        } catch (UserNoExistException | IncorrectPasswordException e) {
            logSecurityEvent("Login", "Failed login attempt for: " + sanitizedIdentifier);
            return createErrorResponse(HttpStatus.UNAUTHORIZED, e.getMessage());
        } catch (Exception e) {
            logError("Login error", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An error occurred during authentication");
        }
    }

    /**
     * Handles user registration by validating input data and creating a new user.
     */
    @PostMapping("/users")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegistrationRequest registrationRequest, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return handleValidationErrors(bindingResult);
        }

        String sanitizedEmail = sanitizeInput(registrationRequest.getEmail());
        String sanitizedUsername = sanitizeInput(registrationRequest.getUsername());

        // length checks before expensive validations
        if (!isValidLength(sanitizedEmail, 5, MAX_EMAIL_LENGTH)) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid email length");
        }
        if (!isValidLength(sanitizedUsername, 3, MAX_USERNAME_LENGTH)) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid username length");
        }
        if (!isValidLength(registrationRequest.getPassword(), 8, MAX_PASSWORD_LENGTH)) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid password length");
        }

        // input validation
        if (!isValidEmail(sanitizedEmail)) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid email format");
        }
        if (!isValidUsername(sanitizedUsername)) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid username format");
        }
        if (!isValidPassword(registrationRequest.getPassword())) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, 
                "Password must be 8-128 characters with uppercase, lowercase, number, and special character");
        }

        try {
            userService.registerUser(sanitizedEmail, sanitizedUsername, registrationRequest.getPassword());
            logSecurityEvent("Registration", "Successful registration for user: " + sanitizedUsername);
            return createSuccessResponse("Registration successful");
        } catch (EmailAlreadyExistsException e) {
            logSecurityEvent("Registration", "Duplicate email registration attempt for: " + sanitizedEmail);
            return createErrorResponse(HttpStatus.CONFLICT, e.getMessage());
        } catch (UsernameAlreadyExistsException e) {
            logSecurityEvent("Registration", "Duplicate username registration attempt for: " + sanitizedUsername);
            return createErrorResponse(HttpStatus.CONFLICT, e.getMessage());
        } catch (Exception e) {
            logError("Registration error", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "An error occurred during registration");
        }
    }

    /**
     * Validates the current session and returns basic user info if authenticated
     */
    @GetMapping("/validate")
    public ResponseEntity<?> validateSession(Authentication authentication, HttpServletResponse response) {
        if (authentication != null && authentication.isAuthenticated()) {
            User user = (User) authentication.getPrincipal();
            return ResponseEntity.ok(Map.of(
                "authenticated", true,
                "username", user.getUsername()
            ));
        }
        clearJwtCookie(response);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("authenticated", false));
    }

    /**
     * Handles user logout by clearing the JWT cookie.
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        clearJwtCookie(response);
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }

    private HttpServletResponse clearJwtCookie(HttpServletResponse response) {
        // Create a cookie with the same name but null value and 0 max age to remove it
        Cookie jwtCookie = new Cookie("jwt", null);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(true);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(0); // Immediately expires the cookie
        
        response.addCookie(jwtCookie);
        return response;
    }
}
