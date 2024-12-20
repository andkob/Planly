package com.melon.app.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.melon.app.controller.DTO.ScheduleRequest;
import com.melon.app.controller.DTO.ScheduleDTO;
import com.melon.app.entity.User;
import com.melon.app.service.ScheduleService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/schedules")
@Validated
public class ScheduleController extends BaseController {

    private final ScheduleService scheduleService;

    @Autowired
    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> createSchedule(
            @Valid @RequestBody ScheduleRequest scheduleRequest,
            BindingResult bindingResult) {
        try {
            if (bindingResult.hasErrors()) {
                return handleValidationErrors(bindingResult);
            }

            // Sanitize and validate schedule name
            String sanitizedName = sanitizeInput(scheduleRequest.getName());
            if (!isValidName(sanitizedName)) {
                return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid schedule name format");
            }
            scheduleRequest.setName(sanitizedName);

            // Validate entries
            if (scheduleRequest.getDays() != null) {
                for (var entry : scheduleRequest.getDays()) {
                    String sanitizedEventName = sanitizeInput(entry.getEventName());
                    if (!isValidSafeString(sanitizedEventName)) {
                        return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid event name format");
                    }
                    entry.setEventName(sanitizedEventName);

                    if (!isValidTimeFormat(entry.getStartTime()) || 
                        !isValidTimeFormat(entry.getEndTime())) {
                        return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid time format");
                    }

                    if (!isValidDayFormat(entry.getDay())) {
                        return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid day format");
                    }
                }
            }

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User user = (User) auth.getPrincipal();
            
            scheduleService.createSchedule(user, scheduleRequest);
            
            logSecurityEvent("CREATE_SCHEDULE", 
                String.format("User ID: %d, Schedule Name: %s", user.getId(), sanitizedName));
            
            return createSuccessResponse("Schedule created successfully");
            
        } catch (Exception e) {
            logError("Error creating schedule", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                "An error occurred while creating the schedule");
        }
    }

    @PutMapping("/{scheduleId}")
    public ResponseEntity<Map<String, String>> updateSchedule(
            @PathVariable Long scheduleId,
            @Valid @RequestBody ScheduleDTO updatedSchedule,
            BindingResult bindingResult) {
        try {
            if (bindingResult.hasErrors()) {
                return handleValidationErrors(bindingResult);
            }

            if (!isValidId(scheduleId)) {
                return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid schedule ID");
            }

            String sanitizedName = sanitizeInput(updatedSchedule.getName());
            if (!isValidName(sanitizedName)) {
                return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid schedule name format");
            }
            updatedSchedule.setName(sanitizedName);

            if (updatedSchedule.getEntries() != null) {
                for (var entry : updatedSchedule.getEntries()) {
                    String sanitizedEventName = sanitizeInput(entry.getEventName());
                    if (!isValidSafeString(sanitizedEventName)) {
                        return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid event name format");
                    }
                    entry.setEventName(sanitizedEventName);

                    if (!isValidTimeFormat(entry.getEventStartTime()) || 
                        !isValidTimeFormat(entry.getEventEndTime())) {
                        return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid time format");
                    }

                    if (!isValidDayFormat(entry.getEventDay())) {
                        return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid day format");
                    }
                }
            }

            scheduleService.updateScheduleEntries(updatedSchedule);
            
            logSecurityEvent("UPDATE_SCHEDULE", 
                String.format("Schedule ID: %d", scheduleId));
            
            return createSuccessResponse("Schedule updated successfully");
            
        } catch (Exception e) {
            logError("Error updating schedule", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                "An error occurred while updating the schedule");
        }
    }

    @GetMapping("/entries/me")
    public ResponseEntity<?> getUserScheduleEntries() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User user = (User) auth.getPrincipal();
            List<ScheduleDTO> schedules = scheduleService.getUserScheduleEntries(user);
            
            return ResponseEntity.ok(schedules);
            
        } catch (Exception e) {
            logError("Error retrieving user schedule entries", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                "An error occurred while retrieving schedule entries");
        }
    }

    @GetMapping("/entries/organization/{orgId}")
    public ResponseEntity<?> getMemberScheduleEntriesByOrg(@PathVariable Long orgId) {
        try {
            if (!isValidId(orgId)) {
                return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid organization ID");
            }

            List<ScheduleDTO> schedules = scheduleService.getOrganizationMemberSchedules(orgId);
            return ResponseEntity.ok(schedules);
            
        } catch (Exception e) {
            logError("Error retrieving organization schedule entries", e);
            return createErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                "An error occurred while retrieving organization schedule entries");
        }
    }

    // Helper methods for validation
    private boolean isValidTimeFormat(String time) {
        return time != null && time.matches("^([01]?[0-9]|2[0-3]):[0-5][0-9]$");
    }

    private boolean isValidDayFormat(String day) {
        return day != null && 
               day.matches("^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)$");
    }
}