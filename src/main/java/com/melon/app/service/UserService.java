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
import com.melon.app.repository.UserRepository;

@Service
public class UserService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isEmpty()) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }
        return user.get();
    }

    public Optional<User> login(String email, String password) {
        Optional<User> user = userRepository.findByEmail(email);
        if (!user.isPresent()) {
            throw new UserNoExistException("User " + email + " does not exist");
        } else if (!passwordEncoder.matches(password, user.get().getPassword())) {
            throw new IncorrectPasswordException("Incorrect password");
        }
        return user;
    }

    public User registerUser(String email, String password) throws EmailAlreadyExistsException {
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("Email is already in use.");
        }

        String passwordHash = passwordEncoder.encode(password);
        User user = new User(email, passwordHash);
        return userRepository.save(user);
    }

    public Set<Organization> getOrganizations(User user) {
        Long userId = userRepository.findById(user.getId()).get().getId(); // must reopen session to fetch the ID
        Set<Organization> orgs = userRepository.findOrganizationsByUserId(userId);
        return orgs;
    }
}
