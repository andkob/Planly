package com.melon.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.melon.app.controller.DTO.EntryDTO;
import com.melon.app.controller.DTO.ScheduleRequest;
import com.melon.app.controller.DTO.ScheduleResponseDTO;
import com.melon.app.entity.Schedule;
import com.melon.app.entity.User;
import com.melon.app.service.ScheduleService;

import jakarta.servlet.http.HttpSession;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @Autowired
    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }
    
    /**
     * REMOVE THIS
     */
    @PostMapping("/test/send-schedule-data")
    public ResponseEntity<String> storeSchedule(@RequestBody ScheduleRequest scheduleRequest) {
        scheduleService.saveSchedule(scheduleRequest);
        return new ResponseEntity<>("Schedule saved successfully", HttpStatus.OK);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createSchedule(@RequestBody ScheduleRequest scheduleRequest) {
        System.out.println("arrived at /schedules/create endpoint");

        // Retrieve the current user's authentication from the SecurityContext
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not logged in");
        }

        // Get the authenticated user
        User user = (User) auth.getPrincipal();

        Schedule schedule = scheduleService.createSchedule(user, scheduleRequest);
        return ResponseEntity.ok(schedule);
    }

    @PutMapping("/update/{scheduleId}")
    public ResponseEntity<?> updateSchedule(@PathVariable Long scheduleId, @RequestBody List<EntryDTO> updatedEntries) {
        System.out.println("arrived at /schedules/update/{scheduleId} endpoint");
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not logged in");
        }

        Schedule updatedSchedule = scheduleService.updateScheduleEntries(scheduleId, updatedEntries);
        ScheduleResponseDTO res = new ScheduleResponseDTO(updatedSchedule);
        return ResponseEntity.ok(res); // TODO change response type
    }

    // TODO old
    @GetMapping("/get/schedules-all")
    public ResponseEntity<?> getUserSchedules(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not logged in");
        }

        List<Schedule> schedules = scheduleService.getUserSchedules(user);
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/get/user-entries")
    public ResponseEntity<?> getUserScheduleEntries() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not logged in");
        }

        User user = (User) auth.getPrincipal();
        List<ScheduleResponseDTO> schedules = scheduleService.getUserScheduleEntries(user);

        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/get/count/events-per-day")
    public ResponseEntity<?> getScheduleEntryCountByUser(@RequestParam String scheduleName) {
        System.out.println("arrived at /events-per-day endpoint");
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not logged in");
        }

        User user = (User) auth.getPrincipal();
        int[] res = scheduleService.getScheduleEntryCountByUser(user, scheduleName);
        System.out.print("Returning Count: ");
        for (int i : res) {System.out.print(i + ", ");}
        System.out.println();
        return ResponseEntity.ok(res);
    }
}
