import { Spinner } from "@/components/ui/primitives";

export default function Loading() {
  return (
    <div className="grid min-h-dvh place-items-center bg-white">
      <Spinner label="Loading page" />
    </div>
  );
}
