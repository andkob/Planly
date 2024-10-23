package com.melon.app.entity;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

/**
 * A schedule is an individual's schedule. An organization can specify
 * schedules for its members (e.g. classes, work) and each member's "schedule"
 * will have scheduleEntries for each "event"
 * 
 * Users can also have personal schedules they can add to organizations.
 */
@Entity
public class Schedule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String scheduleName;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user; // owner of this schedule

    @ManyToOne
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ScheduleEntry> entries;

    public Schedule() {}

    public Schedule(String scheduleName, User owner) {
        this.scheduleName = scheduleName;
        this.user = owner;
    }

    public String getName() {
        return scheduleName;
    }

    public void setName(String scheduleName) {
        this.scheduleName = scheduleName;
    }

    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }

    public void setEntries(List<ScheduleEntry> entries) {
        this.entries = entries;
        for (ScheduleEntry entry : entries) {
            entry.setSchedule(this);
        }
    }

    public List<ScheduleEntry> getEntries() {
        return entries;
    }
}
