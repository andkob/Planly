package com.melon.app.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.melon.app.controller.DTO.ScheduleDTO;
import com.melon.app.controller.DTO.EntryDTO;
import com.melon.app.entity.Schedule;
import com.melon.app.entity.ScheduleEntry;
import com.melon.app.entity.User;
import com.melon.app.exception.ConflictingSchedulesException;
import com.melon.app.repository.ScheduleRepository;
import com.melon.app.repository.UserRepository;

@Service
public class ScheduleService {
    
    @Autowired
    private ScheduleRepository scheduleRepo;

    @Autowired
    private UserRepository userRepo;

    private Schedule mapDtoToSchedule(ScheduleDTO scheduleDTO) {
        Schedule schedule = new Schedule(scheduleDTO.getName());
        schedule.setEntries(scheduleDTO.getEntries().stream()
            .map(entry -> new ScheduleEntry(
                schedule, // set parent
                entry.getEventDay(),
                entry.getEventStartTime(),
                entry.getEventEndTime(),
                entry.getEventName()
            ))
            .collect(Collectors.toList())
        );
        return schedule;
    }

    private List<ScheduleDTO> mapScheduleToDto(List<Schedule> schedules) {
        return schedules.stream()
            .map(schedule -> new ScheduleDTO(
                schedule.getId(),
                schedule.getScheduleName(),
                schedule.getEntries().stream()
                    .map(entry -> new EntryDTO(
                        entry.getId(),
                        entry.getEventDay(),
                        entry.getEventStartTime(),
                        entry.getEventEndTime(),
                        entry.getEventName()
                    ))
                    .collect(Collectors.toList())
            ))
            .collect(Collectors.toList());
    }

    public Schedule createSchedule(User user, ScheduleDTO scheduleDTO) throws ConflictingSchedulesException {
        // see if a schedule with that name exists
        if (scheduleRepo.findByUserAndScheduleName(user, scheduleDTO.getName()) == null) {
            throw new ConflictingSchedulesException("Schedule with that name already exists.");
        }
        user = userRepo.findById(user.getId()).get(); // load user entity

        Schedule schedule = mapDtoToSchedule(scheduleDTO);
        schedule.setUser(user); // set user as owner of schedule

        return scheduleRepo.save(schedule);
    }

    public void updateScheduleEntries(ScheduleDTO newSchedule) {
        Schedule schedule = scheduleRepo.findById(newSchedule.getId())
            .orElseThrow(() -> new RuntimeException("Schedule not found"));
        
        schedule.getEntries().clear();
        
        List<ScheduleEntry> entries = newSchedule.getEntries().stream()
            .map(dto -> {
                ScheduleEntry entry = new ScheduleEntry();
                entry.setEventName(dto.getEventName());
                entry.setEventDay(dto.getEventDay());
                entry.setEventStartTime(dto.getEventStartTime());
                entry.setEventEndTime(dto.getEventEndTime());
                entry.setSchedule(schedule);
                return entry;
            })
            .collect(Collectors.toList());
        
        schedule.getEntries().addAll(entries);
        scheduleRepo.save(schedule);
    }

    public List<Schedule> getUserSchedules(User user) {
        return scheduleRepo.findByUser(user);
    }

    public List<ScheduleDTO> getOrganizationMemberSchedules(Long orgId) {
        List<Schedule> schedules = scheduleRepo.findMemberSchedulesByOrganizationId(orgId);
        return mapScheduleToDto(schedules);
    }

    public List<ScheduleDTO> getUserScheduleEntries(User user) {
        List<Schedule> schedules = scheduleRepo.findByUser(user);
        return mapScheduleToDto(schedules);
    }
}
