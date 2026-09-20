import { PathNode, PathEdge } from '../types.ts';

// Calculate Euclidean distance as the A* heuristic h(n)
export function calculateHeuristic(nodeA: PathNode, nodeB: PathNode): number {
  // Simple flat-surface distance for our grid / map view
  const dx = nodeA.lat - nodeB.lat;
  const dy = nodeA.lng - nodeB.lng;
  return Math.sqrt(dx * dx + dy * dy) * 111; // 111km per degree approx
}

export interface AStarResult {
  path: string[]; // List of node IDs
  totalCost: number;
  totalDistance: number;
  visitedNodes: string[]; // For visualizing pathfinding search space
}

/**
 * A* Pathfinding Algorithm for Safest Evacuation Routing
 * Takes into account distance, traffic delays, hazard levels, and blocked roads.
 */
export function findSafestRoute(
  nodes: PathNode[],
  edges: PathEdge[],
  startId: string,
  goalId: string,
  avoidBlocked: boolean = true,
  hazardWeightMultiplier: number = 5.0, // Penalize flood/hazard zones
  trafficWeightMultiplier: number = 2.0  // Penalize traffic delays
): AStarResult | null {
  const startNode = nodes.find(n => n.id === startId);
  const goalNode = nodes.find(n => n.id === goalId);

  if (!startNode || !goalNode) return null;

  // Map for fast node lookups
  const nodeMap = new Map<string, PathNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  // Build adjacency list
  const adj = new Map<string, PathEdge[]>();
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(edge => {
    // Check if the edge is valid
    if (adj.has(edge.from)) adj.get(edge.from)!.push(edge);
    // Assuming undirected graph for road networks, add bidirectional edges if not already present
    // Let's support bidirectional connections
    if (adj.has(edge.to)) {
      const reversedEdge: PathEdge = {
        ...edge,
        from: edge.to,
        to: edge.from
      };
      adj.get(edge.to)!.push(reversedEdge);
    }
  });

  // Open set (nodes to explore), closed set (already explored)
  const openSet: string[] = [startId];
  const closedSet = new Set<string>();

  // Tracks the best preceding node for each node on the path
  const cameFrom = new Map<string, string>();

  // gScore[n] is the cost of the cheapest path from start to n currently known
  const gScore = new Map<string, number>();
  gScore.set(startId, 0);

  // fScore[n] = gScore[n] + h(n). Represents current best estimate of total cost
  const fScore = new Map<string, number>();
  fScore.set(startId, calculateHeuristic(startNode, goalNode));

  // Actual physical distance traveled (distinct from safety cost)
  const distTravelled = new Map<string, number>();
  distTravelled.set(startId, 0);

  const visitedNodes: string[] = [];

  while (openSet.length > 0) {
    // Get the node in openSet with the lowest fScore value
    openSet.sort((a, b) => (fScore.get(a) ?? Infinity) - (fScore.get(b) ?? Infinity));
    const currentId = openSet.shift()!;
    visitedNodes.push(currentId);

    // If we reached the goal, reconstruct and return the path
    if (currentId === goalId) {
      const path: string[] = [];
      let temp = currentId;
      while (cameFrom.has(temp)) {
        path.push(temp);
        temp = cameFrom.get(temp)!;
      }
      path.push(startId);
      path.reverse();

      return {
        path,
        totalCost: gScore.get(goalId) ?? 0,
        totalDistance: distTravelled.get(goalId) ?? 0,
        visitedNodes
      };
    }

    closedSet.add(currentId);

    // Look at neighbors of current node
    const currentEdges = adj.get(currentId) ?? [];
    const currentNode = nodeMap.get(currentId)!;

    for (const edge of currentEdges) {
      const neighborId = edge.to;
      const neighborNode = nodeMap.get(neighborId);

      if (!neighborNode || closedSet.has(neighborId)) continue;

      // Skip blocked roads
      if (avoidBlocked && (edge.isBlocked || neighborNode.type === 'blocked')) {
        continue;
      }

      // Calculate traversal cost including safety penalties
      // Base cost is edge distance
      const distance = edge.distance;
      
      // Traffic delay penalty (multiplier)
      const trafficPenalty = edge.trafficDelay * trafficWeightMultiplier;
      
      // Flood/Hazard penalty (multiplier)
      // If node itself or edge has high hazard, heavily penalize it
      let hazardPenalty = 0;
      if (neighborNode.type === 'flooded' || edge.hazardLevel > 1) {
        hazardPenalty = (edge.hazardLevel || 2) * hazardWeightMultiplier;
      }

      // Evacuation cost formula: distance * (1 + trafficPenalty + hazardPenalty)
      const traversalCost = distance * (1 + trafficPenalty + hazardPenalty);
      const tentativeGScore = (gScore.get(currentId) ?? Infinity) + traversalCost;

      // Track distance separately
      const currentDist = distTravelled.get(currentId) ?? 0;
      const tentativeDist = currentDist + distance;

      if (!openSet.includes(neighborId)) {
        openSet.push(neighborId);
      } else if (tentativeGScore >= (gScore.get(neighborId) ?? Infinity)) {
        continue; // This is not a better path
      }

      // This path is the best so far. Record it!
      cameFrom.set(neighborId, currentId);
      gScore.set(neighborId, tentativeGScore);
      distTravelled.set(neighborId, tentativeDist);
      fScore.set(neighborId, tentativeGScore + calculateHeuristic(neighborNode, goalNode));
    }
  }

  return null; // No path found
}
