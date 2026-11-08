"use client";

import { useCallback, useRef, type PointerEvent } from "react";
import Link from "next/link";

export default function AuthVisual() {
  const visualRef = useRef<HTMLElement | null>(null);

  const resetPointer = useCallback(() => {
    const visual = visualRef.current;
    if (!visual) return;
    visual.style.setProperty("--glass-one-x", "0px");
    visual.style.setProperty("--glass-one-y", "0px");
    visual.style.setProperty("--glass-two-x", "0px");
    visual.style.setProperty("--glass-two-y", "0px");
  }, []);

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;
    const visual = visualRef.current;
    if (!visual) return;

    const bounds = visual.getBoundingClientRect();
    const horizontal = (event.clientX - (bounds.left + bounds.width / 2)) / bounds.width;
    const vertical = (event.clientY - (bounds.top + bounds.height / 2)) / bounds.height;

    visual.style.setProperty("--glass-one-x", `${horizontal * 24}px`);
    visual.style.setProperty("--glass-one-y", `${vertical * 18}px`);
    visual.style.setProperty("--glass-two-x", `${horizontal * -14}px`);
    visual.style.setProperty("--glass-two-y", `${vertical * -11}px`);
  }

  return (
    <aside ref={visualRef} className="auth-visual" aria-label="Postproof sign-in visual" onPointerMove={handlePointerMove} onPointerLeave={resetPointer}>
      <div className="auth-visual-top" aria-hidden="true">
        <span>POSTPROOF / STUDIO</span>
        <span>01 — 04</span>
      </div>
      <div className="auth-visual-image">
        <Link href="/" className="auth-visual-brand" aria-label="Postproof home">
          <span>Post</span><span className="auth-visual-brand-proof">proof</span>
        </Link>
        <span className="auth-visual-glass auth-visual-glass-one" aria-hidden="true" />
        <span className="auth-visual-glass auth-visual-glass-two" aria-hidden="true" />
        <span className="auth-visual-orbit" aria-hidden="true" />
        <span className="auth-visual-orb" aria-hidden="true" />
        <div className="auth-visual-note" aria-hidden="true">
          <span>THE GOOD WORDS</span>
          <strong>Stay close.</strong>
        </div>
      </div>
      <div className="auth-visual-footer" aria-hidden="true">
        <span>Collect. Curate. Share.</span>
        <span>© 2024</span>
      </div>
    </aside>
  );
}
