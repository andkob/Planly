package com.melon.app.repository.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.melon.app.entity.chat.ChatRoom;
import com.melon.app.entity.chat.ChatRoomMember;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    List<ChatRoom> findByOrganizationId(Long organizationId);
    
    @Query("SELECT cr FROM ChatRoom cr " +
           "JOIN cr.members m " +
           "JOIN m.organizationMembership om " +
           "WHERE om.user.id = :userId AND cr.organization.id = :orgId")
    List<ChatRoom> findUserChatRoomsInOrganization(
        @Param("userId") Long userId, 
        @Param("orgId") Long organizationId
    );

    @Query("SELECT m FROM ChatRoomMember m " +
           "WHERE m.chatRoom.id = :chatRoomId " +
           "AND m.organizationMembership.user.id = :userId")
    Optional<ChatRoomMember> findMemberByChatRoomAndUserId(
        @Param("chatRoomId") Long chatRoomId,
        @Param("userId") Long userId
    );

    void deleteById(Long id);
}
