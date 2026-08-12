package com.plagshield.controller;

import com.plagshield.model.AppPreference;
import com.plagshield.repository.AppPreferenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/preferences")
@CrossOrigin(origins = "*")
public class PreferencesController {

    private static final String DEFAULT_PREFERENCE_ID = "default";

    @Autowired
    private AppPreferenceRepository preferenceRepository;

    @GetMapping
    public ResponseEntity<AppPreference> getPreferences() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String preferenceId = resolvePreferenceId(auth.getName());
        AppPreference preferences = preferenceRepository
                .findById(preferenceId)
                .orElseGet(() -> createDefaultPreferences(preferenceId));
        return ResponseEntity.ok(preferences);
    }

    @PutMapping
    public ResponseEntity<AppPreference> savePreferences(
            @RequestBody AppPreference request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String preferenceId = resolvePreferenceId(auth.getName());
        AppPreference preferences = preferenceRepository
                .findById(preferenceId)
                .orElseGet(() -> createDefaultPreferences(preferenceId));

        preferences.setHighRiskThreshold(request.getHighRiskThreshold());
        preferences.setSuspiciousThreshold(request.getSuspiciousThreshold());
        preferences.setAutoRefreshHistory(request.isAutoRefreshHistory());
        preferences.setCompactMode(request.isCompactMode());
        preferences.setAnimateHeatmap(request.isAnimateHeatmap());

        return ResponseEntity.ok(preferenceRepository.save(preferences));
    }

    private String resolvePreferenceId(String user) {
        if (user == null || user.isBlank()) {
            return DEFAULT_PREFERENCE_ID;
        }
        return user.trim().toLowerCase();
    }

    private AppPreference createDefaultPreferences(String preferenceId) {
        AppPreference preferences = new AppPreference();
        preferences.setId(preferenceId);
        preferences.setHighRiskThreshold(75);
        preferences.setSuspiciousThreshold(40);
        preferences.setAutoRefreshHistory(true);
        preferences.setCompactMode(false);
        preferences.setAnimateHeatmap(true);
        return preferenceRepository.save(preferences);
    }
}
