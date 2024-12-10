package com.melon.app.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.melon.app.entity.Schedule;
import com.melon.app.entity.User;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByUser(User user);  // Find schedules for a specific user
    List<Schedule> findByUserAndScheduleName(User user, String scheduleName);
    Optional<Schedule> findByUserAndId(User user, Long id);

    @Query("SELECT s FROM Schedule s " +
       "JOIN s.user u " +
       "JOIN OrganizationMembership om ON om.user = u " +
       "WHERE om.organization.id = :organizationId")
    List<Schedule> findMemberSchedulesByOrganizationId(@Param("organizationId") Long organizationId);
}
