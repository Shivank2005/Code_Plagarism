package com.plagshield.service;

import org.apache.commons.io.FilenameUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class FileStorageService {

    private final Path root = Paths.get("storage");

    public FileStorageService() {
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage folder", e);
        }
    }

    public String storeSubmissions(MultipartFile file, String batchId) {
        return storeSubmissions(List.of(file), batchId);
    }

    public String storeSubmissions(List<MultipartFile> files, String batchId) {
        try {
            Path batchPath = this.root.resolve(batchId);
            Files.createDirectories(batchPath);

            for (MultipartFile file : files) {
                if (file == null || file.isEmpty()) {
                    continue;
                }

                String extension = FilenameUtils.getExtension(file.getOriginalFilename());
                if ("zip".equalsIgnoreCase(extension)) {
                    extractZip(file.getInputStream(), batchPath);
                } else {
                    Path targetFile = batchPath.resolve(file.getOriginalFilename());
                    Files.createDirectories(targetFile.getParent());
                    Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
                }
            }
            return batchPath.toString();
        } catch (Exception e) {
            throw new RuntimeException("Could not store the file. Error: " + e.getMessage());
        }
    }

    private void extractZip(InputStream is, Path targetDir) throws IOException {
        try (ZipInputStream zis = new ZipInputStream(is)) {
            ZipEntry zipEntry = zis.getNextEntry();
            while (zipEntry != null) {
                Path newPath = zipFileHandler(targetDir, zipEntry);
                if (zipEntry.isDirectory()) {
                    Files.createDirectories(newPath);
                } else {
                    Files.createDirectories(newPath.getParent());
                    Files.copy(zis, newPath, StandardCopyOption.REPLACE_EXISTING);
                }
                zipEntry = zis.getNextEntry();
            }
            zis.closeEntry();
        }
    }

    private Path zipFileHandler(Path targetDir, ZipEntry zipEntry) throws IOException {
        Path targetDirResolved = targetDir.resolve(zipEntry.getName());
        Path normalizePath = targetDirResolved.normalize();
        if (!normalizePath.startsWith(targetDir)) {
            throw new IOException("Bad zip entry: " + zipEntry.getName());
        }
        return normalizePath;
    }
}
