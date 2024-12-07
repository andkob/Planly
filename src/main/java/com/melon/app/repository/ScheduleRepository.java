package com.melon.app.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.melon.app.entity.Schedule;
import com.melon.app.entity.User;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByUser(User user);  // Find schedules for a specific user
    List<Schedule> findByUserAndScheduleName(User user, String scheduleName);
    Optional<Schedule> findByUserAndId(User user, Long id);
}
