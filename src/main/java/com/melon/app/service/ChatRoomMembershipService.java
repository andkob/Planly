package com.melon.app.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.melon.app.entity.Organization;
import com.melon.app.entity.Role;
import com.melon.app.entity.chat.ChatRoom;
import com.melon.app.entity.chat.ChatRoomMember;
import com.melon.app.repository.chat.ChatRoomMemberRepository;
import com.melon.app.repository.chat.ChatRoomRepository;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatRoomMembershipService {
    private final ChatRoomMemberRepository chatRoomMemberRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final OrganizationService organizationService;

    @Transactional
    public void addMembersByCriteria(Long chatRoomId, Long organizationId, Role minimumRole) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        Organization organization = organizationService.getOrganizationById(organizationId);

        // Add all org members that meet the role criteria
        organization.getMemberships().stream()
                .filter(m -> m.getRole().ordinal() >= minimumRole.ordinal())
                .forEach(membership -> {
                    // Check if not already a member
                    boolean isMember = chatRoom.getMembers().stream()
                            .anyMatch(m -> m.getOrganizationMembership().equals(membership));

                    if (!isMember) {
                        ChatRoomMember member = new ChatRoomMember(chatRoom, membership);
                        chatRoomMemberRepository.save(member);
                    }
                });
    }

    @Transactional
    public void removeMember(Long chatRoomId, Long userId) {
        ChatRoomMember member = chatRoomMemberRepository.findByUserAndChatRoom(userId, chatRoomId);
        if (member != null) {
            chatRoomMemberRepository.delete(member);
        }
    }

    @Transactional(readOnly = true)
    public List<ChatRoomMember> getChatRoomMembers(Long chatRoomId) {
        return chatRoomMemberRepository.findByChatRoomId(chatRoomId);
    }
}