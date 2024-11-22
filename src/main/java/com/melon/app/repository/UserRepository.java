package com.melon.app.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.melon.app.entity.Organization;
import com.melon.app.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Fetch organizations for a specific user
    @Query("SELECT m.organization FROM OrganizationMembership m WHERE m.user.id = :userId")
    Set<Organization> findOrganizationsByUserId(Long userId);
    
    // Fetch users who belong to a specific organization
    @Query("SELECT m.user FROM OrganizationMembership m WHERE m.organization.id = :orgId")
    List<User> findUsersByOrganizationId(@Param("orgId") Long orgId);
    
    // Fetch users who belong to multiple organizations
    @Query("SELECT m.user FROM OrganizationMembership m WHERE m.organization.id IN :organizationIds GROUP BY m.user HAVING COUNT(DISTINCT m.organization.id) = :totalOrgs")
    List<User> findUsersByOrganizationIds(@Param("organizationIds") List<Long> organizationIds, @Param("totalOrgs") Long totalOrgs);
    
    // Check if a user belongs to a specific organization
    @Query("SELECT COUNT(m) > 0 FROM OrganizationMembership m WHERE m.user.id = :userId AND m.organization.id = :organizationId")
    boolean isUserInOrganization(@Param("userId") Long userId, @Param("organizationId") Long organizationId);
}