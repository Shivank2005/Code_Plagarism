package com.plagshield.service;

import com.plagshield.model.PlagiarismResult;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ClusteringService {

    public List<Set<String>> detectPlagiarismRings(List<PlagiarismResult> results, double threshold) {
        Map<String, List<String>> adj = new HashMap<>();
        Set<String> students = new HashSet<>();

        for (PlagiarismResult res : results) {
            if (res.getSimilarityScore() >= threshold) {
                adj.computeIfAbsent(res.getSubmissionA(), k -> new ArrayList<>()).add(res.getSubmissionB());
                adj.computeIfAbsent(res.getSubmissionB(), k -> new ArrayList<>()).add(res.getSubmissionA());
                students.add(res.getSubmissionA());
                students.add(res.getSubmissionB());
            }
        }

        List<Set<String>> clusters = new ArrayList<>();
        Set<String> visited = new HashSet<>();

        for (String student : students) {
            if (!visited.contains(student)) {
                Set<String> cluster = new HashSet<>();
                bfs(student, adj, visited, cluster);
                if (cluster.size() > 1) {
                    clusters.add(cluster);
                }
            }
        }
        return clusters;
    }

    private void bfs(String start, Map<String, List<String>> adj, Set<String> visited, Set<String> cluster) {
        Queue<String> queue = new LinkedList<>();
        queue.add(start);
        visited.add(start);

        while (!queue.isEmpty()) {
            String current = queue.poll();
            cluster.add(current);

            List<String> neighbors = adj.getOrDefault(current, new ArrayList<>());
            for (String neighbor : neighbors) {
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);
                    queue.add(neighbor);
                }
            }
        }
    }
}
