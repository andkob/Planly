package com.melon.app.controller.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
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
}
