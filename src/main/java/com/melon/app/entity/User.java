package com.melon.app.entity;

import java.util.Set;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Getter
@Setter
@Table(name = "\"user\"")  // Escape the table name due to "user" being a reserved keyword
public class User implements UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="email", unique = true)
    private String email;

    @Column(name="username", unique = true)
    private String username;

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

    public User(String email, String username, String passwordHash) {
        this.email = email;
        this.username = username;
        this.passwordHash = passwordHash;
        this.organizationMemberships = new HashSet<>();
        this.ownedOrganizations = new HashSet<>();
    }

    /**
     * Constructor for testing purposes
     * @param email
     */
    public User(Long id, String email, String username) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.organizationMemberships = new HashSet<>();
        this.ownedOrganizations = new HashSet<>();
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    // Unused stuff
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
    public String toString() {
        return "User{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", ownedOrganizationsCount=" + ownedOrganizations.size() +
                ", organizationsCount=" + organizationMemberships.size() +
                '}';
    }
}
