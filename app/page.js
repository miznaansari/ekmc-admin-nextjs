"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch (err) {
    return false;
  }
};

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (isTokenValid(token)) {
      router.replace("/dashboard/insights");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return null;
}
