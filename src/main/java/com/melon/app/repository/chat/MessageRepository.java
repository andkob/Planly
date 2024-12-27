package com.melon.app.repository.chat;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.melon.app.entity.chat.Message;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByChatRoomIdOrderBySentAtAsc(Long chatRoomId);
    
    @Query("SELECT m FROM Message m " +
           "WHERE m.chatRoom.id = :chatRoomId " +
           "AND m.sentAt > :since " +
           "ORDER BY m.sentAt ASC")
    List<Message> findRecentMessages(
        @Param("chatRoomId") Long chatRoomId,
        @Param("since") LocalDateTime since
    );
    
    // For unread message counts
    @Query("SELECT COUNT(m) FROM Message m " +
           "WHERE m.chatRoom.id = :chatRoomId " +
           "AND m.sentAt > :lastRead")
    long countUnreadMessages(
        @Param("chatRoomId") Long chatRoomId,
        @Param("lastRead") LocalDateTime lastRead
    );
}