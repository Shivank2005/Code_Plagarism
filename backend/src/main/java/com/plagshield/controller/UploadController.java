package com.plagshield.controller;

import com.plagshield.model.AnalysisBatch;
import com.plagshield.repository.AnalysisBatchRepository;
import com.plagshield.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/submissions")
@CrossOrigin(origins = "*")
public class UploadController {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private AnalysisBatchRepository batchRepository;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadSubmissions(@RequestParam("file") MultipartFile file) {
        String batchId = UUID.randomUUID().toString();
        String path = fileStorageService.storeSubmissions(file, batchId);

        AnalysisBatch batch = new AnalysisBatch();
        batch.setId(batchId);
        batch.setStatus("UPLOADED");
        batch.setStoragePath(path);
        batch.setLanguage("JAVA"); // Default for now
        batchRepository.save(batch);

        Map<String, String> response = new HashMap<>();
        response.put("batchId", batchId);
        response.put("status", "success");
        response.put("message", "Submissions uploaded successfully.");

        return ResponseEntity.ok(response);
    }
}
