package com.plagshield.repository;

import com.plagshield.model.AppPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppPreferenceRepository extends JpaRepository<AppPreference, String> {
}
