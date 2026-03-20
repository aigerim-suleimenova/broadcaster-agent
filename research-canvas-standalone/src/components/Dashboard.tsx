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
        <Card className="col-span-1 md:col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="w-4 h-4" /> Broadcaster
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {broadcasterData.broadcasterName}
            </p>
            <p className="text-xs text-gray-500">{broadcasterData.domain}</p>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="w-4 h-4" /> Primary Ad Server
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {broadcasterData.adServer}
            </p>
            <p className="text-xs text-gray-500">
              {broadcasterData.adServer === "Unknown" ? "Not found" : "Detected"}
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Radio className="w-4 h-4" /> SSP Partners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {broadcasterData.fundamentSSPs.length}
            </p>
            <p className="text-xs text-gray-500">partnerships</p>
          </CardContent>
        </Card>

        <Card
          className={`col-span-1 md:col-span-1 lg:col-span-1 ${
            broadcasterData.smartclipPresent ? "border-green-200" : "border-red-200"
          }`}
        >
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {broadcasterData.smartclipPresent ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              SmartClip Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                broadcasterData.smartclipPresent ? "text-green-600" : "text-red-600"
              }`}
            >
              {broadcasterData.smartclipPresent ? "Found" : "Not Found"}
            </p>
            <p className="text-xs text-gray-500">
              {broadcasterData.smartclipPresent
                ? "Integration ready"
                : "Needs integration"}
            </p>
          </CardContent>
        </Card>

        {/* SSP Distribution Chart */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">SSP Distribution</CardTitle>
            <CardDescription>Active supply-side platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <DonutChart
                data={sspDistribution}
                index="name"
                category="value"
                colors={["#8b5cf6", "#7c3aed", "#6d28d9"]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Technology Stack Chart */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Technology Stack Overview
            </CardTitle>
            <CardDescription>Detected infrastructure components</CardDescription>
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
          <Card className="col-span-1 md:col-span-4 lg:col-span-4">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
              <CardDescription>Click to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {broadcasterData.fundamentSSPs.map((ssp) => (
                  <button
                    key={ssp}
                    className="px-3 py-1 bg-purple-100 border border-purple-300 hover:bg-purple-200 rounded text-xs text-purple-900 transition-colors"
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
