package com.melon.app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.melon.app.controller.DTO.ScheduleRequest;
import com.melon.app.repository.ScheduleRepository;

@Service
public class ScheduleService {
    
    @Autowired
    private ScheduleRepository scheduleRepo;

    public void saveSchedule(ScheduleRequest scheduleRequest) {
        System.out.println("Saving schedule: " + scheduleRequest.getName());
        scheduleRequest.getDays().forEach(day -> {
            System.out.println("Day: " + day.getDay() + ", Start: " + day.getStartTime() + ", End: " + day.getEndTime() + ", Event: " + day.getEventName());
        });
    }
}
