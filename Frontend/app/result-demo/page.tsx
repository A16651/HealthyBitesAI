"use client";

import React, { useEffect, useState } from 'react';
import ResultDetails from '../../components/ResultDetails';
import SkeletonLoader from '../../components/SkeletonLoader';
import { ResultData } from '../../components/types/result';

const sample: ResultData = {
  product_name: 'Crunchy Oat Bites',
  overall_verdict: 'Caution',
  summary: 'Processed snack with refined flour and added sugars. Consume occasionally.',
  health_risks: [
    { ingredient: 'Maida (Refined Wheat)', risk: 'High processing', health_impact: 'Can increase blood sugar spikes and lacks fiber.' },
    { ingredient: 'Added Sugar', risk: 'High', health_impact: 'Contributes to calorie surplus and diabetes risk when frequent.' },
  ],
  alerts: {
    maida_trap: { detected: true, explanation: 'Contains refined wheat (maida) which suggests heavily processed flour.' },
    sugar_trap: { detected: true, explanation: 'Product lists sugar and syrup high on the ingredients list.' },
    fake_marketing: { detected: false, explanation: '' },
  },
  marketing_traps: [
    { claim: 'Made with whole grains', reality: 'Only 5% whole grain; majority refined' },
  ],
  population_warnings: { children: 'Limit portions for toddlers', diabetics: 'Not suitable for diabetics' },
};

export default function DemoPage() {
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setData(sample);
      setLoading(false);
    }, 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="p-6">
      <h2 className="text-xl font-semibold mb-4">Result Details Demo</h2>
      <div className="max-w-3xl">
        {loading ? <SkeletonLoader /> : <ResultDetails data={data ?? undefined} />}
      </div>
    </main>
  );
}
