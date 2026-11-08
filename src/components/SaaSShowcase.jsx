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
    <section id="saas" className="py-24 relative bg-slate-50 border-t border-slate-200/80">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Proprietary Enterprise Software Portfolio</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900">
            SaaS Platforms &amp; <span className="text-gradient">Products</span>
          </h2>

          <p className="text-slate-600 text-base sm:text-lg">
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
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-bold'
                  : 'bg-white text-slate-600 hover:text-blue-600 hover:bg-slate-50 border border-slate-200 shadow-sm'
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
                className="glass-card p-6 sm:p-10 rounded-3xl border border-slate-200/80 relative overflow-hidden shadow-sm hover:shadow-md"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Product Copy Column */}
                  <div className={`lg:col-span-7 space-y-6 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                        {product.category}
                      </span>
                      <span className="px-3.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                        {product.tag}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      {product.name}
                    </h3>

                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      {product.shortDescription}
                    </p>

                    {/* Problem Statement Box */}
                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex gap-3 items-start">
                      <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">Problem It Solves</h4>
                        <p className="text-xs text-amber-900/80 mt-1">{product.problem}</p>
                      </div>
                    </div>

                    {/* Key Features List */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Features:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {product.keyFeatures.map((feature, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Target Users & Benefits */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                      <div>
                        <div className="text-[11px] uppercase font-bold text-slate-500 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-blue-600" /> Target Users
                        </div>
                        <p className="text-xs text-slate-800 mt-1 font-semibold">{product.targetUsers}</p>
                      </div>

                      <div>
                        <div className="text-[11px] uppercase font-bold text-slate-500 flex items-center gap-1">
                          <Monitor className="w-3.5 h-3.5 text-sky-600" /> Business Benefit
                        </div>
                        <p className="text-xs text-slate-800 mt-1 font-semibold">{product.benefits}</p>
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
                    <div className="bg-slate-50/90 rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        </div>
                        <span className="text-[10px] font-mono text-blue-700 font-semibold uppercase tracking-widest">
                          {product.name.split(' ')[0]} DEMO CONSOLE
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-3">
                        <div className="flex justify-between items-center text-xs text-slate-500">
                          <span>SYSTEM STATUS</span>
                          <span className="text-emerald-600 font-mono font-bold">OPERATIONAL</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-600 to-sky-400 w-3/4 rounded-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="text-[10px] text-slate-500">Active Workflows</div>
                            <div className="font-bold text-slate-900 mt-0.5">Automated</div>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="text-[10px] text-slate-500">API Response</div>
                            <div className="font-bold text-blue-600 mt-0.5">&lt; 120ms</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/80 text-xs text-slate-700 flex items-center justify-between">
                        <div className="font-medium">Ready for deployment?</div>
                        <button
                          onClick={() => handleDemoClick(product.name)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 underline"
                        >
                          Launch Sandbox &rarr;
                        </button>
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
