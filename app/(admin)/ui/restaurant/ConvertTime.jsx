export const convertFromUTC = () => {
  const utcDate = new Date();
  const localTimeString = utcDate.toLocaleTimeString();
  return localTimeString;
};
export const getTimeDifference = (utcTime) => {
  // Convert the backend UTC time to a Date object
  const backendTime = new Date(utcTime.replace(" ", "T") + "Z");

  // Check if the date is valid
  if (isNaN(backendTime.getTime())) {
    console.error("Invalid Date:", backendTime);
    return "Invalid Date";
  }

  // Get the current UTC time
  const currentUtcTime = new Date(Date.now());

  // Calculate the time difference in milliseconds
  const timeDifference = currentUtcTime - backendTime;

  // Convert milliseconds to minutes, hours, days
  const totalMinutes = Math.floor(timeDifference / (1000 * 60));
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  // Return the formatted time difference
  if (totalDays > 0) {
    return `${totalDays}d ${totalHours % 24}h ago`;
  } else if (totalHours > 0) {
    return `${totalHours}h ${totalMinutes % 60}m ago`;
  } else if (totalMinutes > 0) {
    return `${totalMinutes}m ago`;
  } else {
    return "Just now";
  }
};

export const convertToUTC = (time) => {
  // Check if time is empty or invalid
  if (!time || time === "") {
    return ""; // Return empty string for empty time
  }

  try {
    const [hours, minutes, seconds = "00"] = time
      .split(":")
      .map((val) => val || "00");

    // Validate parts are numbers
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      return ""; // Return empty string for invalid format
    }

    const localTime = new Date();
    localTime.setHours(parseInt(hours, 10));
    localTime.setMinutes(parseInt(minutes, 10));
    localTime.setSeconds(parseInt(seconds, 10));

    const utcTime = localTime.toISOString();
    return utcTime.split("T")[1].slice(0, 8);
  } catch (error) {
    console.error("Error converting time to UTC:", error);
    return ""; // Fallback for any other error
  }
};

export const currentTime = () => {
  const date = new Date();

  const pad = (n) => n.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1); // Months are 0-based
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};


export function timeChangeFormat(isoString) {
  const date = new Date(isoString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


export function UTCTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const formatDate = isoString => {
  if (typeof isoString === 'string' && isoString.includes('T')) {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } else {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
};

export const serveformatDate = isoString => {
  if (typeof isoString === 'string' && isoString.includes('T')) {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
};

export function newlastUpdatedAtDateToUTC() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
export function lastUpdatedAtDateToUTC() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000`;
}
// export function lastUpdatedAtDateToUTC() {
//   const now = new Date();
//   const year = now.getUTCFullYear();
//   const month = String(now.getUTCMonth() + 1).padStart(2, "0");
//   const day = String(now.getUTCDate()).padStart(2, "0");
//   const hours = String(now.getUTCHours()).padStart(2, "0");
//   const minutes = String(now.getUTCMinutes()).padStart(2, "0");
//   const seconds = String(now.getUTCSeconds()).padStart(2, "0");
//   const milliseconds = String(now.getUTCMilliseconds()).padStart(3, "0");

//   return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
// }
// export function lastUpdatedAtDateToUTC() {
//   return new Date().toISOString();
// }


export function generateUUID() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

export function generateUniqueIdAddMenu() {
  let uniqueIdAddMenu =
    parseInt(localStorage.getItem("uniqueIdAddMenu"), 10) || 0;
  uniqueIdAddMenu += 1;
  localStorage.setItem("uniqueIdAddMenu", uniqueIdAddMenu);
  return uniqueIdAddMenu;
}

export function generateUniqueIdAddon() {
  let addonId = parseInt(localStorage.getItem("addonId"), 10) || 0;
  addonId += 1;
  localStorage.setItem("addonId", addonId);
  return addonId;
}
export function generateUniqueIdCategory() {
  let CatId = parseInt(localStorage.getItem("CatId"), 10) || 0;
  CatId += 1;
  localStorage.setItem("CatId", CatId);
  return CatId;
}
export function generateUniqueIdItemName() {
  let ItemId = parseInt(localStorage.getItem("ItemId"), 10) || 0;
  ItemId += 1;
  localStorage.setItem("ItemId", ItemId);
  return ItemId;
}
export function generateUniqueMenuComboId() {
  let comboId = parseInt(localStorage.getItem("comboId"), 10) || 0;
  comboId += 1;
  localStorage.setItem("comboId", comboId);
  return comboId;
}
export function generateUniqueMenuOrderId() {
  let orderId = parseInt(localStorage.getItem("orderId"), 10) || 0;
  orderId += 1;
  localStorage.setItem("orderId", orderId);
  return orderId;
}
export function generateUserCustomerId() {
  let customer_id = parseInt(localStorage.getItem("customer_id"), 10) || 0;
  customer_id += 1;
  localStorage.setItem("customer_id", customer_id);
  return customer_id;
}
