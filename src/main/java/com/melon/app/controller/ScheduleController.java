package com.melon.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.melon.app.controller.DTO.ScheduleRequest;
import com.melon.app.service.ScheduleService;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @Autowired
    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }
    
    @PostMapping("/store-schedule")
    public ResponseEntity<String> storeSchedule(@RequestBody ScheduleRequest scheduleRequest) {
        scheduleService.saveSchedule(scheduleRequest);
        return new ResponseEntity<>("Schedule saved successfully", HttpStatus.OK);
    }
}
