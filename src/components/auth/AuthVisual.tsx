"use client";

import { useCallback, useRef, type PointerEvent } from "react";

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
    <aside ref={visualRef} className="auth-visual" aria-hidden="true" onPointerMove={handlePointerMove} onPointerLeave={resetPointer}>
      <div className="auth-visual-top">
        <span>POSTPROOF / STUDIO</span>
        <span>01 — 04</span>
      </div>
      <div className="auth-visual-image">
        <span className="auth-visual-glass auth-visual-glass-one" />
        <span className="auth-visual-glass auth-visual-glass-two" />
        <span className="auth-visual-orbit" />
        <span className="auth-visual-orb" />
        <div className="auth-visual-note">
          <span>THE GOOD WORDS</span>
          <strong>Stay close.</strong>
        </div>
      </div>
      <div className="auth-visual-footer">
        <span>Collect. Curate. Share.</span>
        <span>© 2024</span>
      </div>
    </aside>
  );
}
