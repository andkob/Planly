package com.melon.app.entity;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "organizations")
@Getter
@Setter
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String organizationName;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("org-memberships")
    private Set<OrganizationMembership> memberships = new HashSet<>();

    @JsonManagedReference
    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL)
    private Set<Schedule> schedules = new HashSet<>();

    @JsonManagedReference
    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL)
    private Set<UpcomingEvent> events = new HashSet<>();

    // Basic constructors
    public Organization() {}

    public Organization(String organizationName) {
        this.organizationName = organizationName;
    }

    public Organization(String organizationName, User owner) {
        this.organizationName = organizationName;
        addOwner(owner);
    }

    /**
     * Constructor for testing purposes
     * @param organizationName
     * @param id
     */
    public Organization(Long id, String organizationName, User owner) {
        this.id = id;
        this.organizationName = organizationName;
        addOwner(owner);
    }

    /**
     * Upon creation of an organization, call this method to add the first member
     * of the organization, the owner.
     * @param owner
     * @return
     */
    private void addOwner(User owner) {
        this.owner = owner;
        OrganizationMembership membership = new OrganizationMembership(owner, this, Role.OWNER);
        if (memberships.add(membership)) {
            owner.getOrganizationMemberships().add(membership);
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Organization)) return false;
        Organization that = (Organization) o;
        return id != null && id.equals(that.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    // Override toString() for better logging
    @Override
    public String toString() {
        String owner = "NONE";
        if (this.owner != null) {
            owner = this.owner.getUsername();
        }
        return "Organization{" +
            "id=" + id +
            ", name='" + organizationName + '\'' +
            ", owner='" + owner + '\'' +
            '}';
    }

    // For compatibility with older code
    public String getName() {
        return organizationName;
    }
}