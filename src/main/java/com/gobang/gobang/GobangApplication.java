package com.gobang.gobang;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

//
@EnableJpaAuditing
@SpringBootApplication
public class GobangApplication {

	public static void main(String[] args) {
		SpringApplication.run(GobangApplication.class, args);
	}
}

