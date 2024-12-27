package com.melon.app.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.melon.app.entity.Organization;
import com.melon.app.entity.OrganizationMembership;
import com.melon.app.entity.Role;
import com.melon.app.entity.User;
import com.melon.app.entity.chat.ChatRoom;
import com.melon.app.entity.chat.ChatRoomMember;
import com.melon.app.entity.chat.ChatType;
import com.melon.app.repository.chat.ChatRoomMemberRepository;
import com.melon.app.repository.chat.ChatRoomRepository;

@ExtendWith(MockitoExtension.class)
class ChatRoomMembershipServiceTest {
    @Mock
    private ChatRoomMemberRepository chatRoomMemberRepository;
    @Mock
    private ChatRoomRepository chatRoomRepository;
    @Mock
    private OrganizationService organizationService;

    @InjectMocks
    private ChatRoomMembershipService membershipService;

    private ChatRoom testChatRoom;
    private Organization testOrg;
    private User testUser;
    private OrganizationMembership testMembership;

    @BeforeEach
    void setUp() {
        testUser = new User(1L, "test@example.com", "testuser");
        testOrg = new Organization(1L, "Test Org");
        testChatRoom = new ChatRoom("Test Room", testOrg, ChatType.GROUP);
        testMembership = new OrganizationMembership(testUser, testOrg, Role.MEMBER);
        
        Set<OrganizationMembership> memberships = new HashSet<>();
        memberships.add(testMembership);
        testOrg.setMemberships(memberships);
    }

    @Test
    void addMembersByCriteria_Success() {
        // Arrange
        when(chatRoomRepository.findById(1L)).thenReturn(Optional.of(testChatRoom));
        when(organizationService.getOrganizationById(1L)).thenReturn(testOrg);
        when(chatRoomMemberRepository.save(any(ChatRoomMember.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        membershipService.addMembersByCriteria(1L, 1L, Role.MEMBER);

        // Assert
        verify(chatRoomMemberRepository).save(any(ChatRoomMember.class));
    }

    @Test
    void addMembersByCriteria_ChatRoomNotFound_ThrowsException() {
        // Arrange
        when(chatRoomRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () ->
            membershipService.addMembersByCriteria(1L, 1L, Role.MEMBER)
        );
    }

    @Test
    void removeMember_Success() {
        // Arrange
        ChatRoomMember member = new ChatRoomMember(testChatRoom, testMembership);
        when(chatRoomMemberRepository.findByUserAndChatRoom(1L, 1L)).thenReturn(member);

        // Act
        membershipService.removeMember(1L, 1L);

        // Assert
        verify(chatRoomMemberRepository).delete(member);
    }

    @Test
    void removeMember_MemberNotFound_NoAction() {
        // Arrange
        when(chatRoomMemberRepository.findByUserAndChatRoom(1L, 1L)).thenReturn(null);

        // Act
        membershipService.removeMember(1L, 1L);

        // Assert
        verify(chatRoomMemberRepository, never()).delete(any());
    }
}