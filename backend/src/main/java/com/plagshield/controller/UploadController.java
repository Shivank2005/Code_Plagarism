package com.plagshield.controller;

import com.plagshield.model.AnalysisBatch;
import com.plagshield.repository.AnalysisBatchRepository;
import com.plagshield.service.FileStorageService;
import com.plagshield.service.LanguageConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/submissions")
public class UploadController {

    private final FileStorageService fileStorageService;
    private final AnalysisBatchRepository batchRepository;
    private final LanguageConfigService languageConfigService;

    @Autowired
    public UploadController(FileStorageService fileStorageService,
                            AnalysisBatchRepository batchRepository,
                            LanguageConfigService languageConfigService) {
        this.fileStorageService = fileStorageService;
        this.batchRepository = batchRepository;
        this.languageConfigService = languageConfigService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadSubmissions(@RequestParam("file") List<MultipartFile> files) {
        String batchId = UUID.randomUUID().toString();
        String path = fileStorageService.storeSubmissions(files, batchId);

        AnalysisBatch batch = new AnalysisBatch();
        batch.setId(batchId);
        batch.setStatus("UPLOADED");
        batch.setStoragePath(path);
        batch.setLanguage(determineLanguage(files));
        batchRepository.save(batch);

        Map<String, Object> response = new HashMap<>();
        response.put("batchId", batchId);
        response.put("status", "success");
        response.put("message", "Submissions uploaded successfully.");
        response.put("files", collectFiles(path));

        return ResponseEntity.ok(response);
    }

    private List<Map<String, String>> collectFiles(String storagePath) {
        List<Map<String, String>> files = new ArrayList<>();
        Path batchPath = Paths.get(storagePath);
        if (!Files.exists(batchPath)) {
            return files;
        }

        try (Stream<Path> pathStream = Files.walk(batchPath)) {
            pathStream
                    .filter(Files::isRegularFile)
                    .forEach(path -> {
                        try {
                            String relativeId = batchPath.relativize(path).toString().replace('\\', '/');
                            String content = Files.readString(path);
                            files.add(Map.of("id", relativeId, "code", content));
                        } catch (IOException ignored) {
                        }
                    });
        } catch (IOException ignored) {
        }

        return files;
    }

    private String determineLanguage(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) return "UNKNOWN";
        java.util.Set<String> langs = new java.util.HashSet<>();
        for (MultipartFile file : files) {
            String name = file.getOriginalFilename();
            if (name == null) continue;
            
            String ext = name.contains(".") ? name.substring(name.lastIndexOf(".") + 1) : "txt";
            String lang = languageConfigService.getLanguageForExtension(ext);
            if (!"UNKNOWN".equals(lang)) {
                langs.add(lang);
            }
        }
        if (langs.isEmpty()) return "UNKNOWN";
        if (langs.size() > 1) return "MULTI";
        return langs.iterator().next();
    }
}

