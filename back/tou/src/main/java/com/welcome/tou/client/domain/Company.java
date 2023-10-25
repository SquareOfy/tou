package com.welcome.tou.client.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "COMPANY")
public class Company {

    // 사업체 일련번호
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "company_seq", unique = true, nullable = false)
    private Long companySeq;

    // 업체명
    @Column(name = "company_name", length = 50, nullable = false)
    private String companyName;

    // 사업자 등록 번호
    @Column(name = "registration_number", length = 20, nullable = false)
    private String registrationNumber;

    // 사업체 소재지
    @Column(name = "company_location", nullable = false)
    private String companyLocation;

    // 사업체 연락처
    @Column(name = "company_contact", length = 20, nullable = false)
    private String companyContact;

    // 사업체 로고
    @Column(name = "logo_image", length = 200)
    private String logoImage;
}
