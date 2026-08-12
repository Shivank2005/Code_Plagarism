package com.plagshield.repository;

import com.plagshield.model.PlagiarismResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlagiarismResultRepository extends MongoRepository<PlagiarismResult, String> {
    List<PlagiarismResult> findByBatchId(String batchId);
}
