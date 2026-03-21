"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { SearchResults } from "./generative-ui/SearchResults";
import { Globe, Server, Radio, CheckCircle, AlertCircle } from "lucide-react";
import { BarChart } from "./ui/bar-chart";
import { DonutChart } from "./ui/pie-chart";

interface BroadcasterData {
  broadcasterName: string;
  domain: string;
  adServer: string;
  fundamentSSPs: string[];
  smartclipPresent: boolean;
}

interface DashboardProps {
  broadcasterData?: BroadcasterData | null;
}

export function Dashboard({ broadcasterData }: DashboardProps) {
  // Call all hooks at the top level (unconditionally)
  useCopilotReadable({
    description: "Broadcaster research data from ads.txt analysis",
    value: broadcasterData || {},
  });

  // Define render only search action
  useCopilotAction({
    name: "searchInternet",
    available: "disabled",
    description: "Searches the internet for information.",
    parameters: [
      {
        name: "query",
        type: "string",
        description: "The query to search the internet for.",
        required: true,
      },
    ],
    render: ({ args, status }) => {
      return (
        <SearchResults
          query={args.query || "No query provided"}
          status={status}
        />
      );
    },
  });

  // Prepare data for broadcaster view
  const sspDistribution =
    broadcasterData?.fundamentSSPs?.map((ssp, idx) => ({
      name: ssp,
      value: 100 / Math.max(1, broadcasterData.fundamentSSPs.length),
    })) || [];

  if (sspDistribution.length === 0 && broadcasterData) {
    sspDistribution.push({ name: "No SSPs Detected", value: 100 });
  }

  const techStackData = broadcasterData
    ? [
        {
          name: "Ad Server",
          detected: broadcasterData.adServer !== "Unknown" ? 1 : 0,
          missing: broadcasterData.adServer !== "Unknown" ? 0 : 1,
        },
        {
          name: "SSPs",
          detected: broadcasterData.fundamentSSPs.length > 0 ? 1 : 0,
          missing: broadcasterData.fundamentSSPs.length > 0 ? 0 : 1,
        },
        {
          name: "SmartClip",
          detected: broadcasterData.smartclipPresent ? 1 : 0,
          missing: broadcasterData.smartclipPresent ? 0 : 1,
        },
      ]
    : [];

  // If no broadcaster data, return null
  if (!broadcasterData) {
    return null;
  }

  return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full">
        {/* Broadcaster Info Cards */}
        <Card className="col-span-1 md:col-span-1 lg:col-span-1 bg-slate-800/50 border-slate-600/40 hover:border-slate-500/60 shadow-md shadow-slate-950/30 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-300">
              <Globe className="w-4 h-4 text-slate-400" /> Broadcaster
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-100">
              {broadcasterData.broadcasterName}
            </p>
            <p className="text-xs text-slate-400">{broadcasterData.domain}</p>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-1 lg:col-span-1 bg-slate-800/50 border-slate-600/40 hover:border-slate-500/60 shadow-md shadow-slate-950/30 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-300">
              <Server className="w-4 h-4 text-slate-400" /> Primary Ad Server
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-100">
              {broadcasterData.adServer}
            </p>
            <p className="text-xs text-slate-400">
              {broadcasterData.adServer === "Unknown" ? "Not found" : "Detected"}
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-1 lg:col-span-1 bg-slate-800/50 border-slate-600/40 hover:border-slate-500/60 shadow-md shadow-slate-950/30 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-300">
              <Radio className="w-4 h-4 text-slate-400" /> SSP Partners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-100">
              {broadcasterData.fundamentSSPs.length}
            </p>
            <p className="text-xs text-slate-400">partnerships</p>
          </CardContent>
        </Card>

        <Card
          className={`col-span-1 md:col-span-1 lg:col-span-1 bg-slate-800/50 ${
            broadcasterData.smartclipPresent
              ? "border-green-700/40 hover:border-green-600/50 shadow-md shadow-green-950/20"
              : "border-amber-700/40 hover:border-amber-600/50 shadow-md shadow-amber-950/20"
          } transition-all duration-300`}
        >
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {broadcasterData.smartclipPresent ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600" />
              )}
              <span className={broadcasterData.smartclipPresent ? "text-green-300" : "text-amber-300"}>SmartClip Integration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                broadcasterData.smartclipPresent ? "text-green-200" : "text-amber-200"
              }`}
            >
              {broadcasterData.smartclipPresent ? "Found" : "Not Found"}
            </p>
            <p className={`text-xs ${broadcasterData.smartclipPresent ? "text-green-300/70" : "text-amber-300/70"}`}>
              {broadcasterData.smartclipPresent
                ? "Integration ready"
                : "Needs integration"}
            </p>
          </CardContent>
        </Card>

        {/* SSP Distribution Chart */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-2 bg-slate-800/50 border-slate-600/40 hover:border-slate-500/60 shadow-md shadow-slate-950/30 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-300">SSP Distribution</CardTitle>
            <CardDescription className="text-slate-400">Active supply-side platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <DonutChart
                data={sspDistribution}
                index="name"
                category="value"
                colors={["#64748b", "#78716c", "#57534e"]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Technology Stack Chart */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-2 bg-slate-800/50 border-slate-600/40 hover:border-slate-500/60 shadow-md shadow-slate-950/30 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-300">
              Technology Stack Overview
            </CardTitle>
            <CardDescription className="text-slate-400">Detected infrastructure components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <BarChart
                data={techStackData}
                index="name"
                categories={["detected", "missing"]}
                colors={["#10b981", "#ef4444"]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Partners */}
        {broadcasterData.fundamentSSPs.length > 0 && (
          <Card className="col-span-1 md:col-span-4 lg:col-span-4 bg-slate-800/50 border-slate-600/40 hover:border-slate-500/60 shadow-md shadow-slate-950/30 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-300">Active Partners</CardTitle>
              <CardDescription className="text-slate-400">Click to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {broadcasterData.fundamentSSPs.map((ssp) => (
                  <button
                    key={ssp}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded text-xs text-slate-200 font-medium transition-all duration-300 hover:shadow-md hover:shadow-slate-950/40"
                  >
                    {ssp}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
}
