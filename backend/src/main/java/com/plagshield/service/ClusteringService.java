package com.plagshield.service;

import com.plagshield.model.PlagiarismResult;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ClusteringService {

    public List<Map<String, Object>> detectPlagiarismRings(List<PlagiarismResult> results, double threshold) {
        // 1. Build adjacency graph with only threshold-passing edges
        Map<String, Set<String>> adj = new HashMap<>();
        Map<String, Double> edgeScores = new HashMap<>();
        Set<String> allStudents = new HashSet<>();

        for (PlagiarismResult res : results) {
            if (res.getSimilarityScore() >= threshold) {
                String a = res.getSubmissionA();
                String b = res.getSubmissionB();
                adj.computeIfAbsent(a, k -> new HashSet<>()).add(b);
                adj.computeIfAbsent(b, k -> new HashSet<>()).add(a);
                allStudents.add(a);
                allStudents.add(b);
                
                // Store edge score for later stats calculation (order-independent key)
                String edgeKey = (a.compareTo(b) < 0) ? a + "|" + b : b + "|" + a;
                edgeScores.put(edgeKey, res.getSimilarityScore());
            }
        }

        // 2. BFS Connected Components
        List<Set<String>> components = new ArrayList<>();
        Set<String> visited = new HashSet<>();

        // Sort keys for deterministic traversal
        List<String> sortedStudents = new ArrayList<>(allStudents);
        Collections.sort(sortedStudents);

        for (String startNode : sortedStudents) {
            if (!visited.contains(startNode)) {
                Set<String> component = new HashSet<>();
                Queue<String> queue = new LinkedList<>();
                
                queue.add(startNode);
                visited.add(startNode);
                
                while (!queue.isEmpty()) {
                    String curr = queue.poll();
                    component.add(curr);
                    
                    for (String neighbor : adj.getOrDefault(curr, Collections.emptySet())) {
                        if (!visited.contains(neighbor)) {
                            visited.add(neighbor);
                            queue.add(neighbor);
                        }
                    }
                }
                components.add(component);
            }
        }

        // 3. Filter and Calculate Statistics
        List<Map<String, Object>> finalClusters = new ArrayList<>();

        for (Set<String> comp : components) {
            if (comp.size() >= 3) {
                List<String> members = new ArrayList<>(comp);
                Collections.sort(members);
                
                int n = members.size();
                int possibleEdges = n * (n - 1) / 2;
                
                int actualConnections = 0;
                double sumSimilarity = 0.0;
                double maxSimilarity = 0.0;
                
                for (int i = 0; i < n; i++) {
                    for (int j = i + 1; j < n; j++) {
                        String a = members.get(i);
                        String b = members.get(j);
                        String edgeKey = (a.compareTo(b) < 0) ? a + "|" + b : b + "|" + a;
                        
                        if (edgeScores.containsKey(edgeKey)) {
                            actualConnections++;
                            double score = edgeScores.get(edgeKey);
                            sumSimilarity += score;
                            if (score > maxSimilarity) {
                                maxSimilarity = score;
                            }
                        }
                    }
                }
                
                double density = (double) actualConnections / possibleEdges;
                double avgSimilarity = actualConnections > 0 ? sumSimilarity / actualConnections : 0.0;
                
                String classification;
                if (density >= 0.8) {
                    classification = "Coordinated Ring";
                } else if (density >= 0.5) {
                    classification = "Suspicious Cluster";
                } else {
                    classification = "Plagiarism Chain";
                }
                
                Map<String, Object> clusterData = new HashMap<>();
                clusterData.put("members", members);
                clusterData.put("connections", actualConnections);
                clusterData.put("possibleConnections", possibleEdges);
                clusterData.put("density", density);
                clusterData.put("averageSimilarity", avgSimilarity);
                clusterData.put("maxSimilarity", maxSimilarity);
                clusterData.put("classification", classification);
                
                finalClusters.add(clusterData);
            }
        }

        // 4. Deterministic Sorting: Density descending, then Size descending
        finalClusters.sort((c1, c2) -> {
            double d1 = (Double) c1.get("density");
            double d2 = (Double) c2.get("density");
            if (Double.compare(d2, d1) != 0) {
                return Double.compare(d2, d1);
            }
            List<?> m1 = (List<?>) c1.get("members");
            List<?> m2 = (List<?>) c2.get("members");
            return Integer.compare(m2.size(), m1.size());
        });

        return finalClusters;
    }
}
