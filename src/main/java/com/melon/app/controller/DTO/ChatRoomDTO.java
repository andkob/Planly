package com.melon.app.controller.DTO;

import com.melon.app.entity.chat.ChatRoom;
import com.melon.app.entity.chat.ChatRoomMember;
import com.melon.app.entity.chat.ChatType;
import com.melon.app.entity.chat.Message;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
public class ChatRoomDTO {
    private Long id;
    private String name;
    private Long organizationId;
    private String organizationName;
    private ChatType type;
    private LocalDateTime createdAt;
    private int memberCount;
    private Set<ChatRoomMemberDTO> members;
    private Long unreadMessages;
    private MessageDTO lastMessage;
    
    public static List<ChatRoomDTO> fromEntityList(List<ChatRoom> chatRooms) {
        if (chatRooms == null) {
            return new ArrayList<>();
        }
        return chatRooms.stream()
            .map(ChatRoomDTO::fromEntity)
            .collect(Collectors.toList());
    }

    public static ChatRoomDTO fromEntity(ChatRoom chatRoom) {
        ChatRoomDTO dto = new ChatRoomDTO();
        dto.setId(chatRoom.getId());
        dto.setName(chatRoom.getName());
        dto.setOrganizationId(chatRoom.getOrganization().getId());
        dto.setOrganizationName(chatRoom.getOrganization().getOrganizationName());
        dto.setType(chatRoom.getType());
        dto.setCreatedAt(chatRoom.getCreatedAt());
        dto.setMemberCount(chatRoom.getMembers().size());
        
        // Convert members to DTOs
        dto.setMembers(chatRoom.getMembers().stream()
            .map(ChatRoomMemberDTO::fromEntity)
            .collect(Collectors.toSet()));

        return dto;
    }

    @Data
    @NoArgsConstructor
    public static class ChatRoomMemberDTO {
        private Long userId;
        private String username;
        private LocalDateTime lastRead;

        public static ChatRoomMemberDTO fromEntity(ChatRoomMember member) {
            ChatRoomMemberDTO dto = new ChatRoomMemberDTO();
            dto.setUserId(member.getOrganizationMembership().getUser().getId());
            dto.setUsername(member.getOrganizationMembership().getUser().getUsername());
            dto.setLastRead(member.getLastRead());
            return dto;
        }
    }

    @Data
    @NoArgsConstructor
    public static class MessageDTO {
        private Long id;
        private Long senderId;
        private String senderUsername;
        private String content;
        private LocalDateTime sentAt;
        private boolean isEdited;
        private boolean isOwn;

        public static List<MessageDTO> fromEntityList(List<Message> messages, Long currentUserId) {
            if (messages == null) {
                return new ArrayList<>();
            }
            return messages.stream()
                .map(msg -> MessageDTO.fromEntity(msg, currentUserId))
                .collect(Collectors.toList());
        }

        public static MessageDTO fromEntity(Message message, Long currentUserId) {
            MessageDTO dto = new MessageDTO();
            dto.setId(message.getId());
            dto.setSenderId(message.getSender().getId());
            dto.setSenderUsername(message.getSender().getUsername());
            dto.setContent(message.getContent());
            dto.setSentAt(message.getSentAt());
            dto.setEdited(message.isEdited());
            dto.setOwn(message.getSender().getId().equals(currentUserId));
            return dto;
        }
    }
}