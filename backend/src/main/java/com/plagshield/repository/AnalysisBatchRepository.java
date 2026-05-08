package com.plagshield.repository;

import com.plagshield.model.AnalysisBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnalysisBatchRepository extends JpaRepository<AnalysisBatch, String> {
}
