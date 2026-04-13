import React from 'react';
import { FiCheck, FiX } from 'react-icons/fi';

const ComparisonTable = () => {
  const features = [
    "Expert-guided formulation",
    "Well-cured and consistently processed",
    "Easy to mix fine texture",
    "Suitable for pots, beds, and terrace gardens",
    "Beginner-friendly usage guidance",
    "Supports soil structure and microbial activity",
    "Balanced for everyday home gardening",
    "Designed for Indian growing conditions",
    "Backed by plant care expertise"
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 shadow-sm bg-white">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-forest-900 text-white">
            <th className="py-5 px-6 font-display font-bold text-lg">Key Features</th>
            <th className="py-5 px-6 text-center">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl font-display font-bold">Poshatva</span>
                <span className="text-[10px] uppercase tracking-widest opacity-70">Our Brand</span>
              </div>
            </th>
            <th className="py-5 px-6 text-center">
              <div className="flex flex-col items-center gap-1 opacity-60">
                <span className="text-xl font-display font-bold">Other</span>
                <span className="text-[10px] uppercase tracking-widest opacity-70">Typical Brands</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {features.map((feature, idx) => (
            <tr key={idx} className="hover:bg-forest-50/30 transition-colors">
              <td className="py-4 px-6 text-sm font-medium text-gray-700">{feature}</td>
              <td className="py-4 px-6 text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-forest-100 text-forest-600 shadow-sm">
                  <FiCheck strokeWidth={3} />
                </div>
              </td>
              <td className="py-4 px-6 text-center">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400">
                  <FiX strokeWidth={3} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
