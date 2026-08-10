package com.plagshield.repository;

import com.plagshield.model.AnalysisBatch;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnalysisBatchRepository extends MongoRepository<AnalysisBatch, String> {
}
