import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { useState } from "react";

export function DownloadCvControl() {
  const [isPending] = useState(false);

  function handleDownload() {
    console.log("download cv");
  }

  return (
    <button
      className="btn btn-sm btn-soft"
      disabled={isPending}
      onClick={handleDownload}
      type="button"
    >
      <DownloadSimpleIcon />
      Download CV
    </button>
  );
}
