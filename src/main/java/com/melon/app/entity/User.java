package com.melon.app.entity;

import java.util.Set;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "\"user\"")  // Escape the table name due to "user" being a reserved keyword
public class User implements UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="email", unique = true)
    private String email;

    private String passwordHash;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("user-memberships")
    private Set<OrganizationMembership> organizationMemberships = new HashSet<>();

    @OneToMany(mappedBy = "owner")
    @JsonBackReference
    private Set<Organization> ownedOrganizations = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Schedule> schedules;

    public User() {}

    public User(String email, String passwordHash) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.organizationMemberships = new HashSet<>();
        this.ownedOrganizations = new HashSet<>();
    }

    /**
     * Constructor for testing purposes
     * @param email
     */
    public User(Long id, String email) {
        this.id = id;
        this.email = email;
        this.organizationMemberships = new HashSet<>();
        this.ownedOrganizations = new HashSet<>();
    }

    public boolean addOrganization(Organization org, Role role) {
        OrganizationMembership membership = new OrganizationMembership(this, org, role);
        boolean added = organizationMemberships.add(membership);
        org.getMemberships().add(membership);
        return added;
    }

    public boolean addOwnedOrganization(Organization org) {
        if (ownedOrganizations.add(org)) {
            org.setOwner(this);
            return true;
        }
        return false;
    }

    public boolean removeOwnedOrganization(Organization org) {
        return ownedOrganizations.remove(org);
    }

    public Long getId() {
        return id;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    public Set<OrganizationMembership> getOrganizationMemberships() {
        return organizationMemberships;
    }

    public Set<Organization> getOwnedOrganizations() {
        return ownedOrganizations;
    }

    public void setOwnedOrganizations(Set<Organization> ownedOrganizations) {
        this.ownedOrganizations = ownedOrganizations;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(); // TODO if roles, implement this accordingly
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    // Override equals() and hashCode() based on the ID
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User)) return false;
        User user = (User) o;
        return id != null && id.equals(user.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", ownedOrganizationsCount=" + ownedOrganizations.size() +
                ", organizationsCount=" + organizationMemberships.size() +
                '}';
    }
}
