package com.plagshield;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class PlagShieldApplication {
    public static void main(String[] args) {
        SpringApplication.run(PlagShieldApplication.class, args);
    }
}
