package com.melon.app.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class ScheduleEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id")
    private Schedule schedule; // Reference to the parent schedule

    private String eventDay;
    private String eventStartTime;
    private String eventEndTime;
    private String eventName;

    public ScheduleEntry() {}

    public ScheduleEntry(Schedule parent, String eventDay, String eventStartTime, String eventEndTime, String eventName) {
        this.schedule = parent;
        this.eventDay = eventDay;
        this.eventStartTime = eventStartTime;
        this.eventEndTime = eventEndTime;
        this.eventName = eventName;
    }

    @Override
    public String toString() {
        return "";
    }
}
