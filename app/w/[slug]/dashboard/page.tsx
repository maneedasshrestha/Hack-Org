import React from "react";

type Props = {
  params: { slug: string };
};

export default function DashboardPage({ params }: Props) {
  const { slug } = params;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard for {slug}</h1>
      <p className="mt-4 text-gray-600">Welcome to your workspace dashboard.</p>
    </div>
  );
}
