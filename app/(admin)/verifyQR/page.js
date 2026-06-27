"use client";

import CameraQRScanner from "@/components/QrManagement/GenerateQR/CameraQRScanner";
import QRVerification from "@/components/QrManagement/GenerateQR/QRVerification";

export default function Page() {
  return (
    <>
      <CameraQRScanner />
      <QRVerification />
    </>
  );
}
