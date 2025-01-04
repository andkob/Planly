package com.melon.app.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.melon.app.controller.DTO.ChatRoomDTO;
import com.melon.app.controller.DTO.ChatRoomDTO.MessageDTO;
import com.melon.app.entity.Role;
import com.melon.app.entity.User;
import com.melon.app.entity.chat.ChatRoom;
import com.melon.app.entity.chat.ChatType;
import com.melon.app.entity.chat.Message;
import com.melon.app.service.ChatRoomMembershipService;
import com.melon.app.service.ChatService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController extends BaseController {
    private final ChatService chatService;
    private final ChatRoomMembershipService membershipService;
    
    // DTOs
    @Data
    public static class CreateChatRoomRequest {
        @NotBlank(message = "Chat room name is required")
        @Size(max = MAX_NAME_LENGTH, message = "Chat room name is too long")
        private String name;
        
        private Long organizationId;
        private ChatType type;
        private List<Long> memberIds;
    }
    
    @Data
    public static class SendMessageRequest {
        @NotBlank(message = "Message content is required")
        @Size(max = MAX_STRING_LENGTH, message = "Message is too long")
        private String content;
    }
    
    @Data
    public static class AddMembersRequest {
        private Long organizationId;
        private Role minimumRole;
    }

    // Chat Room Endpoints
    @GetMapping("/rooms/organization/{orgId}")
    public ResponseEntity<?> getChatRooms(
            @PathVariable String orgId,
            @AuthenticationPrincipal User currentUser) {

        Long organizationId = validateId(orgId);
        if (!isValidId(organizationId)) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid organization ID");
        }

        List<ChatRoom> rooms = chatService.getUserChatRooms(currentUser.getId(), organizationId);
        List<ChatRoomDTO> dtos = ChatRoomDTO.fromEntityList(rooms);
        return createSuccessResponseWithPayload("Successfully fetched chat rooms", dtos);
    }

    @PostMapping("/rooms")
    public ResponseEntity<?> createChatRoom(
            @Valid @RequestBody CreateChatRoomRequest request,
            @AuthenticationPrincipal User currentUser) {
        if (!isValidName(request.getName())) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid chat room name");
        }

        if (!isValidId(request.getOrganizationId())) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid organization ID");
        }

        String sanitizedName = sanitizeInput(request.getName());
        ChatRoom chatRoom = chatService.createChatRoom(
            request.getOrganizationId(),
            sanitizedName,
            request.getType(),
            currentUser.getId(),
            request.getMemberIds()
        );

        // TODO - should be a DTO
        return createSuccessResponseWithPayload("Chat room created successfully", chatRoom);
    }

    // Message Endpoints
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<?> getChatMessages(
            @PathVariable String roomId,
            @AuthenticationPrincipal User currentUser) {
        Long chatRoomId = validateId(roomId);
        if (!isValidId(chatRoomId)) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid chat room ID");
        }

        List<Message> messages = chatService.getChatRoomMessages(chatRoomId, currentUser.getId());
        List<MessageDTO> dtos = MessageDTO.fromEntityList(messages, currentUser.getId());

        return createSuccessResponseWithPayload("Successfully fetched messages", dtos);
    }

    @PostMapping("/rooms/{roomId}/messages")
    public ResponseEntity<?> sendMessage(
            @PathVariable String roomId,
            @Valid @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal User currentUser) {
        
        Long chatRoomId = validateId(roomId);
        if (!isValidId(chatRoomId)) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid chat room ID");
        }

        if (!isValidSafeString(request.getContent())) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid message content");
        }

        String sanitizedContent = sanitizeInput(request.getContent());
        Message message = chatService.sendMessage(chatRoomId, currentUser.getId(), sanitizedContent);
        return createSuccessResponseWithPayload("Message sent successfully", message);
    }

    // Member Management Endpoints
    @PostMapping("/rooms/{roomId}/members")
    public ResponseEntity<?> addMembers(
            @PathVariable String roomId,
            @Valid @RequestBody AddMembersRequest request,
            @AuthenticationPrincipal User currentUser) {
        Long chatRoomId = validateId(roomId);
        if (!isValidId(chatRoomId) || !isValidId(request.getOrganizationId())) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid ID provided");
        }

        membershipService.addMembersByCriteria(
            chatRoomId,
            request.getOrganizationId(),
            request.getMinimumRole()
        );
        
        return createSuccessResponse("Members added successfully");
    }

    @DeleteMapping("/rooms/{roomId}/members/{userId}")
    public ResponseEntity<?> removeMember(
            @PathVariable String roomId,
            @PathVariable String userId,
            @AuthenticationPrincipal User currentUser) {
        Long chatRoomId = validateId(roomId);
        Long memberUserId = validateId(userId);
        
        if (!isValidId(chatRoomId) || !isValidId(memberUserId)) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid ID provided");
        }

        membershipService.removeMember(chatRoomId, memberUserId);
        return createSuccessResponse("Member removed successfully");
    }

    // Read Status Endpoints
    @PostMapping("/rooms/{roomId}/mark-read")
    public ResponseEntity<?> markAsRead(
            @PathVariable String roomId,
            @AuthenticationPrincipal User currentUser) {
        Long chatRoomId = validateId(roomId);
        if (!isValidId(chatRoomId)) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid chat room ID");
        }

        chatService.updateLastRead(chatRoomId, currentUser.getId());
        return createSuccessResponse("Messages marked as read");
    }

    @GetMapping("/rooms/{roomId}/unread-count")
    public ResponseEntity<?> getUnreadCount(
            @PathVariable String roomId,
            @AuthenticationPrincipal User currentUser) {
        Long chatRoomId = validateId(roomId);
        if (!isValidId(chatRoomId)) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid chat room ID");
        }

        long unreadCount = chatService.getUnreadMessageCount(chatRoomId, currentUser.getId());
        return ResponseEntity.ok(Map.of("unreadCount", unreadCount));
    }
}