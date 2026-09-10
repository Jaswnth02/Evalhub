/**
 * Density-Based Spatial Clustering (DBSCAN) for Code Plagiarism Detection
 * Groups suspicious submissions sharing high mutual source-code similarity
 */

function runDBSCAN(submissionIds, distanceMatrix, epsilon = 0.40, minPts = 2) {
  // distanceMatrix is a 2D map or dictionary: matrix[idA][idB] = distance (0.0 to 1.0)
  // Distance = 1.0 - (similarityScore / 100.0)
  // epsilon = 0.40 corresponds to similarity >= 60%

  const visited = new Set();
  const clusters = {}; // clusterId -> Array of submissionIds
  const labels = {};   // submissionId -> clusterId (or 'NOISE')
  let currentClusterId = 1;

  function regionQuery(pId) {
    const neighbors = [];
    for (const otherId of submissionIds) {
      const dist = (distanceMatrix[pId] && distanceMatrix[pId][otherId] !== undefined)
        ? distanceMatrix[pId][otherId]
        : 1.0;
      if (dist <= epsilon) {
        neighbors.push(otherId);
      }
    }
    return neighbors;
  }

  function expandCluster(pId, neighbors, clusterId) {
    labels[pId] = clusterId;
    if (!clusters[clusterId]) {
      clusters[clusterId] = [];
    }
    clusters[clusterId].push(pId);

    const queue = [...neighbors];
    let i = 0;
    while (i < queue.length) {
      const neighborId = queue[i++];

      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        const nextNeighbors = regionQuery(neighborId);
        if (nextNeighbors.length >= minPts) {
          // Density connected: add new neighbors to queue
          for (const nextId of nextNeighbors) {
            if (!queue.includes(nextId)) {
              queue.push(nextId);
            }
          }
        }
      }

      if (!labels[neighborId] || labels[neighborId] === 'NOISE') {
        labels[neighborId] = clusterId;
        if (!clusters[clusterId].includes(neighborId)) {
          clusters[clusterId].push(neighborId);
        }
      }
    }
  }

  for (const pId of submissionIds) {
    if (visited.has(pId)) continue;
    visited.add(pId);

    const neighbors = regionQuery(pId);
    if (neighbors.length < minPts) {
      labels[pId] = 'NOISE';
    } else {
      expandCluster(pId, neighbors, currentClusterId);
      currentClusterId++;
    }
  }

  // Organize results
  const formattedClusters = Object.keys(clusters).map(cId => {
    const members = clusters[cId];
    // Calculate average intra-cluster similarity
    let totalSim = 0;
    let count = 0;
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const d = distanceMatrix[members[i]][members[j]];
        totalSim += (1.0 - d) * 100;
        count++;
      }
    }
    const avgSimilarity = count > 0 ? Number((totalSim / count).toFixed(2)) : 100.0;

    return {
      clusterId: Number(cId),
      memberSubmissionIds: members,
      size: members.length,
      averageSimilarity: avgSimilarity,
      status: avgSimilarity >= 75 ? 'CRITICAL_COLLUSION' : 'SUSPICIOUS_GROUP'
    };
  });

  const outliers = submissionIds.filter(id => labels[id] === 'NOISE');

  return {
    clusters: formattedClusters,
    outliers,
    labels,
    parameters: { epsilon, minPts, similarityThreshold: ((1 - epsilon) * 100).toFixed(0) + '%' }
  };
}

module.exports = {
  runDBSCAN
};
