package com.melon.app.entity;

import java.util.Set;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "\"user\"")  // Escape the table name due to "user" being a reserved keyword
public class User implements UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(unique = true)
    private String email;

    private String passwordHash;

    @ManyToMany
    @JoinTable(
      name = "user_organization", 
      joinColumns = @JoinColumn(name = "user_id"),
      foreignKey = @ForeignKey(name = "FK_USER_ORGANIZATION_USER"),
      inverseJoinColumns = @JoinColumn(name = "organization_id"),
      inverseForeignKey = @ForeignKey(name = "FK_USER_ORGANIZATION_ORGANIZATION"))
    private Set<Organization> organizations = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Schedule> schedules;

    public User() {}

    public User(String email, String passwordHash) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.organizations = new HashSet<>(); // initialize set
    }

    public boolean addOrganization(Organization org) {
        return organizations.add(org);
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

    public Set<Organization> getOrganizations() {
        return organizations;
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
}
