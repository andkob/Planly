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

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/user/login")
    public ResponseEntity<String> login(@RequestParam String identifier, @RequestParam String password) {
        Optional<User> user = userService.loginWithIdentifier(identifier, password);
        
        if (user.isPresent()) {
            String jwt = jwtUtil.generateToken(user.get().getUsername()); // Generate JWT on successful login
            return ResponseEntity.ok().body("{\"token\": \"" + jwt + "\"}");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    @PostMapping("/user/register")
    public ResponseEntity<String> register(@RequestBody Map<String, String> userData) {
        String email = userData.get("email");
        String username = userData.get("username");
        String p = userData.get("password");

        // validate
        if (!isValidPassword(p))        return ResponseEntity.badRequest().body("Password must be at least 8 characters with uppercase, lowercase, and numbers");
        if (!isValidEmail(email))       return ResponseEntity.badRequest().body("Invalid email format");
        if (!isValidUsername(username)) return ResponseEntity.badRequest().body("Username must be at least 3 characters");

        userService.registerUser(email, username, p);
        return ResponseEntity.ok("Registration successful");
    }

    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }
    
    private boolean isValidPassword(String p) {
        return p != null && 
               p.length() >= 8 && 
               p.matches(".*[A-Z].*") && 
               p.matches(".*[a-z].*") && 
               p.matches(".*\\d.*");
    }
    
    private boolean isValidUsername(String username) {
        return username != null && username.length() >= 3;
    }
}
