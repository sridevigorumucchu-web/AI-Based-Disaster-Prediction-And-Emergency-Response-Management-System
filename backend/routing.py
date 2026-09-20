import math
import heapq
from typing import List, Dict, Any, Tuple, Optional

class AStarSolver:
    def __init__(self, nodes: List[Dict[str, Any]], edges: List[Dict[str, Any]]):
        self.nodes = {n["id"]: n for n in nodes}
        self.edges = edges
        self.adj = {n_id: [] for n_id in self.nodes.keys()}
        
        # Build bidirectional graph
        for edge in edges:
            f, t = edge["from"], edge["to"]
            if f in self.adj and t in self.adj:
                self.adj[f].append(edge)
                # Reverse edge for undirected roads
                rev_edge = edge.copy()
                rev_edge["from"], rev_edge["to"] = t, f
                self.adj[t].append(rev_edge)

    def calculate_heuristic(self, node_a_id: str, node_b_id: str) -> float:
        """
        Straight-line distance calculation (h(n)) using coordinate offsets.
        """
        na = self.nodes[node_a_id]
        nb = self.nodes[node_b_id]
        return math.sqrt((na["lat"] - nb["lat"])**2 + (na["lng"] - nb["lng"])**2) * 111.0

    def find_safest_route(
        self, 
        start_id: str, 
        goal_id: str, 
        avoid_blocked: bool = True,
        hazard_multiplier: float = 5.0,
        traffic_multiplier: float = 2.0
    ) -> Optional[Dict[str, Any]]:
        """
        Solves A* pathfinding incorporating distance, traffic factor, and hazard levels.
        """
        if start_id not in self.nodes or goal_id not in self.nodes:
            return None

        # Min-heap elements: (f_score, current_node_id)
        open_set = []
        heapq.heappush(open_set, (0.0, start_id))
        
        came_from = {}
        g_score = {node_id: float("inf") for node_id in self.nodes.keys()}
        g_score[start_id] = 0.0
        
        dist_traveled = {node_id: 0.0 for node_id in self.nodes.keys()}

        while open_set:
            _, current = heapq.heappop(open_set)

            if current == goal_id:
                # Reconstruct path
                path = []
                temp = current
                while temp in came_from:
                    path.append(temp)
                    temp = came_from[temp]
                path.append(start_id)
                path.reverse()
                
                return {
                    "path": path,
                    "total_cost": g_score[goal_id],
                    "total_distance": dist_traveled[goal_id]
                }

            for edge in self.adj.get(current, []):
                neighbor = edge["to"]
                neighbor_node = self.nodes[neighbor]

                # Filter blocked segments
                if avoid_blocked and (edge.get("isBlocked", False) or neighbor_node.get("type") == "blocked"):
                    continue

                # Evacuation traversal cost model
                dist = edge["distance"]
                traffic = edge.get("trafficDelay", 0.0) * traffic_multiplier
                hazard = edge.get("hazardLevel", 0.0) * hazard_multiplier if neighbor_node.get("type") == "flooded" else 0.0

                traversal_cost = dist * (1.0 + traffic + hazard)
                tentative_g_score = g_score[current] + traversal_cost

                if tentative_g_score < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g_score
                    dist_traveled[neighbor] = dist_traveled[current] + dist
                    
                    f_score = tentative_g_score + self.calculate_heuristic(neighbor, goal_id)
                    heapq.heappush(open_set, (f_score, neighbor))

        return None # Unreachable
