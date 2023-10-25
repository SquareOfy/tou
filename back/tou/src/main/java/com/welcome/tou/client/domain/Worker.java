package com.welcome.tou.client.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "WORKER")
public class Worker {

    // 실무자 일련번호
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "worker_seq", unique = true, nullable = false)
    private Long workerSeq;

    // 성명
    @Column(name = "worker_name", length = 50, nullable = false)
    private String workerName;

    // 연락처
    @Column(name = "phone", length = 20, nullable = false)
    private String phone;

    // 로그인 아이디
    @Column(name = "login_id", length = 50, nullable = false)
    private String loginId;

    // 비밀번호
    @Column(name = "password", nullable = false)
    private String password;

    // 이메일
    @Column(name = "email", length = 70)
    private String email;

    // 생체인증
    @Column(name = "biometrics")
    private String biometrics;

    // 리프레시 토큰
    @Column(name = "refresh_token", nullable = false)
    private String refreshToken;

    // 권한
    @Enumerated
    @Column(name = "role", length = 20, nullable = false)
    private String role;
}
