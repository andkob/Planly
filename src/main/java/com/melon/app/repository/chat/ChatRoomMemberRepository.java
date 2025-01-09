package com.melon.app.repository.chat;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.melon.app.entity.chat.ChatRoomMember;

@Repository
public interface ChatRoomMemberRepository extends JpaRepository<ChatRoomMember, Long> {
    List<ChatRoomMember> findByChatRoomId(Long chatRoomId);
    
    @Query("SELECT crm FROM ChatRoomMember crm " +
           "WHERE crm.chatRoom.id = :chatRoomId " +
           "AND crm.organizationMembership.user.id = :userId")
    ChatRoomMember findByUserAndChatRoom(
        @Param("userId") Long userId,
        @Param("chatRoomId") Long chatRoomId
    );

    @Modifying
    @Transactional
    @Query("DELETE FROM ChatRoomMember m WHERE m.chatRoom.id = :chatRoomId")
    void deleteAllByChatRoomId(Long chatRoomId);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query(value = "DELETE FROM chat_room_members WHERE organization_id = :orgId AND user_id = :userId", 
           nativeQuery = true)
    void deleteAllByOrganizationIdAndUserId(@Param("orgId") Long orgId, @Param("userId") Long userId);
}