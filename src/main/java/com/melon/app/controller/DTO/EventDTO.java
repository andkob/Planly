package com.melon.app.controller.DTO;

import java.time.format.DateTimeFormatter;

import com.melon.app.entity.UpcomingEvent;
import com.melon.app.entity.UpcomingEvent.EventType;

public class EventDTO {
    private String name;
    private String date;
    private String startTime;
    private String type;
    private String location;
    private String description;
    
    public EventDTO(String name, String date, String startTime, String type, String location, String description) {
        this.name = name;
        this.date = date;
        this.startTime = startTime;
        this.type = type;
        this.location = location;
        this.description = description;
    }

    public EventDTO(UpcomingEvent event) {
        if (event != null) {
            this.name = event.getName();
            this.date = event.getDate() != null ? event.getDate().toString() : null; // Converts LocalDate to "YYYY-MM-DD" or null
            this.startTime = event.getStartTime() != null ? 
                event.getStartTime().format(DateTimeFormatter.ofPattern("HH:mm")) : null; // Converts LocalTime to "HH:mm" or null
            this.type = event.getType().name();
            this.location = event.getLocation();
            this.description = event.getDescription();
        }
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    // Helper method to convert string type to enum
    public EventType getEventType() {
        try {
            return EventType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            return EventType.OTHER; // Default fallback
        }
    }
}
