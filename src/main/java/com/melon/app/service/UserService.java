package com.melon.app.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.melon.app.entity.User;
import com.melon.app.repository.UserRepository;

import jakarta.servlet.http.HttpSession;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Optional<User> login(String email, String password, HttpSession session) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent() && passwordEncoder.matches(password, user.get().getPasswordHash())) {
            session.setAttribute("user", user.get()); // store the user in the session
            return user;
        }
        return Optional.empty();
    }

    public User registerUser(String email, String password) {
        String passwordHash = passwordEncoder.encode(password);
        User user = new User(email, passwordHash);
        return userRepository.save(user);
    }
}
