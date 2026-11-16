import type { ReactNode } from "react";
import { AppHeader } from "../components/navigation/AppHeader";
import { useOpenSave } from "./SaveDialogContext";

/** One routed screen: desktop AppHeader + MobileTopBar + the page content column. */
interface PageProps {
  title: string;
  eyebrow?: string;
  mobileBar?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Page({ title, eyebrow, mobileBar, children, className = "" }: PageProps) {
  const openSave = useOpenSave();
  return (
    <>
      <div className="only-desktop">
        <AppHeader title={title} eyebrow={eyebrow} onSave={openSave} />
      </div>
      {mobileBar && <div className="only-mobile mobile-bar-slot">{mobileBar}</div>}
      <main id="main" className={`page ${className}`} tabIndex={-1}>
        <h1 className="visually-hidden">{title}</h1>
        {children}
      </main>
    </>
  );
}
