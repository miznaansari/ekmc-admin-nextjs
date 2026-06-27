import Dexie from "dexie";

export const db = new Dexie("EateryDB");

// Define schema
db.version(1).stores({
  eatery_list: "id, cafe_name, city_name, state_name, country_name, is_featured, is_new_opening"
});

export default db;