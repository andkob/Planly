package com.melon.app.service;

import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.melon.app.entity.Organization;
import com.melon.app.entity.User;
import com.melon.app.exception.EmailAlreadyExistsException;
import com.melon.app.exception.IncorrectPasswordException;
import com.melon.app.exception.UserNoExistException;
import com.melon.app.exception.UsernameAlreadyExistsException;
import com.melon.app.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class UserService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) {
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isEmpty()) {
            throw new UsernameNotFoundException("User not found with email: " + username);
        }
        return user.get();
    }

    /**
     * @deprecated
     * Allows log in only with email
     * @param email
     * @param password
     * @return
     */
    @Transactional
    public Optional<User> login(String email, String password) {
        Optional<User> user = userRepository.findByEmail(email);
        if (!user.isPresent()) {
            throw new UserNoExistException("User " + email + " does not exist");
        } else if (!passwordEncoder.matches(password, user.get().getPassword())) {
            throw new IncorrectPasswordException("Incorrect password");
        }
        return user;
    }

    @Transactional
    public Optional<User> loginWithIdentifier(String identifier, String password) {
        Optional<User> user = userRepository.findByEmail(identifier);
    
        // If not found by email, try username
        if (user.isEmpty()) {
            user = userRepository.findByUsername(identifier);
        }

        if (!user.isPresent()) {
            throw new UserNoExistException("User " + identifier + " does not exist");
        } else if (!passwordEncoder.matches(password, user.get().getPassword())) {
            throw new IncorrectPasswordException("Incorrect password");
        }
        return user;
    }

    @Transactional
    public User registerUser(String email, String username, String password) throws EmailAlreadyExistsException {
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("Email is already in use.");
        }
        if (userRepository.existsByUsername(username)) {
            throw new UsernameAlreadyExistsException("Username is already in use.");
        }

        String passwordHash = passwordEncoder.encode(password);
        password = null;
        User user = new User(email, username, passwordHash);
        return userRepository.save(user);
    }

    public Set<Organization> getOrganizations(User user) {
        Long userId = userRepository.findById(user.getId()).get().getId(); // must reopen session to fetch the ID
        Set<Organization> orgs = userRepository.findOrganizationsByUserId(userId);
        return orgs;
    }
}
