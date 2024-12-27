package com.melon.app.service;

import com.melon.app.entity.*;
import com.melon.app.entity.chat.*;
import com.melon.app.repository.chat.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {
    @Mock
    private ChatRoomRepository chatRoomRepository;
    @Mock
    private MessageRepository messageRepository;
    @Mock
    private ChatRoomMemberRepository chatRoomMemberRepository;
    @Mock
    private OrganizationService organizationService;

    @InjectMocks
    private ChatService chatService;

    private User testUser;
    private Organization testOrg;
    private ChatRoom testChatRoom;
    private OrganizationMembership testMembership;

    @BeforeEach
    void setUp() {
        testUser = new User(1L, "test@example.com", "testuser");
        testOrg = new Organization(1L, "Test Org");
        testChatRoom = new ChatRoom("Test Room", testOrg, ChatType.GROUP);
        testMembership = new OrganizationMembership(testUser, testOrg, Role.MEMBER);
        
        testOrg.setOwner(testUser);
        Set<OrganizationMembership> memberships = new HashSet<>();
        memberships.add(testMembership);
        testOrg.setMemberships(memberships);
    }

    @Test
    void createChatRoom_Success() {
        // Arrange
        when(organizationService.getOrganizationById(1L)).thenReturn(testOrg);
        when(chatRoomRepository.save(any(ChatRoom.class))).thenReturn(testChatRoom);
        when(chatRoomMemberRepository.save(any(ChatRoomMember.class))).thenReturn(new ChatRoomMember());

        // Act
        ChatRoom result = chatService.createChatRoom(1L, "Test Room", ChatType.GROUP, 1L);

        // Assert
        assertNotNull(result);
        assertEquals("Test Room", result.getName());
        verify(chatRoomRepository).save(any(ChatRoom.class));
        verify(chatRoomMemberRepository).save(any(ChatRoomMember.class));
    }

    @Test
    void createChatRoom_UserNotInOrg_ThrowsAccessDeniedException() {
        // Arrange
        when(organizationService.getOrganizationById(1L)).thenReturn(testOrg);
        
        // Act & Assert
        assertThrows(AccessDeniedException.class, () -> 
            chatService.createChatRoom(1L, "Test Room", ChatType.GROUP, 999L)
        );
    }

    @Test
    void sendMessage_Success() {
        // Arrange
        ChatRoomMember member = new ChatRoomMember(testChatRoom, testMembership);
        testChatRoom.getMembers().add(member);
        
        when(chatRoomRepository.findById(1L)).thenReturn(Optional.of(testChatRoom));
        when(messageRepository.save(any(Message.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        Message result = chatService.sendMessage(1L, 1L, "Test message");

        // Assert
        assertNotNull(result);
        assertEquals("Test message", result.getContent());
        assertEquals(testUser, result.getSender());
        verify(messageRepository).save(any(Message.class));
    }

    @Test
    void sendMessage_UserNotInChatRoom_ThrowsAccessDeniedException() {
        // Arrange
        when(chatRoomRepository.findById(1L)).thenReturn(Optional.of(testChatRoom));

        // Act & Assert
        assertThrows(AccessDeniedException.class, () ->
            chatService.sendMessage(1L, 999L, "Test message")
        );
    }

    @Test
    void updateLastRead_Success() {
        // Arrange
        ChatRoomMember member = new ChatRoomMember(testChatRoom, testMembership);
        LocalDateTime beforeUpdate = member.getLastRead();
        
        when(chatRoomMemberRepository.findByUserAndChatRoom(1L, 1L)).thenReturn(member);
        when(chatRoomMemberRepository.save(any(ChatRoomMember.class))).thenReturn(member);

        // Act
        chatService.updateLastRead(1L, 1L);

        // Assert
        assertTrue(member.getLastRead().isAfter(beforeUpdate));
        verify(chatRoomMemberRepository).save(member);
    }

    @Test
    void updateLastRead_UserNotMember_ThrowsAccessDeniedException() {
        // Arrange
        when(chatRoomMemberRepository.findByUserAndChatRoom(999L, 1L)).thenReturn(null);

        // Act & Assert
        assertThrows(AccessDeniedException.class, () ->
            chatService.updateLastRead(1L, 999L)
        );
    }
}
