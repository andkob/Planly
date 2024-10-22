package com.melon.app.entity;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

/**
 * A schedule is NOT an individual's schedule. An organization can specify
 * schedules for its members (e.g. classes, work) and each member's "schedule"
 * will be stored as a Schedule ENTRY
 */
@Entity
public class Schedule {
    
    @Id
    private String id;

    private String scheduleName;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "organization_id")
    private Organization organization;

    @OneToMany(mappedBy = "schedule", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ScheduleEntry> entries;

    public void setId(String sheetId) {
        this.id = sheetId;
    }

    public void setName(String scheduleName) {
        this.scheduleName = scheduleName;
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
