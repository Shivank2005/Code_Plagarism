package com.plagshield.repository;

import com.plagshield.model.AppPreference;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppPreferenceRepository extends MongoRepository<AppPreference, String> {
}
