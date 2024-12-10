package com.melon.app.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.melon.app.entity.User;
import com.melon.app.security.JwtUtil;
import com.melon.app.service.UserService;

/**
 * Controller for handling authentication-related operations, such as login and user registration.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Handles user login by verifying credentials and generating a JWT token on successful authentication.
     *
     * @param loginData a map containing "identifier" (email or username) and "password" keys.
     * @return a {@link ResponseEntity} containing a JWT token if authentication is successful, or an error message otherwise.
     */
    @PostMapping("/sessions")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> loginData) {
        Optional<User> user = userService.loginWithIdentifier(loginData.get("identifier"), loginData.get("password"));

        if (user.isPresent()) {
            String jwt = jwtUtil.generateToken(user.get().getUsername()); // Generate JWT on successful login
            return ResponseEntity.ok(Map.of("token", jwt));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid credentials"));
        }
    }

    /**
     * Handles user registration by validating input data and creating a new user.
     *
     * @param userData a map containing "email", "username", and "password" keys.
     * @return a {@link ResponseEntity} containing a success message if registration is successful, or an error message otherwise.
     */
    @PostMapping("/users")
    public ResponseEntity<Map<String, String>> register(@RequestBody Map<String, String> userData) {
        String email = userData.get("email");
        String username = userData.get("username");
        String p = userData.get("password");

        // Validate input data
        if (!isValidPassword(p))
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 8 characters with uppercase, lowercase, and numbers"));
        if (!isValidEmail(email))
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid email format"));
        if (!isValidUsername(username))
            return ResponseEntity.badRequest().body(Map.of("error", "Username must be at least 3 characters"));

        userService.registerUser(email, username, p);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Registration successful"));
    }

    /**
     * Validates the email format.
     *
     * @param email the email to validate.
     * @return true if the email is valid, false otherwise.
     */
    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }

    /**
     * Validates the password according to the criteria: minimum 8 characters, at least one uppercase letter,
     * one lowercase letter, and one number.
     *
     * @param p the password to validate.
     * @return true if the password is valid, false otherwise.
     */
    private boolean isValidPassword(String p) {
        return p != null && 
               p.length() >= 8 && 
               p.matches(".*[A-Z].*") && 
               p.matches(".*[a-z].*") && 
               p.matches(".*\\d.*");
    }

    /**
     * Validates the username by checking its length.
     *
     * @param username the username to validate.
     * @return true if the username is at least 3 characters long, false otherwise.
     */
    private boolean isValidUsername(String username) {
        return username != null && username.length() >= 3;
    }
}
