package com.melon.app.controller.DTO;

import java.util.List;
import java.util.stream.Collectors;

import com.melon.app.entity.Schedule;

public class ScheduleDTO {
    private Long id;
    private String name;
    private List<EntryDTO> entries;

    public ScheduleDTO(Long id, String name, List<EntryDTO> entries) {
        this.id = id;
        this.name = name;
        this.entries = entries;
    }

    public ScheduleDTO(Schedule schedule) {
        this.id = schedule.getId();
        this.name = schedule.getName();
        this.entries = schedule.getEntries().stream()
            .map(entry -> new EntryDTO(
                entry.getId(),
                entry.getEventDay(),
                entry.getEventStartTime(),
                entry.getEventEndTime(),
                entry.getEventName()
            ))
            .collect(Collectors.toList());
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public List<EntryDTO> getEntries() { return entries; }
    public void setEntries(List<EntryDTO> entries) { this.entries = entries; }
}
