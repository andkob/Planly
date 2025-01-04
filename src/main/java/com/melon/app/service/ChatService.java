package com.melon.app.service;

import com.melon.app.controller.DTO.OrganizationMemberDTO;
import com.melon.app.entity.Organization;
import com.melon.app.entity.OrganizationMembership;
import com.melon.app.entity.Role;
import com.melon.app.entity.User;
import com.melon.app.entity.chat.*;
import com.melon.app.exception.ChatRoomNotFoundException;
import com.melon.app.repository.UserRepository;
import com.melon.app.repository.chat.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.AccessDeniedException;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatRoomRepository chatRoomRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ChatRoomMemberRepository chatRoomMemberRepository;
    private final OrganizationService organizationService;

    @Transactional(readOnly = true)
    public List<ChatRoom> getUserChatRooms(Long userId, Long organizationId) {
        return chatRoomRepository.findUserChatRoomsInOrganization(userId, organizationId);
    }

    @Transactional
    public ChatRoom createChatRoom(Long organizationId, String name, ChatType type, Long creatorUserId, List<Long> memberIds) {
        // Verify creator is a member and is the Owner or an Admin
        Organization organization = organizationService.getOrganizationById(organizationId);
        OrganizationMembership creatorMembership = organization.getMemberships().stream()
            .filter(m -> m.getUser().getId().equals(creatorUserId) 
                        && (m.getRole().equals(Role.OWNER) 
                            || m.getRole().equals(Role.ADMIN)))
            .findFirst()
            .orElseThrow(() -> new AccessDeniedException("User is not authorized to create this chat room"));


        // create a list of OrganizationMemberships that match the given user IDs
        Set<OrganizationMembership> members = organization.getMemberships().stream()
            .filter(m -> memberIds.contains(m.getUser().getId()))
            .collect(Collectors.toSet());
        members.add(creatorMembership);

        // Create chat room
        ChatRoom chatRooom = new ChatRoom(name, organization, type, members);

        return chatRoomRepository.save(chatRooom);
    }

    @Transactional
    public void addMemberToChatRoom(Long chatRoomId, Long userId, Long organizationId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
            .orElseThrow(() -> new ChatRoomNotFoundException("Chat room not found"));

        Organization organization = organizationService.getOrganizationById(organizationId);
        OrganizationMembership membership = organization.getMemberships().stream()
            .filter(m -> m.getUser().getId().equals(userId))
            .findFirst()
            .orElseThrow(() -> new AccessDeniedException("User is not a member of this organization"));

        // Check if already a member
        Optional<ChatRoomMember> existingMember = chatRoom.getMembers().stream()
            .filter(m -> m.getOrganizationMembership().equals(membership))
            .findFirst();

        if (existingMember.isEmpty()) {
            ChatRoomMember member = new ChatRoomMember(chatRoom, membership);
            chatRoomMemberRepository.save(member);
        }
    }

    @Transactional
    public Message sendMessage(Long chatRoomId, Long senderId, String content) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
            .orElseThrow(() -> new ChatRoomNotFoundException("Chat room not found"));

        // Verify sender is a member of the chat room
        User sender = userRepository.findById(senderId)
        .orElseThrow(() -> new AccessDeniedException("User is not a member of this chat room"));

        Message message = new Message(chatRoom, sender, content);
        return messageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public List<Message> getChatRoomMessages(Long chatRoomId, Long userId) {
        // Verify user is a member of the chat room
        ChatRoomMember member = chatRoomMemberRepository.findByUserAndChatRoom(userId, chatRoomId);
        if (member == null) {
            throw new AccessDeniedException("User is not a member of this chat room");
        }

        return messageRepository.findByChatRoomIdOrderBySentAtAsc(chatRoomId);
    }

    @Transactional
    public void updateLastRead(Long chatRoomId, Long userId) {
        ChatRoomMember member = chatRoomMemberRepository.findByUserAndChatRoom(userId, chatRoomId);
        if (member == null) {
            throw new AccessDeniedException("User is not a member of this chat room");
        }

        member.setLastRead(LocalDateTime.now());
        chatRoomMemberRepository.save(member);
    }

    @Transactional(readOnly = true)
    public long getUnreadMessageCount(Long chatRoomId, Long userId) {
        ChatRoomMember member = chatRoomMemberRepository.findByUserAndChatRoom(userId, chatRoomId);
        if (member == null) {
            throw new AccessDeniedException("User is not a member of this chat room");
        }

        return messageRepository.countUnreadMessages(chatRoomId, member.getLastRead());
    }
}