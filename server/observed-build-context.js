const POSITION_BY_LANE = Object.freeze({
  "Лес": "jungle",
  "Опыт": "exp",
  "Мид": "mid",
  "Золото": "gold",
  "Роум": "roam"
});

const RANK_LABELS = Object.freeze({
  all: "Все ранги",
  epic: "Эпик",
  legend: "Легенда",
  mythic: "Мифик",
  honor: "Мифическая честь",
  glory: "Мифическая слава"
});

export function selectObservedBuild(payload, { lane, rank = "all" } = {}) {
  if (!payload?.ok || !Array.isArray(payload.positions)) {
    return { status: "unavailable", message: payload?.error || "Источник сборок временно недоступен." };
  }
  const positionId = POSITION_BY_LANE[lane];
  const position = payload.positions.find(entry => entry.id === positionId);
  if (!position) {
    return { status: "position-unavailable", requestedPosition: lane, message: "Источник не вернул сборку для выбранной позиции." };
  }

  const requestedRank = Object.hasOwn(RANK_LABELS, rank) ? rank : "all";
  let rankUsed = requestedRank;
  let rankData = position.ranks?.[rankUsed];
  let rankFallback = false;
  if ((!Array.isArray(rankData?.builds) || rankData.builds.length === 0) &&
      requestedRank !== "all" &&
      Array.isArray(position.ranks?.all?.builds) &&
      position.ranks.all.builds.length) {
    rankUsed = "all";
    rankData = position.ranks.all;
    rankFallback = true;
  }
  if (!Array.isArray(rankData?.builds) || rankData.builds.length === 0) {
    return {
      status: "no-builds",
      position: { id: position.id, label: position.label },
      requestedRank,
      rankUsed,
      message: "Для этой позиции и ранга источник не вернул сборки."
    };
  }

  return {
    status: "available",
    position: { id: position.id, label: position.label },
    requestedRank,
    requestedRankLabel: RANK_LABELS[requestedRank],
    rankUsed,
    rankLabel: rankData.label || RANK_LABELS[rankUsed],
    rankFallback,
    builds: rankData.builds.slice(0, 3),
    source: payload.source || null,
    methodology: payload.methodology || null,
    sampleSizeAvailable: false,
    updatedAt: payload.updatedAt || null
  };
}
