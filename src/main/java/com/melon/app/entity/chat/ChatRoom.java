package com.melon.app.entity.chat;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.melon.app.entity.Organization;
import com.melon.app.entity.OrganizationMembership;

@Entity
@Table(name = "chat_rooms")
@Getter
@Setter
public class ChatRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonBackReference
    private Organization organization;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChatType type;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private Set<ChatRoomMember> members = new HashSet<>();

    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private Set<Message> messages = new HashSet<>();

    public ChatRoom() {
        this.createdAt = LocalDateTime.now();
    }

    public ChatRoom(String name, Organization organization, ChatType type) {
        this.name = name;
        this.organization = organization;
        this.type = type;
        this.createdAt = LocalDateTime.now();
    }

    public ChatRoom(String name, Organization organization, ChatType type, Set<OrganizationMembership> members) {
        this(name, organization, type);

        // Initialize members if not already
        if (this.members == null) {
            this.members = new HashSet<>();
        }
        
        // Create ChatRoomMember entities for each OrganizationMembership
        members.forEach(membership -> {
            ChatRoomMember member = new ChatRoomMember(this, membership);
            this.members.add(member);
        });
    }

    // Helper methods
    public boolean addMember(ChatRoomMember member) {
        if (members.add(member)) {
            member.setChatRoom(this);
            return true;
        }
        return false;
    }

    public boolean removeMember(ChatRoomMember member) {
        if (members.remove(member)) {
            member.setChatRoom(null);
            return true;
        }
        return false;
    }

    public boolean addMessage(Message message) {
        if (messages.add(message)) {
            message.setChatRoom(this);
            return true;
        }
        return false;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ChatRoom)) return false;
        ChatRoom that = (ChatRoom) o;
        return id != null && id.equals(that.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "ChatRoom{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", organization=" + (organization != null ? organization.getId() : null) +
                ", type=" + type +
                ", createdAt=" + createdAt +
                ", membersCount=" + (members != null ? members.size() : 0) +
                ", messagesCount=" + (messages != null ? messages.size() : 0) +
                '}';
    }
}