import React from 'react';
import { INITIAL_PRODUCTS } from '../data/defaultData';
import { Layers, CheckCircle2, ArrowRight, Monitor, Users, ShieldAlert, Sparkles } from 'lucide-react';

export const SaaSShowcase = ({
  products = INITIAL_PRODUCTS,
  onRequestDemo,
  onTalkTeam,
  onOpenRequirement,
  onOpenConsultation
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const displayProducts = products && products.length > 0 ? products : INITIAL_PRODUCTS;

  const saasCategories = ['All', 'Campus ERP', 'Workforce & HRMS', 'Biometric Attendance', 'Workflow Automation', 'Any Custom Type'];

  const filteredProducts = selectedCategory === 'All' || selectedCategory === 'Any Custom Type'
    ? displayProducts
    : displayProducts.filter(p => p.category.toLowerCase().includes(selectedCategory.toLowerCase()) || p.tag.toLowerCase().includes(selectedCategory.toLowerCase()));

  const handleDemoClick = (name) => {
    if (onRequestDemo) onRequestDemo(name);
    else if (onOpenRequirement) onOpenRequirement({ productName: name });
  };
  const handleTalkClick = () => {
    if (onTalkTeam) onTalkTeam();
    else if (onOpenConsultation) onOpenConsultation();
  };

  return (
    <section id="saas" className="py-24 relative bg-slate-950/80 border-t border-white/5">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Proprietary Enterprise Software Portfolio</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
            SaaS Platforms & <span className="text-gradient">Products</span>
          </h2>

          <p className="text-slate-300 text-base sm:text-lg">
            Purpose-built enterprise platforms engineered by Sakith Harvan Technologies to solve real institutional, workforce, and automation challenges.
          </p>
        </div>

        {/* Category Tabs for SaaS Products */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {saasCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-bold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="space-y-12">
          {filteredProducts.map((product, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={product.id}
                className="glass-card p-6 sm:p-10 rounded-3xl border border-white/10 relative overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Product Copy Column */}
                  <div className={`lg:col-span-7 space-y-6 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-3.5 py-1 rounded-full bg-blue-600/20 text-blue-400 text-xs font-bold border border-blue-500/30">
                        {product.category}
                      </span>
                      <span className="px-3.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-white/10">
                        {product.tag}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                      {product.name}
                    </h3>

                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                      {product.shortDescription}
                    </p>

                    {/* Problem Statement Box */}
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/20 flex gap-3 items-start">
                      <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Problem It Solves</h4>
                        <p className="text-xs text-slate-300 mt-1">{product.problem}</p>
                      </div>
                    </div>

                    {/* Key Features List */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Features:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {product.keyFeatures.map((feature, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Target Users & Benefits */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                      <div>
                        <div className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-blue-400" /> Target Users
                        </div>
                        <p className="text-xs text-slate-200 mt-1 font-medium">{product.targetUsers}</p>
                      </div>

                      <div>
                        <div className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1">
                          <Monitor className="w-3.5 h-3.5 text-cyan-400" /> Business Benefit
                        </div>
                        <p className="text-xs text-slate-200 mt-1 font-medium">{product.benefits}</p>
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-wrap gap-4 pt-4">
                      <button
                        onClick={() => handleDemoClick(product.name)}
                        className="btn-primary text-xs py-3 px-6"
                      >
                        <span>Request a Demo</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={handleTalkClick}
                        className="btn-secondary text-xs py-3 px-6"
                      >
                        <span>Talk to Our Team</span>
                      </button>
                    </div>
                  </div>

                  {/* Product Mockup Visual Column */}
                  <div className={`lg:col-span-5 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div className="bg-slate-900 rounded-2xl border border-white/10 p-5 space-y-4 glow-blue">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        </div>
                        <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                          {product.name.split(' ')[0]} DEMO CONSOLE
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950 border border-white/5 space-y-3">
                        <div className="flex justify-between items-center text-xs text-slate-400">
                          <span>SYSTEM STATUS</span>
                          <span className="text-emerald-400 font-mono">OPERATIONAL</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 w-3/4 rounded-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                          <div className="p-2 bg-slate-900 rounded-lg">
                            <div className="text-[10px] text-slate-400">Active Workflows</div>
                            <div className="font-bold text-white mt-0.5">Automated</div>
                          </div>
                          <div className="p-2 bg-slate-900 rounded-lg">
                            <div className="text-[10px] text-slate-400">Security</div>
                            <div className="font-bold text-cyan-400 mt-0.5">Role-Based</div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <span className="text-[11px] text-slate-400 italic">
                          Custom deployment &amp; API integration available for this SaaS product.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
