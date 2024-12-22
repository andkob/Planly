package com.melon.app.controller;

import java.util.HashMap;
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

import com.melon.app.controller.DTO.EntryDTO;
import com.melon.app.controller.DTO.ScheduleDTO;
import com.melon.app.entity.Schedule;
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

    /**
     * TODO - This is I think a good example of how to better handle responses that return data, not just a message.
     */
    @PostMapping
    public ResponseEntity<?> createSchedule(
            @Valid @RequestBody ScheduleDTO scheduleDTO,
            BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return handleValidationErrors(bindingResult);
        }

        // Validate
        ErrorResponse err = new ErrorResponse();
        if (!isValidScheduleData(scheduleDTO, err) && err.hasErrors())
            return err.content; // Returns error RE

        // Create
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        Schedule createdSchedule = scheduleService.createSchedule(user, scheduleDTO);

        logSecurityEvent("CREATE_SCHEDULE", 
            String.format("User ID: %d, Schedule Name: %s", user.getId(), scheduleDTO.getName()));

        // Return both the success message and the created schedule
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Schedule created successfully");
        response.put("schedule", new ScheduleDTO(createdSchedule));
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{scheduleId}")
    public ResponseEntity<Map<String, String>> updateSchedule(
            @PathVariable Long scheduleId,
            @Valid @RequestBody ScheduleDTO updatedSchedule,
            BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return handleValidationErrors(bindingResult);
        }

        // Validate
        if (!isValidId(scheduleId)) 
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid schedule ID");

        ErrorResponse err = new ErrorResponse();
        if (!isValidScheduleData(updatedSchedule, err) && err.hasErrors())
            return err.content;

        // Update
        scheduleService.updateScheduleEntries(updatedSchedule);
        
        logSecurityEvent("UPDATE_SCHEDULE", 
            String.format("Schedule ID: %d", scheduleId));
        
        return createSuccessResponse("Schedule updated successfully");
    }

    @GetMapping("/entries/me")
    public ResponseEntity<?> getUserScheduleEntries() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();
        List<ScheduleDTO> schedules = scheduleService.getUserScheduleEntries(user);
        
        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/entries/organization/{orgId}")
    public ResponseEntity<?> getMemberScheduleEntriesByOrg(@PathVariable Long orgId) {
        if (!isValidId(orgId)) {
            return createErrorResponse(HttpStatus.BAD_REQUEST, "Invalid organization ID");
        }

        List<ScheduleDTO> schedules = scheduleService.getOrganizationMemberSchedules(orgId);
        return ResponseEntity.ok(schedules);
    }

    // Helper methods for validation
    private boolean isValidTimeFormat(String time) {
        return time != null && time.matches("^([01]?[0-9]|2[0-3]):[0-5][0-9]$");
    }

    private boolean isValidDayFormat(String day) {
        return day != null && 
               day.toUpperCase().matches("^(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)$");
    }

    /**
     * Losing out on some efficiency here since we loop through the DTO w/o
     * mapping the entries to an actual ScheduleEntry, but for the sake of clarity
     * I'm leaving it this way (for now).
     */
    private boolean isValidScheduleData(ScheduleDTO scheduleDTO, ErrorResponse errorResponse) {
        String errorMessage = null;
        boolean isValid = true;

        // Sanitize and validate schedule name
        String sanitizedName = sanitizeInput(scheduleDTO.getName());
        if (!isValidName(sanitizedName)) {
            isValid = false;
            errorMessage = "Invalid schedule name format";
        }
        scheduleDTO.setName(sanitizedName);

        if (isValid && scheduleDTO.getEntries() != null) {
            List<EntryDTO> entries = scheduleDTO.getEntries();
            for (EntryDTO entry : entries) {
                String sanitizedEventName = sanitizeInput(entry.getEventName());
                if (!isValidSafeString(sanitizedEventName)) {
                    isValid = false;
                    errorMessage = "Invalid event name format";
                    break;
                } else if (!isValidDayFormat(entry.getEventDay())) {
                    isValid = false;
                    errorMessage = "Invalid day format";
                    break;
                } else if (!isValidTimeFormat(entry.getEventStartTime()) || !isValidTimeFormat(entry.getEventEndTime())) {
                    isValid = false;
                    errorMessage = "Invalid time format";
                    break;
                } else {
                    // All good
                    entry.setEventName(sanitizedEventName);
                }
            }
            
            // confirm
            if (isValid) return true;
        }
        errorResponse.content = createErrorResponse(HttpStatus.BAD_REQUEST, errorMessage);
        return false;
    }

    private class ErrorResponse {
        private ResponseEntity<Map<String, String>> content;

        public boolean hasErrors() { return content != null; }
    }
}