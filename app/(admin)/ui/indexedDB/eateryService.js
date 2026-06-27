import db from "./db";

// ADD
export const addEatery = async (data) => {
  return await db.eatery_list.add(data);
};

// UPDATE
export const updateEatery = async (id, data) => {
  return await db.eatery_list.update(id, data);
};

// DELETE
export const deleteEatery = async (id) => {
  return await db.eatery_list.delete(id);
};

// GET ALL
export const getAllEateries = async () => {
  return await db.eatery_list.toArray();
};

// GET BY ID
export const getEateryById = async (id) => {
  return await db.eatery_list.get(id);
};