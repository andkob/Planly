package com.melon.app.controller.DTO;

import java.util.Set;
import java.util.stream.Collectors;

import com.melon.app.entity.Organization;
import com.melon.app.entity.OrganizationMembership;
import com.melon.app.entity.Role;
import com.melon.app.entity.Schedule;
import com.melon.app.entity.UpcomingEvent;
import com.melon.app.entity.User;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class OrganizationDTO {
    private Long id;
    private String name;
    private String description;
    private int memberCount;
    private UserSummaryDTO owner;
    private Set<UserSummaryDTO> members;
    private Set<ScheduleSummaryDTO> schedules;
    private Set<EventSummaryDTO> events;

    // Inner DTOs for related entities
    @Getter
    @Setter
    @NoArgsConstructor
    public static class UserSummaryDTO {
        private Long id;
        private String username;
        private String email;
        private Role role;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class ScheduleSummaryDTO {
        private Long id;
        private String title;
        private String description;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class EventSummaryDTO {
        private Long id;
        private String name;
        private String date;
        private String startTime;
        private String type;
        private String location;
        private String description;
    }

    // Constructor from Organization entity
    public OrganizationDTO(Organization organization) {
        this.id = organization.getId();
        this.name = organization.getOrganizationName();
        this.memberCount = organization.getMemberships().size();
        this.owner = convertToUserSummary(organization.getMemberships().stream()
            .filter(m -> m.getRole() == Role.OWNER)
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Organization has no owner")));
        
        // Convert users to UserSummaryDTO
        this.members = organization.getMemberships().stream()
            .map(member -> convertToUserSummary(member))
            .collect(Collectors.toSet());

        // Convert schedules to ScheduleSummaryDTO
        this.schedules = organization.getSchedules().stream()
            .map(schedule -> convertToScheduleSummary(schedule))
            .collect(Collectors.toSet());

        // Convert events to EventSummaryDTO
        this.events = organization.getEvents().stream()
            .map(event -> convertToEventSummary(event))
            .collect(Collectors.toSet());
    }

    // Static conversion methods
    private static UserSummaryDTO convertToUserSummary(OrganizationMembership member) {
        UserSummaryDTO dto = new UserSummaryDTO();
        User user = member.getUser();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setUsername(user.getUsername());
        dto.setRole(member.getRole());
        return dto;
    }

    private static ScheduleSummaryDTO convertToScheduleSummary(Schedule schedule) {
        ScheduleSummaryDTO dto = new ScheduleSummaryDTO();
        dto.setId(schedule.getId());
        dto.setTitle(schedule.getScheduleName());
        // dto.setDescription(schedule.getDescription());
        return dto;
    }

    private static EventSummaryDTO convertToEventSummary(UpcomingEvent event) {
        EventSummaryDTO dto = new EventSummaryDTO();
        dto.setId(event.getId());
        dto.setName(event.getName());
        dto.setDate(event.getDate().toString());
        dto.setStartTime(event.getStartTime().toString());
        dto.setType(event.getType().name());
        dto.setLocation(event.getLocation());
        dto.setDescription(event.getDescription());
        return dto;
    }

    // Static factory method to create DTO from entity
    public static OrganizationDTO fromEntity(Organization organization) {
        return new OrganizationDTO(organization);
    }

    // Convert set of organizations to set of DTOs
    public static Set<OrganizationDTO> fromEntities(Set<Organization> organizations) {
        return organizations.stream()
            .map(OrganizationDTO::new)
            .collect(Collectors.toSet());
    }
}