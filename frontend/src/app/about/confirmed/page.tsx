import React, { Suspense } from "react";
import ClientConfirmed from "./ClientConfirmed";

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <ClientConfirmed />
    </Suspense>
  );
}