package com.melon.app.controller.DTO;

public class EntryDTO {
    private Long id;
    private String eventDay;
    private String eventStartTime;
    private String eventEndTime;
    private String eventName;
    
    public EntryDTO(Long id, String eventDay, String eventStartTime, String eventEndTime, String eventName) {
        this.id = id;
        this.eventDay = eventDay;
        this.eventStartTime = eventStartTime;
        this.eventEndTime = eventEndTime;
        this.eventName = eventName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEventDay() { return eventDay; }
    public void setEventDay(String eventDay) { this.eventDay = eventDay; }
    public String getEventStartTime() { return eventStartTime; }
    public void setEventStartTime(String eventStartTime) { this.eventStartTime = eventStartTime; }
    public String getEventEndTime() { return eventEndTime; }
    public void setEventEndTime(String eventEndTime) { this.eventEndTime = eventEndTime; }
    public String getEventName() { return eventName; }
    public void setEventName(String eventName) { this.eventName = eventName; }
}
