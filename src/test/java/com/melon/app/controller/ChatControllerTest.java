package com.melon.app.controller;

import com.melon.app.entity.*;
import com.melon.app.entity.chat.ChatRoom;
import com.melon.app.entity.chat.ChatType;
import com.melon.app.entity.chat.Message;
import com.melon.app.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatControllerTest {
    @Mock
    private ChatService chatService;
    @Mock
    private ChatRoomMembershipService membershipService;

    @InjectMocks
    private ChatController chatController;

    private User testUser;
    private ChatRoom testChatRoom;
    private Message testMessage;

    @BeforeEach
    void setUp() {
        testUser = new User(1L, "test@example.com", "testuser");
        Organization testOrg = new Organization(1L, "Test Org");
        testChatRoom = new ChatRoom("Test Room", testOrg, ChatType.GROUP);
        testMessage = new Message(testChatRoom, testUser, "Test message");
    }

    @Test
    void getChatRooms_Success() {
        // Arrange
        List<ChatRoom> chatRooms = Arrays.asList(testChatRoom);
        when(chatService.getUserChatRooms(1L, 1L)).thenReturn(chatRooms);

        // Act
        ResponseEntity<?> response = chatController.getChatRooms("1", testUser);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(chatRooms, response.getBody());
    }

    @Test
    void getChatRooms_InvalidId_ReturnsBadRequest() {
        // Act
        ResponseEntity<?> response = chatController.getChatRooms("invalid", testUser);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(((Map<?, ?>)response.getBody()).get("error").toString().contains("Invalid"));
    }

    @Test
    void createChatRoom_Success() {
        // Arrange
        ChatController.CreateChatRoomRequest request = new ChatController.CreateChatRoomRequest();
        request.setName("Test Room");
        request.setOrganizationId(1L);
        request.setType(ChatType.GROUP);

        List<Long> members = new ArrayList<>();
        members.add(1L);
        when(chatService.createChatRoom(eq(1L), any(), eq(ChatType.GROUP), eq(1L), members))
            .thenReturn(testChatRoom);

        // Act
        ResponseEntity<?> response = chatController.createChatRoom(request, testUser);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>)response.getBody();
        assertEquals(testChatRoom, body.get("content"));
        assertTrue(body.get("message").toString().contains("success"));
    }

    @Test
    void createChatRoom_InvalidName_ReturnsBadRequest() {
        // Arrange
        ChatController.CreateChatRoomRequest request = new ChatController.CreateChatRoomRequest();
        request.setName("Test Room ###"); // Invalid name according to NAME_PATTERN
        request.setOrganizationId(1L);

        // Act
        ResponseEntity<?> response = chatController.createChatRoom(request, testUser);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void sendMessage_Success() {
        // Arrange
        ChatController.SendMessageRequest request = new ChatController.SendMessageRequest();
        request.setContent("Test message");

        when(chatService.sendMessage(eq(1L), eq(1L), any()))
            .thenReturn(testMessage);

        // Act
        ResponseEntity<?> response = chatController.sendMessage("1", request, testUser);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>)response.getBody();
        assertEquals(testMessage, body.get("content"));
    }

    @Test
    void sendMessage_AccessDenied_ReturnsForbidden() {
        // Arrange
        ChatController.SendMessageRequest request = new ChatController.SendMessageRequest();
        request.setContent("Test message");

        when(chatService.sendMessage(eq(1L), eq(1L), any()))
            .thenThrow(new AccessDeniedException("Not authorized"));

        // Act
        ResponseEntity<?> response = chatController.sendMessage("1", request, testUser);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    void addMembers_Success() {
        // Arrange
        ChatController.AddMembersRequest request = new ChatController.AddMembersRequest();
        request.setOrganizationId(1L);
        request.setMinimumRole(Role.MEMBER);

        // Act
        ResponseEntity<?> response = chatController.addMembers("1", request, testUser);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(membershipService).addMembersByCriteria(1L, 1L, Role.MEMBER);
    }

    @Test
    void removeMember_Success() {
        // Act
        ResponseEntity<?> response = chatController.removeMember("1", "2", testUser);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(membershipService).removeMember(1L, 2L);
    }

    @Test
    void markAsRead_Success() {
        // Act
        ResponseEntity<?> response = chatController.markAsRead("1", testUser);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(chatService).updateLastRead(1L, 1L);
        Map<?, ?> body = (Map<?, ?>)response.getBody();
        assertTrue(body.get("message").toString().contains("marked as read"));
    }

    @Test
    void markAsRead_InvalidId_ReturnsBadRequest() {
        // Act
        ResponseEntity<?> response = chatController.markAsRead("invalid", testUser);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(((Map<?, ?>)response.getBody()).get("error").toString().contains("Invalid"));
    }

    @Test
    void markAsRead_AccessDenied_ReturnsForbidden() {
        // Arrange
        doThrow(new AccessDeniedException("Not authorized"))
            .when(chatService).updateLastRead(1L, 1L);

        // Act
        ResponseEntity<?> response = chatController.markAsRead("1", testUser);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertTrue(((Map<?, ?>)response.getBody()).get("error").toString().contains("Not authorized"));
    }

    @Test
    void getUnreadCount_Success() {
        // Arrange
        when(chatService.getUnreadMessageCount(1L, 1L)).thenReturn(5L);

        // Act
        ResponseEntity<?> response = chatController.getUnreadCount("1", testUser);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<?, ?> body = (Map<?, ?>)response.getBody();
        assertEquals(5L, body.get("unreadCount"));
    }

    @Test
    void getUnreadCount_InvalidId_ReturnsBadRequest() {
        // Act
        ResponseEntity<?> response = chatController.getUnreadCount("invalid", testUser);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(((Map<?, ?>)response.getBody()).get("error").toString().contains("Invalid"));
    }

    @Test
    void getUnreadCount_AccessDenied_ReturnsForbidden() {
        // Arrange
        when(chatService.getUnreadMessageCount(1L, 1L))
            .thenThrow(new AccessDeniedException("Not authorized"));

        // Act
        ResponseEntity<?> response = chatController.getUnreadCount("1", testUser);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertTrue(((Map<?, ?>)response.getBody()).get("error").toString().contains("Not authorized"));
    }
}