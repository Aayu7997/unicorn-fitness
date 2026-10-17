"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  Megaphone,
  Link2,
  Copy,
  Check,
  Info,
} from "lucide-react";
import { AnimatedSaveButton } from "@/components/ui/animated-save-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";

interface AdSettings {
  googleAnalyticsId: string;
  googleAdsId: string;
  metaPixelId: string;
  tiktokPixelId: string;
}

const defaultSettings: AdSettings = {
  googleAnalyticsId: "",
  googleAdsId: "",
  metaPixelId: "",
  tiktokPixelId: "",
};

export function AdsTab() {
  const [data, setData] = useState<AdSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // UTM Builder State
  const [utmUrl, setUtmUrl] = useState("https://unicornfitnessclub.com");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/ads")
      .then((res) => res.json())
      .then((json) => {
        if (json) {
          setData(json as AdSettings);
        }
      })
      .catch((err) => {
        console.error("Failed to load ads data", err);
        setError("Failed to load ads data");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/ads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save ads settings");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const generatedUtm = () => {
    try {
      const url = new URL(utmUrl || "https://unicornfitnessclub.com");
      if (utmSource) url.searchParams.set("utm_source", utmSource);
      if (utmMedium) url.searchParams.set("utm_medium", utmMedium);
      if (utmCampaign) url.searchParams.set("utm_campaign", utmCampaign);
      return url.toString();
    } catch (e) {
      return "Invalid URL";
    }
  };

  const handleCopyUtm = async () => {
    await copyToClipboard(generatedUtm());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ads & Tracking</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your tracking pixels and generate campaign URLs.
          </p>
        </div>
        <AnimatedSaveButton onClick={handleSave} loading={saving} />
      </div>

      {error && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-primary/50 text-primary bg-primary/10">
          <Check className="h-4 w-4 stroke-primary" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            Tracking IDs updated successfully! Scripts will automatically be
            injected into the site.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Tracking Scripts Form */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" />
              <CardTitle>Tracking IDs</CardTitle>
            </div>
            <CardDescription>
              Configure the analytics and conversion tracking IDs for your
              marketing campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Google Analytics 4 (G-) Measurement ID</Label>
              <Input
                name="googleAnalyticsId"
                value={data.googleAnalyticsId}
                onChange={handleChange}
                placeholder="e.g., G-XXXXXXXXXX"
              />
            </div>

            <div className="space-y-2">
              <Label>Google Ads Conversion ID</Label>
              <Input
                name="googleAdsId"
                value={data.googleAdsId}
                onChange={handleChange}
                placeholder="e.g., AW-XXXXXXXXX"
              />
            </div>

            <div className="space-y-2">
              <Label>Meta (Facebook) Pixel ID</Label>
              <Input
                name="metaPixelId"
                value={data.metaPixelId}
                onChange={handleChange}
                placeholder="e.g., 123456789012345"
              />
            </div>

            <div className="space-y-2">
              <Label>TikTok Pixel ID</Label>
              <Input
                name="tiktokPixelId"
                value={data.tiktokPixelId}
                onChange={handleChange}
                placeholder="e.g., CXXXXXXX"
              />
            </div>
          </CardContent>
        </Card>

        {/* UTM Builder */}
        <div className="sticky top-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-primary" />
                <CardTitle>Campaign URL Builder (UTM)</CardTitle>
              </div>
              <CardDescription>
                Generate tracked links for external ads to accurately track
                traffic sources in Analytics.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Website URL *</Label>
                <Input
                  type="url"
                  value={utmUrl}
                  onChange={(e) => setUtmUrl(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Source *</Label>
                  <Input
                    type="text"
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    placeholder="e.g., facebook, google"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Medium</Label>
                  <Input
                    type="text"
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                    placeholder="e.g., cpc, banner"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input
                  type="text"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  placeholder="e.g., summer_sale, retargeting"
                />
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg border">
                <p className="text-sm font-medium mb-2 text-foreground">
                  Generated URL:
                </p>
                <p className="text-primary font-mono text-sm mb-4 break-all bg-background p-2 rounded border">
                  {generatedUtm()}
                </p>
                <Button
                  onClick={handleCopyUtm}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  {copied ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copied ? "Copied!" : "Copy URL"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
