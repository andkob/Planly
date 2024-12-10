package com.melon.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.melon.app.controller.DTO.ScheduleRequest;
import com.melon.app.controller.DTO.ScheduleDTO;
import com.melon.app.entity.Schedule;
import com.melon.app.entity.User;
import com.melon.app.service.ScheduleService;

import java.util.List;

/**
 * Controller for handling schedule-related operations.
 * Provides endpoints for creating, updating, and retrieving schedules.
 */
@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @Autowired
    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    /**
     * Creates a new schedule for the authenticated user.
     *
     * @param scheduleRequest the schedule details
     * @return a {@link ResponseEntity} containing the created schedule
     */
    @PostMapping
    public ResponseEntity<?> createSchedule(@RequestBody ScheduleRequest scheduleRequest) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        Schedule schedule = scheduleService.createSchedule(user, scheduleRequest);
        return ResponseEntity.ok(schedule);
    }

    /**
     * Updates an existing schedule.
     *
     * @param scheduleId the ID of the schedule to update
     * @param updatedSchedule the updated schedule details
     * @return a {@link ResponseEntity} indicating the result of the update operation
     */
    @PutMapping("/{scheduleId}")
    public ResponseEntity<?> updateSchedule(@PathVariable Long scheduleId, @RequestBody ScheduleDTO updatedSchedule) {
        scheduleService.updateScheduleEntries(updatedSchedule);
        return ResponseEntity.ok("Schedule Updated Successfully"); // TODO change response type
    }

    /**
     * Retrieves schedule entries for the authenticated user.
     *
     * @return a {@link ResponseEntity} containing a list of the user's schedule entries
     */
    @GetMapping("/entries/me")
    public ResponseEntity<?> getUserScheduleEntries() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        List<ScheduleDTO> schedules = scheduleService.getUserScheduleEntries(user);
        return ResponseEntity.ok(schedules);
    }

    /**
     * Retrieves schedule entries for all members of an organization.
     *
     * @param orgId the ID of the organization
     * @return a {@link ResponseEntity} containing a list of schedule entries for the organization's members
     */
    @GetMapping("/entries/organization/{orgId}")
    public ResponseEntity<?> getMemberScheduleEntriesByOrg(@PathVariable Long orgId) {
        List<ScheduleDTO> schedules = scheduleService.getOrganizationMemberSchedules(orgId);
        return ResponseEntity.ok(schedules);
    }
}
