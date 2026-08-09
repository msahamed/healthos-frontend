import Link from "next/link";
import { withEmail } from "../_lib/query";

// "← All platforms" breadcrumb on every platform page, forwarding the
// invite email back to the chooser so a visitor bouncing between tiles
// never has to re-supply it.
export default function BackLink({ email }: { email: string | null }) {
  return (
    <div className="inst-crumb">
      <Link href={withEmail("/install", email)}>&larr; All platforms</Link>
    </div>
  );
}
