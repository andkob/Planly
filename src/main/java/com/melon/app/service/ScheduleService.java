package com.melon.app.service;

import java.util.List;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.melon.app.controller.DTO.ScheduleRequest;
import com.melon.app.controller.DTO.ScheduleRequest.DaySchedule;
import com.melon.app.entity.Schedule;
import com.melon.app.entity.ScheduleEntry;
import com.melon.app.entity.User;
import com.melon.app.repository.ScheduleRepository;
import com.melon.app.repository.UserRepository;

@Service
public class ScheduleService {
    
    @Autowired
    private ScheduleRepository scheduleRepo;

    @Autowired
    private UserRepository userRepo;

    public Schedule createSchedule(User user, ScheduleRequest scheduleRequest) {
        Schedule schedule = new Schedule(scheduleRequest.getName(), user);
        
        List<DaySchedule> events = scheduleRequest.getDays();
        List<ScheduleEntry> entries = new ArrayList<>();

        for (DaySchedule event : events) {
            ScheduleEntry entry = new ScheduleEntry();
            entry.setEventDay(event.getDay());
            entry.setEventStartTime(event.getStartTime());
            entry.setEventEndTime(event.getEndTime());
            entry.setEventName(event.getEventName());
            entry.setSchedule(schedule); // parent schedule
            entries.add(entry);
        }
        schedule.setEntries(entries);

        return scheduleRepo.save(schedule);
    }

    public List<Schedule> getUserSchedules(User user) {
        return scheduleRepo.findByUser(user);
    }

    public void saveSchedule(ScheduleRequest scheduleRequest) {
        System.out.println("Saving schedule: " + scheduleRequest.getName());
        scheduleRequest.getDays().forEach(day -> {
            System.out.println("Day: " + day.getDay() + ", Start: " + day.getStartTime() + ", End: " + day.getEndTime() + ", Event: " + day.getEventName());
        });
    }
}
