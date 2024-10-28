package com.melon.app.controller.DTO;

import java.util.List;

public class ScheduleResponseDTO {
    private Long id;
    private String name;
    private List<EntryDTO> entries;

    public ScheduleResponseDTO(Long id, String name, List<EntryDTO> entries) {
        this.id = id;
        this.name = name;
        this.entries = entries;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public List<EntryDTO> getEntries() { return entries; }
    public void setEntries(List<EntryDTO> entries) { this.entries = entries; }
}
