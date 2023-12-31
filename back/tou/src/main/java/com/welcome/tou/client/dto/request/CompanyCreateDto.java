package com.welcome.tou.client.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@AllArgsConstructor
@RequiredArgsConstructor
@Builder
@Data
public class CompanyCreateDto {

    private String companyName;
    private String registrationNumber;
    private String companyLocation;
    private String companyContact;
}
