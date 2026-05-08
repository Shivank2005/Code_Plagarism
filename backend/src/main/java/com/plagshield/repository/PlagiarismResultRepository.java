package com.plagshield.repository;

import com.plagshield.model.PlagiarismResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlagiarismResultRepository extends JpaRepository<PlagiarismResult, Long> {
    List<PlagiarismResult> findByBatchId(String batchId);
}
