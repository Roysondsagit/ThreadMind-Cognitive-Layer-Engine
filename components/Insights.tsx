
import React from 'react';
import { Thread, Category } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Brain, Code, Utensils, Plane, Palette, HelpCircle } from 'lucide-react';

interface InsightsProps {
  threads: Thread[];
}

const Insights: React.FC<InsightsProps> = ({ threads }) => {
  const categoryCounts = threads.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

  const COLORS = {
    [Category.FITNESS]: '#f97316',
    [Category.CODING]: '#3b82f6',
    [Category.FOOD]: '#10b981',
    [Category.TRAVEL]: '#0ea5e9',
    [Category.DESIGN]: '#a855f7',
    [Category.OTHER]: '#64748b',
  };

  const getMetricIcon = (category: Category) => {
    switch (category) {
      case Category.FITNESS: return <Brain className="text-orange-500" size={24} />;
      case Category.CODING: return <Code className="text-blue-500" size={24} />;
      case Category.FOOD: return <Utensils className="text-emerald-500" size={24} />;
      case Category.TRAVEL: return <Plane className="text-sky-500" size={24} />;
      case Category.DESIGN: return <Palette className="text-purple-500" size={24} />;
      default: return <HelpCircle className="text-slate-500" size={24} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.values(Category).map(cat => (
          <div key={cat} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
            <div className="flex justify-between items-start mb-4">
              {getMetricIcon(cat)}
              <span className="text-2xl font-black text-slate-800 dark:text-white">{categoryCounts[cat] || 0}</span>
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">{cat}</h4>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
          <h3 className="text-xl font-black mb-8 text-slate-900 dark:text-white tracking-tight">Category Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name as Category]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tooltip-bg, #fff)', color: 'var(--tooltip-color, #0f172a)' }}
                  itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {Object.keys(COLORS).map(k => (
              <div key={k} className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[k as Category] }}></div>
                {k}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center text-center transition-colors duration-300">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-full mb-6">
            <Brain size={48} className="text-indigo-500" />
          </div>
          <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-white tracking-tight">Cognitive Load</h3>
          <p className="text-slate-400 font-bold max-w-xs">You've rescued {threads.length} ideas from the social void this month.</p>
        </div>
      </div>
    </div>
  );
};

export default Insights;
