import { Link } from "react-router";
import { SquarePen, Settings as SettingsIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export function AppHeader() {
  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-2">
        <Logo className="size-10 text-gray-500" />
        <h1 className="text-lg font-semibold">Conversations</h1>
      </div>
      <div className="flex gap-1">
        <Link to="/new" aria-label="New conversation" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <SquarePen />
        </Link>
        <Link to="/settings" aria-label="Settings" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <SettingsIcon />
        </Link>
      </div>
    </header>
  );
}
