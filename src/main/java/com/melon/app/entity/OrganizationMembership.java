package com.melon.app.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "organization_memberships")
@Getter
@Setter
public class OrganizationMembership {
    
    @EmbeddedId
    private OrganizationMembershipId id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JsonBackReference("user-memberships")
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("organizationId")
    @JsonBackReference("org-memberships")
    private Organization organization;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    
    public OrganizationMembership() {}
    
    public OrganizationMembership(User user, Organization organization, Role role) {
        this.id = new OrganizationMembershipId(user.getId(), organization.getId());
        this.user = user;
        this.organization = organization;
        this.role = role;
    }
}