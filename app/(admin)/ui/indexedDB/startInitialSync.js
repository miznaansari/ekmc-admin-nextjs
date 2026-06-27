import db from "./db";

export const startInitialSync = async () => {
  try {
    const isSyncing = localStorage.getItem("isSyncing");

    if (isSyncing === "true") {
      console.log("⏳ Sync already running...");
      return;
    }

    localStorage.setItem("isSyncing", "true");

    console.log("🔄 Sync started...");

    await db.eatery_list.clear();

    let page = 1;
    let lastPage = 1;

    const token = localStorage.getItem("authToken");

    do {
      const baseUrl = process.env.VITE_REACT_APP_BACKEND_URL;
      const res = await fetch(
        `${baseUrl}/api/admin/v2/cafes?page=${page}&limit=10000`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      // ✅ SAFE ACCESS
      const cafes = json?.data?.data || [];

      console.log(`📄 Page ${page} → ${cafes.length} items`);

      if (cafes.length > 0) {
        await db.eatery_list.bulkPut(cafes);
      }

      lastPage = json?.data?.lastPage || 1;

      page++;

      await new Promise((r) => setTimeout(r, 50));

    } while (page <= lastPage);

    console.log("✅ Sync completed");

    localStorage.setItem("isSynced", "true");
  } catch (err) {
    console.error("❌ Sync error:", err);
  } finally {
    localStorage.removeItem("isSyncing");
  }
};