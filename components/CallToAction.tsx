import React from "react";

const CallToAction = () => {
  return (
    <section className="px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl border border-cardCB/60 bg-cardC/10 px-6 py-16 text-center sm:px-10 md:py-20">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:42px_42px] opacity-30" />
          <div className="pointer-events-none absolute inset-x-0 bottom-[-90px] h-48 bg-primaryC/10 blur-2xl" />
        

          <div className="relative z-10 mx-auto max-w-3xl">
            

            <h2 className="mt-6 text-2xl md:text-4xl font-semibold tracking-tighter text-white sm:text-5xl md:text-[58px] md:leading-[1.08]">
            Start with clarity. Finish with confidence.
            </h2>

            <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-white/70 sm:text-base">
            Create a workspace, align on the work, and get paid securely without the back and forth.
            </p>

            <button
              type="button"
              className="mt-8 inline-flex items-center justify-center rounded-lg  px-6 py-3 text-sm font-semibold text-white  transition-all duration-200 butt"
            >
              Create Your Workspace
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;