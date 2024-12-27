package com.melon.app.entity.chat;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.melon.app.entity.OrganizationMembership;

@Entity
@Table(name = "chat_room_members")
@Getter
@Setter
public class ChatRoomMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id", nullable = false)
    @JsonBackReference
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
        @JoinColumn(name = "user_id", referencedColumnName = "user_id"),
        @JoinColumn(name = "organization_id", referencedColumnName = "organization_id")
    })
    private OrganizationMembership organizationMembership;

    @Column(nullable = false)
    private LocalDateTime lastRead;

    public ChatRoomMember() {
        this.lastRead = LocalDateTime.now();
    }

    public ChatRoomMember(ChatRoom chatRoom, OrganizationMembership organizationMembership) {
        this.chatRoom = chatRoom;
        this.organizationMembership = organizationMembership;
        this.lastRead = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ChatRoomMember)) return false;
        ChatRoomMember that = (ChatRoomMember) o;
        return id != null && id.equals(that.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}