import React from 'react';
import { Settings, ShieldCheck, HeadphonesIcon, Rocket, CheckCircle2 } from 'lucide-react';
import { SiteSettings } from '../../types';

interface ServiceShowcaseProps {
  settings: SiteSettings;
}

export const ServiceShowcase: React.FC<ServiceShowcaseProps> = ({ settings }) => {
  return (
    <section className="py-16 lg:py-24 border-b border-[var(--border)] bg-[var(--background)] transition-colors duration-300 space-y-16 lg:space-y-24">
      
      {/* 06 - WHY NKL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <div className="w-full lg:w-5/12 space-y-4">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--primary)]">
              Why NKL?
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--text-primary)] leading-tight">
              Precision-focused sourcing for industrial laser components.
            </h2>
          </div>
          <div className="w-full lg:w-7/12">
            <div className="flex flex-col gap-6 lg:gap-8">
              
              <div className="flex gap-4">
                <div className="font-mono font-black text-2xl text-[var(--primary)] opacity-50">01</div>
                <div>
                  <h4 className="text-lg font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
                    Quality Components <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Direct imports of OEM-certified parts ensuring maximum lifespan and compatibility.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="font-mono font-black text-2xl text-[var(--primary)] opacity-50">02</div>
                <div>
                  <h4 className="text-lg font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
                    Reliable Supply <Rocket className="w-4 h-4 text-[var(--primary)]" />
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Extensive inventory maintained in India for rapid dispatch and minimizing machine downtime.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="font-mono font-black text-2xl text-[var(--primary)] opacity-50">03</div>
                <div>
                  <h4 className="text-lg font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
                    Product Support <Settings className="w-4 h-4 text-[var(--primary)]" />
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Technical guidance on part compatibility, machine specifications, and troubleshooting.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="font-mono font-black text-2xl text-[var(--primary)] opacity-50">04</div>
                <div>
                  <h4 className="text-lg font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
                    Easy Enquiry <HeadphonesIcon className="w-4 h-4 text-[var(--primary)]" />
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Seamless quoting process with instant WhatsApp connectivity and straightforward part sourcing.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* 07 - APPLICATIONS (Horizontal Strip) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-b border-[var(--border)] py-6 lg:py-8">
           <div className="flex flex-col md:flex-row items-center gap-6">
              <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--text-secondary)] shrink-0">
                Core Applications
              </span>
              <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                {['Laser Cutting', 'Metal Fabrication', 'Engineering', 'Manufacturing', 'Sheet Metal', 'Laser Processing'].map((app, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-secondary)] text-[11px] font-bold text-[var(--text-primary)] uppercase tracking-wider">
                    {app}
                  </span>
                ))}
              </div>
           </div>
        </div>
      </div>

      {/* 08 - HOW TO SOURCE (Visual Timeline) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8 lg:space-y-12">
          <div className="text-center">
             <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--primary)]">
              How It Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] mt-2">
              FIND. ENQUIRE. SOURCE.
            </h2>
          </div>

          <div className="relative">
            {/* Desktop Timeline Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[1px] bg-[var(--border)] -translate-y-1/2 z-0"></div>

            <div className="flex flex-col lg:flex-row justify-between gap-8 lg:gap-0 relative z-10">
              
              <div className="flex flex-row lg:flex-col items-center lg:items-start gap-4 lg:gap-2 bg-[var(--background)] lg:pr-8">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--primary-contrast)] flex items-center justify-center font-bold text-sm shrink-0">
                  01
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider">Find Product</h4>
                  <p className="text-xs text-[var(--text-secondary)] hidden lg:block mt-1">Browse our extensive parts catalog.</p>
                </div>
              </div>

              {/* Mobile connector */}
              <div className="lg:hidden w-[1px] h-6 bg-[var(--border)] ml-4 my-[-16px]"></div>

              <div className="flex flex-row lg:flex-col items-center lg:items-start gap-4 lg:gap-2 bg-[var(--background)] lg:px-8">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--primary-contrast)] flex items-center justify-center font-bold text-sm shrink-0">
                  02
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider">Send Requirement</h4>
                  <p className="text-xs text-[var(--text-secondary)] hidden lg:block mt-1">Share your machine specifications.</p>
                </div>
              </div>

              {/* Mobile connector */}
              <div className="lg:hidden w-[1px] h-6 bg-[var(--border)] ml-4 my-[-16px]"></div>

              <div className="flex flex-row lg:flex-col items-center lg:items-start gap-4 lg:gap-2 bg-[var(--background)] lg:px-8">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--primary-contrast)] flex items-center justify-center font-bold text-sm shrink-0">
                  03
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider">Confirm Specs</h4>
                  <p className="text-xs text-[var(--text-secondary)] hidden lg:block mt-1">Our technical team verifies compatibility.</p>
                </div>
              </div>

               {/* Mobile connector */}
               <div className="lg:hidden w-[1px] h-6 bg-[var(--border)] ml-4 my-[-16px]"></div>

              <div className="flex flex-row lg:flex-col items-center lg:items-start gap-4 lg:gap-2 bg-[var(--background)] lg:pl-8">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--primary-contrast)] flex items-center justify-center font-bold text-sm shrink-0">
                  04
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider">Get Quote</h4>
                  <p className="text-xs text-[var(--text-secondary)] hidden lg:block mt-1">Receive technical quotation and dispatch details instantly.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

    </section>
  );
};
