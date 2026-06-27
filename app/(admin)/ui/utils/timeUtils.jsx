import React from "react";

export const convertFromUTC = () => {
    const utcDate = new Date();
    const localTimeString = utcDate.toLocaleTimeString();
    return localTimeString;
  };
  export const getTimeDifference = (utcTime) => {
    // Convert the backend UTC time to a Date object
    const backendTime = new Date(utcTime);
  
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
  
  export function lastUpdatedAtDateToUTC() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    const hours = String(now.getUTCHours()).padStart(2, "0");
    const minutes = String(now.getUTCMinutes()).padStart(2, "0");
    const seconds = String(now.getUTCSeconds()).padStart(2, "0");
  
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
  }
  
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

  export const formatUTCToLocal = (utcTimeStr, addDays = 0) => {
    if (!utcTimeStr) return "-";
    const utcString = utcTimeStr.includes("Z") || utcTimeStr.includes("T")
      ? utcTimeStr
      : `${utcTimeStr.replace(" ", "T")}Z`;
    const date = new Date(utcString);
    if (isNaN(date.getTime())) return utcTimeStr;
    
    if (addDays) {
      date.setDate(date.getDate() + Number(addDays));
    }
    
    return date.toLocaleString(undefined, { hour12: true });
  };

  export const FormattedDate = ({ value, addDays = 0 }) => {
    if (!value) return <span>-</span>;
    const utcString = value.includes("Z") || value.includes("T")
      ? value
      : `${value.replace(" ", "T")}Z`;
    const date = new Date(utcString);
    if (isNaN(date.getTime())) return <span>{value}</span>;
    
    if (addDays) {
      date.setDate(date.getDate() + Number(addDays));
    }
    
    const formattedStr = date.toLocaleString(undefined, { hour12: true });
    
    // Split on first space after comma, or just standard space
    const parts = formattedStr.split(", ");
    if (parts.length === 2) {
      const [datePart, timePart] = parts;
      return (
        <span style={{ display: "inline-block", verticalAlign: "middle" }}>
          <span style={{ whiteSpace: "nowrap" }}>{datePart},</span>{" "}
          <span style={{ whiteSpace: "nowrap" }}>{timePart}</span>
        </span>
      );
    }
    
    return <span>{formattedStr}</span>;
  };