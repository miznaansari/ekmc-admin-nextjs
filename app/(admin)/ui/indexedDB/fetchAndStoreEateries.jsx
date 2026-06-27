import db from "./db";

export const fetchAndStoreEateries = async (page = 1, limit = 10) => {
  try {
    const token = localStorage.getItem("authToken");
const baseUrl = process.env.VITE_REACT_APP_BACKEND_URL;
    const res = await fetch(
      `${baseUrl}/api/admin/v2/cafes?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const json = await res.json();

    if (json.success) {
      const cafes = json.data.data;

      // Bulk insert/update
      await db.eatery_list.bulkPut(cafes);

      console.log("Data stored in IndexedDB ✅");
    }
  } catch (err) {
    console.error("Error storing data:", err);
  }
};