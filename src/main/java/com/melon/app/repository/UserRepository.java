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
    @Query("SELECT u.organizations FROM User u WHERE u.id = :userId")
    Set<Organization> findOrganizationsByUserId(Long userId);
    
    // Fetch users who belong to a specific organization
    @Query("SELECT u FROM User u JOIN u.organizations o WHERE o.id = :organizationId")
    List<User> findUsersByOrganizationId(Long organizationId);
    
    // Fetch users who belong to multiple organizations
    @Query("SELECT u FROM User u JOIN u.organizations o WHERE o.id IN :organizationIds GROUP BY u HAVING COUNT(DISTINCT o.id) = :totalOrgs")
    List<User> findUsersByOrganizationIds(@Param("organizationIds") List<Long> organizationIds, @Param("totalOrgs") Long totalOrgs);
    
    // Check if a user belongs to a specific organization
    @Query("SELECT COUNT(u) > 0 FROM User u JOIN u.organizations o WHERE u.id = :userId AND o.id = :organizationId")
    boolean isUserInOrganization(@Param("userId") Long userId, @Param("organizationId") Long organizationId);
}