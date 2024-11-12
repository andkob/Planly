package com.melon.app.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.melon.app.entity.Organization;
import com.melon.app.repository.OrganizationRepository;

@Service
public class OrganizationService {
    
    @Autowired
    private OrganizationRepository orgRepo;

    public Organization createNewOrganization(String orgName) {
        Organization newOrg = new Organization(orgName);
        return orgRepo.save(newOrg);
    }

    public List<Organization> findOrgsByName(String orgName) {
        List<Organization> foundOrganizations = orgRepo.findByOrganizationName(orgName);
        return foundOrganizations;
    }
}
