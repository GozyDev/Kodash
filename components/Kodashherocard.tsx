'use client'

import { useEffect, useRef, useState, useCallback } from "react";

const CYCLE_MS = 3600;
const COMET_W = 25;
const THRESHOLDS = [0, 50, 100];

type LitCallback = (index: number, on: boolean) => void;

type TimelineTrackProps = {
  onLit: LitCallback;
};

type StepDotProps = {
  index: number;
  lit: boolean;
};

type DashedTrackProps = {
  delay?: number;
};

/* ── keyframes Tailwind can't express ── */
const STYLES = `
  @keyframes beamH {
    from { background-position: -30% 0 }
    to   { background-position: 130% 0 }
  }
  @keyframes beamV {
    from { background-position: 0 -30% }
    to   { background-position: 0 130% }
  }
  @keyframes pulseGlow {
    0%,100% { opacity:.45; transform:translate(-50%,-50%) scale(1) }
    50%     { opacity:.9;  transform:translate(-50%,-50%) scale(1.15) }
  }
  @keyframes pingRing {
    0%   { transform:scale(1);   opacity:.6 }
    100% { transform:scale(1.75);opacity:0  }
  }
  @keyframes lockGlow {
    0%,100% { opacity:.45 }
    50%     { opacity:1   }
  }
`;

/* ────────────────────────────────────────
   Animated beam borders
──────────────────────────────────────── */
function BeamBorders() {
  const hStyle = (delay: string) => ({
    backgroundImage: "linear-gradient(90deg,transparent,rgba(34,197,94,.9),transparent)",
    backgroundSize: "30% 100%",
    backgroundRepeat: "no-repeat",
    animation: `beamH 4s linear ${delay} infinite`,
  });
  const vStyle = (delay: string) => ({
    backgroundImage: "linear-gradient(180deg,transparent,rgba(34,197,94,.8),transparent)",
    backgroundSize: "100% 30%",
    backgroundRepeat: "no-repeat",
    animation: `beamV 4s linear ${delay} infinite`,
  });
  return (
    <>
      <span className="absolute inset-x-0 top-0 h-px pointer-events-none z-10" style={hStyle("0s")} />
      <span className="absolute inset-x-0 bottom-0 h-px pointer-events-none z-10" style={hStyle("2s")} />
      <span className="absolute inset-y-0 left-0 w-px pointer-events-none z-10" style={vStyle("1s")} />
      <span className="absolute inset-y-0 right-0 w-px pointer-events-none z-10" style={vStyle("3s")} />
    </>
  );
}

/* ────────────────────────────────────────
   Matrix rain canvas
──────────────────────────────────────── */
function MatrixCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = 80;
    const cols = Math.floor(canvas.width / 20);
    const cells = Array.from({ length: cols * 4 }, (_, i) => ({
      x: (i % cols) * 20,
      y: Math.floor(i / cols) * 20 + 2,
      phase: Math.random() * Math.PI * 2,
      ch: Math.random() > 0.5 ? "1" : "0",
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = Date.now() / 1000;
      cells.forEach((c) => {
        const op = ((Math.sin(t * 0.8 + c.phase) + 1) / 2) * 0.55;
        ctx.fillStyle = `rgba(34,197,94,${op.toFixed(2)})`;
        ctx.font = "10px monospace";
        if (Math.random() > 0.98) c.ch = Math.random() > 0.5 ? "1" : "0";
        ctx.fillText(c.ch, c.x, c.y + 14);
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas
      ref={ref}
      className="absolute top-0 left-0 w-full pointer-events-none z-0"
      style={{ height: 80, opacity: 0.35 }}
    />
  );
}

/* ────────────────────────────────────────
   Dashed track with looping comet
──────────────────────────────────────── */
function DashedTrack({ delay = 0 }: DashedTrackProps) {
  const cometRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf: number;
    const DURATION = 2800;
    const startTime = performance.now() - delay;
    const animate = (ts: number) => {
      const elapsed = (ts - startTime) % DURATION;
      const pos = (elapsed / DURATION) * 140 - 40;
      if (cometRef.current) cometRef.current.style.left = pos + "%";
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [delay]);

  return (
    <div className="flex-1 relative flex items-center mx-2.5" style={{ height: 20 }}>
      {/* static dashed base */}
      <div
        className="absolute inset-x-0"
        style={{
          height: 1,
          background:
            "repeating-linear-gradient(90deg,rgba(255,255,255,.13) 0px,rgba(255,255,255,.13) 6px,transparent 6px,transparent 14px)",
        }}
      />
      {/* comet */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          ref={cometRef}
          className="absolute rounded-full"
          style={{
            top: "50%",
            transform: "translateY(-50%)",
            height: 3,
            width: "40%",
            background:
              "linear-gradient(90deg,transparent,rgba(34,197,94,.7),rgba(134,239,172,1),transparent)",
            boxShadow: "0 0 8px 2px rgba(34,197,94,.4)",
          }}
        />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────
   Step dot — three states + lit/dim
──────────────────────────────────────── */
function StepDot({ index, lit }: StepDotProps) {
  /* Funded */
  if (index === 0) {
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-zinc-950 transition-all duration-500"
        style={{
          background: "linear-gradient(135deg,#22c55e,#15803d)",
          boxShadow: lit
            ? "0 0 22px rgba(34,197,94,.85)"
            : "0 0 12px rgba(34,197,94,.35)",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#09090b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
    );
  }

  /* In Progress */
  if (index === 1) {
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative border-[3px] border-green-400 transition-all duration-500"
        style={{
          background: "#09090b",
          boxShadow: lit
            ? "0 0 22px rgba(74,222,128,.8)"
            : "0 0 14px rgba(74,222,128,.35)",
        }}
      >
        <span
          className="absolute rounded-full border-2 border-green-400/40"
          style={{ inset: -4, animation: "pingRing 1.5s ease-out infinite" }}
        />
        <span
          className="w-2.5 h-2.5 rounded-full bg-green-300"
          style={{ boxShadow: "0 0 8px rgba(134,239,172,.9)" }}
        />
      </div>
    );
  }

  /* Payout */
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500"
      style={{
        background: "#18181b",
        border: lit
          ? "2px solid rgba(34,197,94,.5)"
          : "2px solid rgba(34,197,94,.15)",
        color: lit ? "rgba(34,197,94,.75)" : "rgba(34,197,94,.3)",
        boxShadow: lit ? "0 0 16px rgba(34,197,94,.35)" : "none",
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <path d="M2 10h20" />
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────
   Timeline track + traveling comet
──────────────────────────────────────── */
function TimelineTrack({ onLit }: TimelineTrackProps) {
  const cometRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<number | null>(null);
  const resetSched = useRef(false);

  useEffect(() => {
    let raf: number;
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed  = (ts - startRef.current) % CYCLE_MS;
      const rawPos   = (elapsed / CYCLE_MS) * (100 + COMET_W) - COMET_W;

      if (cometRef.current) cometRef.current.style.left = rawPos + "%";

      const center = rawPos + COMET_W / 2;
      THRESHOLDS.forEach((thresh, i) => {
        if (center >= thresh) onLit(i, true);
      });

      if (rawPos + COMET_W >= 100 + COMET_W - 2 && !resetSched.current) {
        resetSched.current = true;
        setTimeout(() => {
          onLit(-1, false);
          startRef.current = null;
          resetSched.current = false;
        }, 300);
      }

      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [onLit]);

  return (
    /* grey rail */
    <div
      className="absolute rounded-full overflow-hidden"
      style={{
        top: 15,
        left: 30,
        right: 30,
        height: 2,
        background: "rgba(39,39,42,.9)",
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          ref={cometRef}
          className="absolute top-0 h-full rounded-sm"
          style={{
            width: COMET_W + "%",
            background:
              "linear-gradient(90deg,transparent,rgba(34,197,94,.85),rgba(200,255,200,1),transparent)",
            boxShadow: "0 0 6px 2px rgba(34,197,94,.55)",
          }}
        />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────
   Main export
──────────────────────────────────────── */
export default function KodashHeroCard() {
  const [litState, setLitState] = useState([false, false, false]);

  const handleLit = useCallback<LitCallback>((index, on) => {
    if (index === -1) {
      setLitState([false, false, false]);
    } else {
      setLitState((prev) => {
        if (prev[index] === on) return prev;
        const next = [...prev];
        next[index] = on;
        return next;
      });
    }
  }, []);

  const steps = [
    { label: "Funded",      sub: "10:42 AM" },
    { label: "In Progress", sub: "Awaiting"  },
    { label: "Payout",      sub: "Pending"   },
  ];

  return (
    <div
      className="flex items-center justify-center mt-12"
    //   style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <style>{STYLES}</style>

      <div className="relative w-full max-w-5xl">
        {/* ambient radial glow */}
        {/* <div
          className="absolute pointer-events-none"
          style={{
            inset: -80,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at 50% 40%,rgba(34,197,94,.15) 0%,transparent 70%)",
          }}
        /> }

        {/* ── card shell ── */}
        <div className="relative rounded-[22px] border border-cardC overflow-hidden bg-black/60">
          <MatrixCanvas />
          <BeamBorders />

          {/* title bar */}
          <div className="relative z-[2] flex items-center justify-between px-6 py-3 border-b border-cardC bg-cardC/60">
            <div className="flex gap-[7px]">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-white/10" />
              ))}
            </div>

            <div
              className="flex items-center gap-1.5 text-[11px] text-green-300 bg-green-500/[0.08] border border-green-500/25 rounded-full px-[13px] py-[5px]"
              style={{ boxShadow: "0 0 16px rgba(34,197,94,.1)" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              Secured Escrow Contract
            </div>

            <div className="text-zinc-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
              </svg>
            </div>
          </div>

          {/* body */}
          <div className="relative z-[1] p-6 md:p-12 md:pb-12 ">

            {/* ── escrow transfer box ── */}
            <div className="relative rounded-[18px] border border-cardCB px-5 py-8 overflow-hidden bg-cardC/40">
              {/* centre pulse */}
              <div
                className="absolute pointer-events-none"
                style={{
                  top: "50%", left: "50%",
                  width: 260, height: 260, borderRadius: "50%",
                  background: "rgba(34,197,94,.1)", filter: "blur(60px)",
                  animation: "pulseGlow 3s ease-in-out infinite",
                }}
              />

              <div className="relative z-[2] flex md:flex-row flex-col gap-5 items-center justify-between">

                {/* TechFlow */}
                <div className="flex flex-col items-center gap-2.5 min-w-[88px]">
                  <div className="w-[50px] h-[50px] rounded-[13px] border border-white/[0.12] bg-zinc-800/75 flex items-center justify-center text-zinc-400">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
                      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
                      <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-zinc-100 tracking-tight">TechFlow Inc.</p>
                    <p className="text-[9px] text-zinc-500 tracking-[0.12em] uppercase mt-[3px]">Client (Depositor)</p>
                  </div>
                </div>

                {/* left dashed comet track */}
                <DashedTrack delay={0} />

                {/* lock pill */}
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="flex items-center gap-2.5 bg-zinc-950/90 border border-green-500/30 rounded-full px-5 py-[9px]"
                    style={{ boxShadow: "0 0 28px rgba(34,197,94,.2),inset 0 1px 1px rgba(255,255,255,.06)" }}
                  >
                    <div className="relative text-green-300">
                      <div
                        className="absolute inset-[-4px] rounded-full bg-green-300/25 blur"
                        style={{ animation: "lockGlow 2s ease-in-out infinite" }}
                      />
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <span className="text-base text-white tracking-tight">$4,500.00</span>
                  </div>
                  <div className="text-[9px] tracking-[0.14em] uppercase text-green-300 bg-green-500/[0.08] border border-green-500/[0.18] rounded-full px-3 py-1">
                    Funds Locked
                  </div>
                </div>

                {/* right dashed comet track */}
                <DashedTrack delay={1400} />

                {/* Elena M. */}
                <div className="flex flex-col items-center gap-2.5 min-w-[88px]">
                  <div className="w-[50px] h-[50px] rounded-[13px] border border-white/[0.12] bg-zinc-800/75 flex items-center justify-center text-zinc-400">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-zinc-100 tracking-tight">Elena M.</p>
                    <p className="text-[9px] text-zinc-500 tracking-[0.12em] uppercase mt-[3px]">Freelancer (Payee)</p>
                  </div>
                </div>

              </div>
            </div>

            {/* ── progress timeline ── */}
            <div className="relative mt-12 px-4">
              <TimelineTrack onLit={handleLit} />

              <div className="flex justify-between relative z-[2]">
                {steps.map((step, i) => (
                  <div key={step.label} className="flex flex-col items-center gap-2.5 w-[72px]">
                    <StepDot index={i} lit={litState[i]} />
                    <div className="text-center">
                      <p
                        className="text-[11px] font-medium tracking-tight transition-all duration-500"
                        style={{
                          color: litState[i]
                            ? i === 1 ? "#86efac" : "#e4e4e7"
                            : "#52525b",
                          textShadow:
                            litState[i] && i === 1
                              ? "0 0 8px rgba(34,197,94,.5)"
                              : "none",
                        }}
                      >
                        {step.label}
                      </p>
                      <p
                        className="text-[9px] uppercase tracking-[0.1em] mt-[3px] transition-colors duration-500"
                        style={{ color: litState[i] ? "#52525b" : "#3f3f46" }}
                      >
                        {step.sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}