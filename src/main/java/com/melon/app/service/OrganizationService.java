package com.melon.app.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.melon.app.entity.Organization;
import com.melon.app.entity.UpcomingEvent;
import com.melon.app.entity.User;
import com.melon.app.exception.CannotJoinOwnedOrgException;
import com.melon.app.exception.InvalidIdException;
import com.melon.app.exception.OrganizationDoesNotExistException;
import com.melon.app.exception.OrganizationException;
import com.melon.app.repository.OrganizationRepository;
import com.melon.app.repository.UpcomingEventRepository;
import com.melon.app.repository.UserRepository;

@Service
public class OrganizationService {
    
    @Autowired
    private OrganizationRepository orgRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private UpcomingEventRepository eventRepo;

    @Transactional // keeps the Hibernate session open throughout the method execution
    public boolean joinOrganization(User user, String orgId) {
        if (!orgId.matches("\\d+")) {
            throw new InvalidIdException("Invalid ID format: " + orgId);
        }

        // Reload user from the DB to reattach to the session
        user = userRepo.findById(user.getId()).get();

        Long id = Long.parseLong(orgId);
        Optional<Organization> orgToJoin = orgRepo.findById(id);
        System.out.println("Organization found with id: " + orgId);

        if (orgToJoin.isEmpty()) {
            throw new OrganizationDoesNotExistException("No org with the ID "+id+" to join");
        }
        Organization org = orgToJoin.get();

        if (org.getOwner().equals(user)) {
            throw new CannotJoinOwnedOrgException("You own this organization");
        }

        boolean isAdded = org.addUser(user);          // associate user with org

        if (!isAdded) {
            throw new OrganizationException("You are already associated with " + org.getName());
        }

        userRepo.save(user);
        orgRepo.save(org);

        return isAdded;
    }

    public Organization createNewOrganization(String orgName) {
        Organization newOrg = new Organization(orgName);
        return orgRepo.save(newOrg);
    }

    public Organization createNewOwnedOrganization(String orgName, User owner) {
        owner = userRepo.findById(owner.getId()).get();
        Organization newOrg = new Organization(orgName, owner);
        owner.addOwnedOrganization(newOrg);
        userRepo.save(owner);
        return orgRepo.save(newOrg);
    }

    public List<Organization> findOrganizationsByOwner(User owner) {
        List<Organization> ownedOrgs = orgRepo.findByOwner(owner);
        return ownedOrgs;
    }

    public Organization findOrgById(Long id) {
        Optional<Organization> matchingOrg = orgRepo.findById(id);
        if (!matchingOrg.isPresent()) {
            throw new OrganizationDoesNotExistException("No organization with that ID exists");
        }
        return matchingOrg.get();
    }

    public List<Organization> findOrgsByName(String orgName) {
        List<Organization> foundOrganizations = orgRepo.findByOrganizationName(orgName);
        return foundOrganizations;
    }

    public void addEventToOrganization(Long orgId, UpcomingEvent event) {
        Organization org = orgRepo.findById(orgId)
            .orElseThrow(() -> new OrganizationDoesNotExistException("Organization not found"));
        
        org.addEvent(event);
        orgRepo.save(org);
    }

    public List<UpcomingEvent> getUpcomingEvents(Long orgId) {
        return eventRepo.findByOrganizationIdOrderByDateAscStartTimeAsc(orgId);
    }
}
