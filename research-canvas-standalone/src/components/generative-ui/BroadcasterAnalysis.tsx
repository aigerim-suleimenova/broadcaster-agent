"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "@/components/ui/bar-chart";
import { PieChart } from "@/components/ui/pie-chart";
import { Globe, Radio, Users, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

export interface BroadcasterMetrics {
  broadcasterName: string;
  domain: string;
  networkSnapshot: {
    audienceSize: string;
    revenue: string;
    platformCount: number;
    coverage: string;
  };
  audienceProfile: {
    primaryDemographic: string;
    secondaryDemographic: string;
    geographicReach: string[];
    engagementRate: string;
  };
  strategicContext: {
    sspPartners: string[];
    adServers: string[];
    technology: string[];
  };
  coreMetrics: {
    label: string;
    value: number;
  }[];
  regionalBreakdown: {
    region: string;
    value: number;
  }[];
  riskAssessment: {
    level: "low" | "medium" | "high";
    factors: string[];
  };
}

interface BroadcasterAnalysisProps {
  data: BroadcasterMetrics;
  status?: "executing" | "inProgress" | "complete" | "error";
}

export function BroadcasterAnalysis({ data, status = "complete" }: BroadcasterAnalysisProps) {
  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{data.broadcasterName}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data.domain}</p>
        </div>
        {status === "inProgress" && (
          <div className="flex items-center gap-2 text-sm text-blue-500">
            <div className="animate-spin">⟳</div>
            <span>Analyzing...</span>
          </div>
        )}
      </div>

      {/* Network Snapshot */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-blue-500" />
            Network Snapshot
          </CardTitle>
          <CardDescription>Key broadcaster metrics overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Audience Size</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{data.networkSnapshot.audienceSize}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Revenue</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{data.networkSnapshot.revenue}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Platforms</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{data.networkSnapshot.platformCount}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">Coverage</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{data.networkSnapshot.coverage}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audience Profile & Strategic Context */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audience Profile */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Audience Profile
            </CardTitle>
            <CardDescription>Demographics & engagement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Primary Demographic</p>
              <p className="text-sm text-gray-900 dark:text-white mt-1">{data.audienceProfile.primaryDemographic}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Secondary Demographic</p>
              <p className="text-sm text-gray-900 dark:text-white mt-1">{data.audienceProfile.secondaryDemographic}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Geographic Reach</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.audienceProfile.geographicReach.map((region, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                    {region}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Engagement Rate</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">{data.audienceProfile.engagementRate}</p>
            </div>
          </CardContent>
        </Card>

        {/* Strategic Context */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-500" />
              Strategic Context
            </CardTitle>
            <CardDescription>Technology & partnerships</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">SSP Partners</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.strategicContext.sspPartners.map((partner, idx) => (
                  <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                    {partner}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Ad Servers</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.strategicContext.adServers.map((server, idx) => (
                  <span key={idx} className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-full">
                    {server}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Technology Stack</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.strategicContext.technology.map((tech, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Core Metrics & Regional Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Metrics Chart */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Core Metrics
            </CardTitle>
            <CardDescription>Performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: "300px" }}>
              <BarChart
                data={data.coreMetrics}
                index="label"
                categories={["value"]}
                valueFormatter={(value) => `${value}%`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Regional Breakdown Chart */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-500" />
              Regional Breakdown
            </CardTitle>
            <CardDescription>Distribution by region</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: "300px" }}>
              <PieChart
                data={data.regionalBreakdown}
                index="region"
                category="value"
                valueFormatter={(value) => `${value}%`}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment */}
      <Card
        className={`bg-white dark:bg-gray-800 border-2 ${
          data.riskAssessment.level === "high"
            ? "border-red-200 dark:border-red-800"
            : data.riskAssessment.level === "medium"
              ? "border-yellow-200 dark:border-yellow-800"
              : "border-green-200 dark:border-green-800"
        }`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {data.riskAssessment.level === "high" ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : data.riskAssessment.level === "medium" ? (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            Risk Assessment
          </CardTitle>
          <CardDescription>Compatibility & migration analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Risk Level:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                  data.riskAssessment.level === "high"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : data.riskAssessment.level === "medium"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                }`}
              >
                {data.riskAssessment.level}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-3">Risk Factors</p>
            <ul className="space-y-2">
              {data.riskAssessment.factors.map((factor, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-xs text-gray-400 dark:text-gray-600 mt-1">•</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
