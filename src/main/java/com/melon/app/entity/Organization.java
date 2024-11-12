package com.melon.app.entity;

import java.util.Set;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;

@Entity
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String organizationName;

    public Organization() {}

    public Organization(String organizationName) {
        this.organizationName = organizationName;
    }

    @ManyToMany(mappedBy = "organizations")
    private Set<User> users;

    @OneToMany(mappedBy = "organization")
    private Set<Schedule> schedules;

    public String getName() {
        return organizationName;
    }
    
}
