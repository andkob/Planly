package com.melon.app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.melon.app.entity.Schedule;
import com.melon.app.entity.User;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByUser(User user);  // Find schedules for a specific user
}
