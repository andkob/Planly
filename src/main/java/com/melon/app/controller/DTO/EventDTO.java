package com.melon.app.controller.DTO;

import java.time.format.DateTimeFormatter;

import com.melon.app.entity.UpcomingEvent;
import com.melon.app.entity.UpcomingEvent.EventType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EventDTO {
    @NotBlank(message = "Event name is required")
    @Size(max = 100, message = "Event name must not exceed 100 characters")
    private String name;

    @NotNull(message = "Date is required")
    @Pattern(regexp = "\\d{4}-\\d{2}-\\d{2}", message = "Invalid date format")
    private String date;

    @NotNull(message = "Start time is required")
    @Pattern(regexp = "\\d{2}:\\d{2}(:\\d{2})?", message = "Invalid time format")
    private String startTime;

    @NotBlank(message = "Location is required")
    @Size(max = 200, message = "Location must not exceed 200 characters")
    private String location;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    private String type;
    
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

    // Helper method to convert string type to enum
    public EventType getEventType() {
        try {
            return EventType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            return EventType.OTHER; // Default fallback
        }
    }
}
