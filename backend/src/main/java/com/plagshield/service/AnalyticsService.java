package com.plagshield.service;

import com.plagshield.model.PlagiarismResult;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class AnalyticsService {

    public Map<String, Object> generateGraphData(List<PlagiarismResult> results, double threshold) {
        List<Map<String, String>> nodes = new ArrayList<>();
        List<Map<String, Object>> edges = new ArrayList<>();
        Set<String> uniqueStudents = new HashSet<>();

        for (PlagiarismResult res : results) {
            if (res.getSimilarityScore() >= threshold) {
                uniqueStudents.add(res.getSubmissionA());
                uniqueStudents.add(res.getSubmissionB());

                Map<String, Object> edge = new HashMap<>();
                edge.put("source", res.getSubmissionA());
                edge.put("target", res.getSubmissionB());
                edge.put("value", res.getSimilarityScore());
                edges.add(edge);
            }
        }

        for (String student : uniqueStudents) {
            Map<String, String> node = new HashMap<>();
            node.put("id", student);
            node.put("label", student);
            nodes.add(node);
        }

        Map<String, Object> graph = new HashMap<>();
        graph.put("nodes", nodes);
        graph.put("links", edges);
        return graph;
    }
}
