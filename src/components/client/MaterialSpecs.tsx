import React from 'react';
import { motion } from 'motion/react';
import { 
  FileCode, 
  ChevronDown
} from 'lucide-react';
import { MATERIAL_CAPABILITIES, FAQ_ITEMS } from '../../data/materialsData';
import { SiteSettings } from '../../types';
import { buildWhatsAppLink } from '../../utils/whatsapp';
import { SectionHeading } from '../common/SectionHeading';

interface MaterialSpecsProps {
  settings: SiteSettings;
}

export const MaterialSpecs: React.FC<MaterialSpecsProps> = ({ settings }) => {
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);

  return (
    <section
      id="capabilities"
      className={`py-16 md:py-24 transition-colors duration-300 border-b ${
        'bg-zinc-50 text-zinc-900 border-zinc-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 space-y-16">
        
        {/* Section 1: Technical Material Capabilities Table */}
        <div className="space-y-6">
          <SectionHeading
            badge="Technical Capacities"
            title="Laser Cutting Material Matrix"
            subtitle="Our multi-kW CNC fiber laser and gas assistance cutting matrix for stainless steel, mild steel, aluminum, brass, and acrylic."
            themeMode={settings.themeMode}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className={`border rounded-2xl overflow-hidden shadow-xl ${
              'bg-white border-zinc-200'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className={`font-mono text-xs uppercase border-b ${
                  'bg-zinc-100 text-amber-900 font-extrabold border-zinc-200'
                }`}>
                  <tr>
                    <th className="py-3.5 px-4">Material Grade</th>
                    <th className="py-3.5 px-4">Max Thickness</th>
                    <th className="py-3.5 px-4">Assist Gas</th>
                    <th className="py-3.5 px-4 hidden md:table-cell">Typical Applications</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${
                  'divide-zinc-200 text-zinc-700'
                }`}>
                  {MATERIAL_CAPABILITIES.map((mat, idx) => (
                    <tr key={idx} className={'hover:bg-zinc-50'}>
                      <td className={`py-3.5 px-4 font-bold flex items-center gap-2 text-zinc-900`}>
                        <span className={`w-2 h-2 rounded-full shrink-0 bg-amber-700`} />
                        {mat.material}
                      </td>
                      <td className={`py-3.5 px-4 font-mono font-bold text-amber-900 font-extrabold`}>
                        {mat.maxThickness}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {mat.assistGas || mat.gasType}
                      </td>
                      <td className={`py-3.5 px-4 hidden md:table-cell text-xs text-zinc-500`}>
                        {mat.applications || mat.keyApplications}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Section 2: Laser Optics & Consumables Care Guidelines */}
        <div className="border rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl bg-amber-500/10 border-amber-300 text-zinc-900">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className={`text-xs font-mono font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                'text-amber-900'
              }`}>
                <FileCode className={`w-4 h-4 text-amber-800`} />
                TECHNICAL GUIDELINES FOR LASER OPERATORS
              </span>
              <h3 className={`text-xl font-bold text-zinc-900`}>
                Optics Care & Nozzle Maintenance Best Practices
              </h3>
            </div>

            <a
              href={buildWhatsAppLink(
                settings.whatsappNumber,
                `Hello NK Laser! I need technical guidance on selecting the right laser spares or optics replacement.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shrink-0 cursor-pointer shadow-md"
            >
              <span>Get Spares Guidance on WhatsApp</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className={`p-4 rounded-2xl border space-y-1 ${
              'bg-white border-zinc-200 shadow-sm'
            }`}>
              <div className={`font-extrabold text-xs text-amber-900`}>1. Dust-Free Lens Handling</div>
              <p className={`text-xs text-zinc-600`}>
                Always replace protective windows in a clean enclosure using powder-free finger cots and optical lens tissue with high-purity IPA.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border space-y-1 ${
              'bg-white border-zinc-200 shadow-sm'
            }`}>
              <div className={`font-extrabold text-xs text-amber-900`}>2. Regular Nozzle Centering</div>
              <p className={`text-xs text-zinc-600`}>
                Perform tape beam tests regularly to verify that the laser beam is concentric with the nozzle aperture to avoid edge slag and overheating.
              </p>
            </div>

            <div className={`p-4 rounded-2xl border space-y-1 ${
              'bg-white border-zinc-200 shadow-sm'
            }`}>
              <div className={`font-extrabold text-xs text-amber-900`}>3. Single vs. Double Nozzle</div>
              <p className={`text-xs text-zinc-600`}>
                Use Single layer nozzles for high-pressure Nitrogen cutting (SS/Aluminium) and Double layer nozzles with Oxygen assist for carbon steel.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Frequently Asked Questions (FAQ) */}
        <div className="space-y-6">
          <SectionHeading
            badge="Client FAQ"
            title="Laser Spares & Ordering FAQ"
            subtitle="Got questions about compatibility, delivery times, optical quality or bulk orders? Check answers below."
            themeMode={settings.themeMode}
          />

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`border rounded-2xl overflow-hidden transition-colors ${
                    'bg-white border-zinc-200'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className={`w-full flex items-center justify-between p-4 text-left font-bold text-sm cursor-pointer transition-colors ${
                      'text-zinc-900 hover:text-amber-600'
                    }`}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className={`px-4 pb-4 text-xs leading-relaxed border-t pt-3 ${
                      'text-zinc-600 border-zinc-100'
                    }`}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

