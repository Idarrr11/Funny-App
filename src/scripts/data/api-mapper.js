import Map from "../utils/map";

export async function reportMapper(story) {
  const placeName = await Map.getPlaceNameByCoordinate(story.lat, story.lon);

  return {
    id: story.id || story._id || crypto.randomUUID(), // ✅ fallback ID
    ...story,
    reportedBy: story.reportedBy || story.name || "Anonim", // ✅ fallback reporter
    location: {
      lat: story.lat,
      lon: story.lon,
      placeName,
    },
  };
}
