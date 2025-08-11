import { Loader2 } from "lucide-react";
import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-[300px] space-x-2">
      <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      <span className="text-sm text-violet-600">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
