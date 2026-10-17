"use client";

import { AnimatedSaveButton } from "@/components/ui/animated-save-button";
import { useState, useEffect } from "react";
import { Save, Loader2, Globe, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SeoData {
  title: string;
  description: string;
  keywords: string;
  author: string;
  ogImage: string;
  canonicalUrl: string;
}

const defaultSeo: SeoData = {
  title: "Unicorn Fitness Club — Premium Fitness in Jaipur",
  description:
    "Jaipur's premier fitness destination. World-class equipment, certified trainers, personalized programs.",
  keywords: "gym jaipur, fitness club, personal trainer jaipur",
  author: "Unicorn Fitness Club",
  ogImage: "/images/hero-gym.jpg",
  canonicalUrl: "https://unicornfitnessclub.com",
};

export function SeoTab() {
  const [data, setData] = useState<SeoData>(defaultSeo);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/admin/seo")
      .then((res) => res.json())
      .then((json) => {
        if (json) {
          setData(json as SeoData);
        }
      })
      .catch((err) => {
        console.error("Failed to load SEO data", err);
        setError("Failed to load SEO data");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save SEO settings");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
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
          <h2 className="text-2xl font-bold tracking-tight mb-1">
            SEO Management
          </h2>
          <p className="text-muted-foreground text-sm">
            Configure how your website appears on search engines and social
            media.
          </p>
        </div>
        <AnimatedSaveButton onClick={handleSave} loading={saving} />
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-primary/10 border border-primary/20 text-primary text-sm rounded-lg">
          SEO settings updated successfully! Changes will reflect immediately on
          the live site.
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                General Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Site Title <span className="text-primary">*</span>
                </Label>
                <Input
                  type="text"
                  name="title"
                  value={data.title}
                  onChange={handleChange}
                  placeholder="e.g., Unicorn Fitness Club — Premium Fitness in Jaipur"
                />
                <p className="text-xs text-muted-foreground">
                  {data.title.length} characters (Recommended: 50-60)
                </p>
              </div>

              <div className="space-y-2">
                <Label>
                  Meta Description <span className="text-primary">*</span>
                </Label>
                <Textarea
                  name="description"
                  value={data.description}
                  onChange={handleChange}
                  rows={3}
                  className="resize-none"
                  placeholder="A compelling description for search engines..."
                />
                <p className="text-xs text-muted-foreground">
                  {data.description.length} characters (Recommended: 150-160)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Keywords (comma separated)</Label>
                <Input
                  type="text"
                  name="keywords"
                  value={data.keywords}
                  onChange={handleChange}
                  placeholder="gym, fitness, workout"
                />
              </div>

              <div className="space-y-2">
                <Label>Author</Label>
                <Input
                  type="text"
                  name="author"
                  value={data.author}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Canonical URL</Label>
                <Input
                  type="url"
                  name="canonicalUrl"
                  value={data.canonicalUrl}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label>OpenGraph Image URL</Label>
                <Input
                  type="text"
                  name="ogImage"
                  value={data.ogImage}
                  onChange={handleChange}
                  placeholder="/images/hero-gym.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  This image appears when your site is shared on Facebook,
                  Twitter, WhatsApp etc.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Previews */}
        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Live Google Search Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Google Search Desktop Mockup */}
              <div className="bg-card rounded-lg p-5 border border-border font-sans mb-8 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src="/favicon-32x32.png"
                      alt="favicon"
                      className="w-4 h-4"
                    />
                  </div>
                  <div>
                    <p className="text-foreground text-sm leading-tight">
                      Unicorn Fitness Club
                    </p>
                    <p className="text-muted-foreground text-[12px] leading-tight">
                      {data.canonicalUrl}
                    </p>
                  </div>
                </div>
                <h3 className="text-primary text-xl font-normal leading-tight mb-1 hover:underline cursor-pointer">
                  {data.title || "Your Site Title Will Appear Here"}
                </h3>
                <p className="text-muted-foreground text-[14px] leading-snug line-clamp-2">
                  {data.description ||
                    "Your meta description will appear here to provide users with a brief summary of what your page is about."}
                </p>
              </div>

              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Social Media Preview (OpenGraph)
              </h3>

              {/* Twitter/Facebook Mockup */}
              <div className="bg-card border border-border rounded-xl overflow-hidden font-sans">
                <div className="h-48 bg-muted relative overflow-hidden flex items-center justify-center border-b border-border">
                  {data.ogImage ? (
                    <img
                      src={data.ogImage}
                      alt="OG Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      No Image Configured
                    </span>
                  )}
                </div>
                <div className="p-4 bg-card">
                  <p className="text-muted-foreground text-[12px] uppercase tracking-wide mb-1">
                    {data.canonicalUrl.replace("https://", "")}
                  </p>
                  <h4 className="text-foreground font-semibold text-[15px] leading-tight mb-1 truncate">
                    {data.title}
                  </h4>
                  <p className="text-muted-foreground text-[14px] truncate">
                    {data.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
