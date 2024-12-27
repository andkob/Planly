package com.melon.app.repository.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.melon.app.entity.chat.ChatRoom;

import java.util.List;

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
}
