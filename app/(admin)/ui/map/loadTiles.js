import db from "../indexedDB/db";

const loadFromIndexedDB = async (map) => {
  if (!map) return;

  const bounds = map.getBounds();

  const west = bounds.getWest();
  const east = bounds.getEast();
  const south = bounds.getSouth();
  const north = bounds.getNorth();

  // ⚡ Get all data (or optimize later)
  const all = await db.eatery_list.toArray();

  // 🎯 Filter by viewport
  const visible = all.filter((item) => {
    return (
      item.lat >= south &&
      item.lat <= north &&
      item.lng >= west &&
      item.lng <= east
    );
  });

  // ⚡ PRIORITY SORT (important for UX)
  visible.sort((a, b) => b.ekmc_score - a.ekmc_score);

  // 🎯 Convert to geojson
  const features = visible.map((cafe) => ({
    type: "Feature",
    properties: {
      id: cafe.id,
      name: cafe.cafe_name,
      image: cafe.image,
      score: cafe.ekmc_score,
    },
    geometry: {
      type: "Point",
      coordinates: [cafe.lng, cafe.lat],
    },
  }));

  rebuildClusters(map, features);
};