package com.melon.app.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class ScheduleEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id")
    private Schedule schedule; // Reference to the parent schedule

    private LocalDateTime timestamp;
    private String email;
    private String mondayTimes;
    private String tuesdayTimes;
    private String wednesdayTimes;
    private String thursdayTimes;
    private String fridayTimes;

    public void setSchedule(Schedule schedule) {
        this.schedule = schedule;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMondayTimes() {
        return mondayTimes;
    }

    public void setMondayTimes(String mondayTimes) {
        this.mondayTimes = mondayTimes;
    }

    public String getTuesdayTimes() {
        return tuesdayTimes;
    }

    public void setTuesdayTimes(String tuesdayTimes) {
        this.tuesdayTimes = tuesdayTimes;
    }

    public String getWednesdayTimes() {
        return wednesdayTimes;
    }

    public void setWednesdayTimes(String wednesdayTimes) {
        this.wednesdayTimes = wednesdayTimes;
    }

    public String getThursdayTimes() {
        return thursdayTimes;
    }

    public void setThursdayTimes(String thursdayTimes) {
        this.thursdayTimes = thursdayTimes;
    }

    public String getFridayTimes() {
        return fridayTimes;
    }

    public void setFridayTimes(String fridayTimes) {
        this.fridayTimes = fridayTimes;
    }

    @Override
    public String toString() {
        return "";
    }
}
