package com.melon.app.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.*;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.melon.app.entity.Organization;
import com.melon.app.entity.User;
import com.melon.app.exception.EmailAlreadyExistsException;
import com.melon.app.exception.IncorrectPasswordException;
import com.melon.app.exception.UserNoExistException;
import com.melon.app.exception.UsernameAlreadyExistsException;
import com.melon.app.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private final String TEST_EMAIL = "test@example.com";
    private final String TEST_USERNAME = "testuser";
    private final String TEST_PASSWORD = "password123";
    private final Long TEST_ID = 1L;

    @BeforeEach
    void setUp() {
        testUser = new User(TEST_ID, TEST_EMAIL, TEST_USERNAME);
    }

    @Test
    void loadUserByUsername_UserExists_ReturnsUser() {
        when(userRepository.findByUsername(TEST_USERNAME)).thenReturn(Optional.of(testUser));
        
        assertEquals(testUser, userService.loadUserByUsername(TEST_USERNAME));
    }

    @Test
    void loadUserByUsername_UserNotFound_ThrowsException() {
        when(userRepository.findByUsername(TEST_USERNAME)).thenReturn(Optional.empty());
        
        assertThrows(org.springframework.security.core.userdetails.UsernameNotFoundException.class, 
            () -> userService.loadUserByUsername(TEST_USERNAME));
    }

    @Test
    void loginWithIdentifier_ValidCredentials_ReturnsUser() {
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(TEST_PASSWORD, testUser.getPassword())).thenReturn(true);
        
        Optional<User> result = userService.loginWithIdentifier(TEST_EMAIL, TEST_PASSWORD);
        assertTrue(result.isPresent());
        assertEquals(testUser, result.get());
    }

    @Test
    void loginWithIdentifier_UserNotFound_ThrowsException() {
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.empty());
        
        assertThrows(UserNoExistException.class, 
            () -> userService.loginWithIdentifier(TEST_EMAIL, TEST_PASSWORD));
    }

    @Test
    void loginWithIdentifier_IncorrectPassword_ThrowsException() {
        when(userRepository.findByEmail(TEST_EMAIL)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(TEST_PASSWORD, testUser.getPassword())).thenReturn(false);
        
        assertThrows(IncorrectPasswordException.class, 
            () -> userService.loginWithIdentifier(TEST_EMAIL, TEST_PASSWORD));
    }

    @Test
    void registerUser_NewUser_Success() {
        when(userRepository.existsByEmail(TEST_EMAIL)).thenReturn(false);
        when(userRepository.existsByUsername(TEST_USERNAME)).thenReturn(false);
        when(passwordEncoder.encode(TEST_PASSWORD)).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        
        User result = userService.registerUser(TEST_EMAIL, TEST_USERNAME, TEST_PASSWORD);
        assertNotNull(result);
        assertEquals(testUser, result);
    }

    @Test
    void registerUser_EmailExists_ThrowsException() {
        when(userRepository.existsByEmail(TEST_EMAIL)).thenReturn(true);
        
        assertThrows(EmailAlreadyExistsException.class, 
            () -> userService.registerUser(TEST_EMAIL, TEST_USERNAME, TEST_PASSWORD));
    }

    @Test
    void registerUser_UsernameExists_ThrowsException() {
        when(userRepository.existsByEmail(TEST_EMAIL)).thenReturn(false);
        when(userRepository.existsByUsername(TEST_USERNAME)).thenReturn(true);
        
        assertThrows(UsernameAlreadyExistsException.class, 
            () -> userService.registerUser(TEST_EMAIL, TEST_USERNAME, TEST_PASSWORD));
    }

    @Test
    void getOrganizations_ReturnsUserOrgs() {
        Set<Organization> expectedOrgs = new HashSet<>();
        when(userRepository.findById(TEST_ID)).thenReturn(Optional.of(testUser));
        when(userRepository.findOrganizationsByUserId(TEST_ID)).thenReturn(expectedOrgs);
        
        Set<Organization> result = userService.getOrganizations(testUser);
        assertEquals(expectedOrgs, result);
    }
}