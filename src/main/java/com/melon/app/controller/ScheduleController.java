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

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @Autowired
    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createSchedule(@RequestBody ScheduleRequest scheduleRequest) {
        System.out.println("arrived at /schedules/create endpoint");

        // Retrieve the current user's authentication from the SecurityContext
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Get the authenticated user
        User user = (User) auth.getPrincipal();

        Schedule schedule = scheduleService.createSchedule(user, scheduleRequest);
        return ResponseEntity.ok(schedule);
    }

    @PutMapping("/update/{scheduleId}")
    public ResponseEntity<?> updateSchedule(@PathVariable Long scheduleId, @RequestBody ScheduleDTO updatedSchedule) {
        scheduleService.updateScheduleEntries(updatedSchedule);
        return ResponseEntity.ok("Schedule Updated Successfully"); // TODO change response type
    }

    @GetMapping("/get/user-entries")
    public ResponseEntity<?> getUserScheduleEntries() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        User user = (User) auth.getPrincipal();
        List<ScheduleDTO> schedules = scheduleService.getUserScheduleEntries(user);

        return ResponseEntity.ok(schedules);
    }
}
