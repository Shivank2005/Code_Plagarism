package com.plagshield.service;

import com.plagshield.model.PlagiarismResult;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ClusteringService {

    public List<Set<String>> detectPlagiarismRings(List<PlagiarismResult> results, double threshold) {
        Map<String, Set<String>> adj = new HashMap<>();
        List<PlagiarismResult> validEdges = new ArrayList<>();

        for (PlagiarismResult res : results) {
            if (res.getSimilarityScore() >= threshold) {
                adj.computeIfAbsent(res.getSubmissionA(), k -> new HashSet<>()).add(res.getSubmissionB());
                adj.computeIfAbsent(res.getSubmissionB(), k -> new HashSet<>()).add(res.getSubmissionA());
                validEdges.add(res);
            }
        }

        // Sort edges by highest similarity score first
        validEdges.sort((a, b) -> Double.compare(b.getSimilarityScore(), a.getSimilarityScore()));

        List<Set<String>> clusters = new ArrayList<>();
        Set<String> clusteredStudents = new HashSet<>();

        for (PlagiarismResult edge : validEdges) {
            if (clusteredStudents.contains(edge.getSubmissionA()) && clusteredStudents.contains(edge.getSubmissionB())) {
                continue; 
            }

            Set<String> currentClique = new HashSet<>();
            currentClique.add(edge.getSubmissionA());
            currentClique.add(edge.getSubmissionB());

            for (String candidate : adj.keySet()) {
                if (clusteredStudents.contains(candidate) || currentClique.contains(candidate)) continue;
                
                boolean isConnectedToAll = true;
                for (String member : currentClique) {
                    if (!adj.get(member).contains(candidate)) {
                        isConnectedToAll = false;
                        break;
                    }
                }
                
                if (isConnectedToAll) {
                    currentClique.add(candidate);
                }
            }

            clusters.add(currentClique);
            clusteredStudents.addAll(currentClique);
        }

        return clusters;
    }
}
