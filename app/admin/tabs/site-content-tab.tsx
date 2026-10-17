"use client";

import { AnimatedSaveButton } from "@/components/ui/animated-save-button";
import { AnimatedDeleteButton } from "@/components/ui/animated-delete-button";
import { useEffect, useState, useCallback } from "react";
import {
  Save,
  Loader2,
  Globe,
  RefreshCw,
  Upload,
  Trash2,
  Play,
} from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SiteContent {
  hero?: {
    headline?: string;
    subheadline?: string;
    cta?: string;
    mediaUrl?: string;
    mediaType?: "image" | "video";
    mediaPublicId?: string;
  };
  about?: {
    title?: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  stats?: {
    members?: string;
    trainers?: string;
    programs?: string;
    years?: string;
  };
  footer?: { description?: string };
  attributes?: {
    speed?: {
      title?: string;
      description?: string;
      mediaUrl?: string;
      mediaPublicId?: string;
      accent?: string;
    };
    strength?: {
      title?: string;
      description?: string;
      mediaUrl?: string;
      mediaPublicId?: string;
      accent?: string;
    };
    endurance?: {
      title?: string;
      description?: string;
      mediaUrl?: string;
      mediaPublicId?: string;
      accent?: string;
    };
  };
}

const DEFAULT_CONTENT: SiteContent = {
  hero: {
    headline: "Transform Your Life at Unicorn Fitness Club",
    subheadline: "Jaipur's Premier Fitness Destination — Where Results Happen",
    cta: "Start Your Journey",
  },
  about: {
    title: "About Unicorn Fitness Club",
    description:
      "Founded by Lokesh Meena, Unicorn Fitness Club has been transforming lives in Jaipur since 2019.",
    address:
      "UFC Tower, Mahal Road, Near Jagatpura Flyover, Jaipur, Rajasthan — 302017",
    phone: "087643 60662",
    email: "Unicornfitness3111@gmail.com",
  },
  stats: { members: "500+", trainers: "15+", programs: "20+", years: "5+" },
  footer: { description: "Jaipur's Premier Fitness Destination" },
  attributes: {
    speed: {
      title: "Speed",
      description:
        "Quick, efficient workouts designed for maximum impact in minimum time",
      mediaUrl: "/images/cardio-zone.jpg",
      accent: "from-orange-500/30 to-red-500/20",
    },
    strength: {
      title: "Strength",
      description:
        "Build powerful muscles with our world-class equipment and expert guidance",
      mediaUrl: "/images/training-area.jpg",
      accent: "from-blue-500/30 to-purple-500/20",
    },
    endurance: {
      title: "Endurance",
      description: "Last longer, push harder — unlock your true potential",
      mediaUrl: "/images/yoga-studio.jpg",
      accent: "from-emerald-500/30 to-teal-500/20",
    },
  },
};

export function SiteContentTab() {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "hero" | "about" | "stats" | "attributes" | "footer"
  >("hero");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/site-content");
    if (res.ok) {
      const data = await res.json();
      if (data) setContent({ ...DEFAULT_CONTENT, ...data });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/admin/site-content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const sections = [
    { key: "hero" as const, label: "Hero Section" },
    { key: "about" as const, label: "About & Contact" },
    { key: "stats" as const, label: "Stats Numbers" },
    { key: "attributes" as const, label: "Core Attributes" },
    { key: "footer" as const, label: "Footer" },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "hero":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Hero Media (Image or Video)</Label>
              {content.hero?.mediaUrl ? (
                <div className="relative group rounded-xl overflow-hidden bg-muted border aspect-video mb-4">
                  {content.hero.mediaType === "video" ? (
                    <video
                      src={content.hero.mediaUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={content.hero.mediaUrl}
                      alt="Hero"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-muted opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <AnimatedDeleteButton
                      onClick={() =>
                        setContent((c) => ({
                          ...c,
                          hero: {
                            ...c.hero,
                            mediaUrl: undefined,
                            mediaType: undefined,
                            mediaPublicId: undefined,
                          },
                        }))
                      }
                    />
                  </div>
                  {content.hero.mediaType === "video" && (
                    <div className="absolute top-4 left-4 bg-muted backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2">
                      <Play className="w-3 h-3 text-primary fill-blue-500" />{" "}
                      Video
                    </div>
                  )}
                </div>
              ) : (
                <CldUploadWidget
                  uploadPreset="ufc_gym_media"
                  options={{
                    maxFiles: 1,
                    resourceType: "auto",
                    clientAllowedFormats: [
                      "jpg",
                      "jpeg",
                      "png",
                      "webp",
                      "mp4",
                      "mov",
                      "webm",
                    ],
                  }}
                  onSuccess={(result: any) => {
                    const info = result.info;
                    setContent((c) => ({
                      ...c,
                      hero: {
                        ...c.hero,
                        mediaUrl: info.secure_url,
                        mediaType:
                          info.resource_type === "video" ? "video" : "image",
                        mediaPublicId: info.public_id,
                      },
                    }));
                  }}
                >
                  {({ open }) => (
                    <Button
                      type="button"
                      onClick={() => open()}
                      className="w-full h-48 mb-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:bg-muted/50 transition-colors group"
                    >
                      <Upload className="w-8 h-8 mb-3 group-hover:-translate-y-1 transition-transform" />
                      <span className="text-sm font-medium">
                        Click to upload cinematic video or image
                      </span>
                      <span className="text-xs opacity-60 mt-1">
                        MP4, WebM, JPG, PNG (Max 50MB)
                      </span>
                    </Button>
                  )}
                </CldUploadWidget>
              )}
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Main Headline</Label>
                <Input
                  value={content.hero?.headline ?? ""}
                  onChange={(e) =>
                    setContent((c) => ({
                      ...c,
                      hero: { ...c.hero, headline: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Subheadline</Label>
                <Input
                  value={content.hero?.subheadline ?? ""}
                  onChange={(e) =>
                    setContent((c) => ({
                      ...c,
                      hero: { ...c.hero, subheadline: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>CTA Button Text</Label>
                <Input
                  value={content.hero?.cta ?? ""}
                  onChange={(e) =>
                    setContent((c) => ({
                      ...c,
                      hero: { ...c.hero, cta: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          </div>
        );
      case "about":
        return (
          <div className="space-y-4">
            {[
              { label: "Section Title", key: "title" },
              { label: "Phone Number", key: "phone" },
              { label: "Email", key: "email" },
            ].map((f) => (
              <div key={f.key} className="space-y-2">
                <Label>{f.label}</Label>
                <Input
                  value={
                    (content.about as Record<string, string>)?.[f.key] ?? ""
                  }
                  onChange={(e) =>
                    setContent((c) => ({
                      ...c,
                      about: { ...c.about, [f.key]: e.target.value },
                    }))
                  }
                />
              </div>
            ))}
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea
                value={content.about?.address ?? ""}
                onChange={(e) =>
                  setContent((c) => ({
                    ...c,
                    about: { ...c.about, address: e.target.value },
                  }))
                }
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={content.about?.description ?? ""}
                onChange={(e) =>
                  setContent((c) => ({
                    ...c,
                    about: { ...c.about, description: e.target.value },
                  }))
                }
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
        );

      case "attributes":
        return (
          <div className="space-y-8">
            {["speed", "strength", "endurance"].map((attr) => {
              const attrKey = attr as "speed" | "strength" | "endurance";
              const attrData = content.attributes?.[attrKey] || {};

              return (
                <div
                  key={attr}
                  className="p-4 bg-muted/30 border rounded-xl space-y-4"
                >
                  <h4 className="font-medium capitalize">{attr} Section</h4>

                  <div className="space-y-2">
                    <Label>Background Image</Label>
                    {attrData.mediaUrl &&
                    !attrData.mediaUrl.startsWith("/images") ? (
                      <div className="relative group rounded-lg overflow-hidden bg-muted border aspect-video mb-2 w-full max-w-sm">
                        <img
                          src={attrData.mediaUrl}
                          alt={attr}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-muted opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <AnimatedDeleteButton
                            onClick={() =>
                              setContent((c) => ({
                                ...c,
                                attributes: {
                                  ...c.attributes,
                                  [attrKey]: {
                                    ...c.attributes?.[attrKey],
                                    mediaUrl: undefined,
                                    mediaPublicId: undefined,
                                  },
                                },
                              }))
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <CldUploadWidget
                        uploadPreset="ufc_gym_media"
                        options={{
                          maxFiles: 1,
                          resourceType: "image",
                          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
                        }}
                        onSuccess={(result: any) => {
                          const info = result.info;
                          setContent((c) => ({
                            ...c,
                            attributes: {
                              ...c.attributes,
                              [attrKey]: {
                                ...c.attributes?.[attrKey],
                                mediaUrl: info.secure_url,
                                mediaPublicId: info.public_id,
                              },
                            },
                          }));
                        }}
                      >
                        {({ open }) => (
                          <Button
                            type="button"
                            onClick={() => open()}
                            className="w-full max-w-sm h-32 mb-2 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:bg-muted/50 transition-colors group"
                          >
                            <Upload className="w-6 h-6 mb-2 group-hover:-translate-y-1 transition-transform" />
                            <span className="text-xs font-medium">
                              Upload Image (Max 10MB)
                            </span>
                          </Button>
                        )}
                      </CldUploadWidget>
                    )}
                    {attrData.mediaUrl?.startsWith("/images") && (
                      <p className="text-xs text-primary mt-1">
                        Currently using default image. Upload to override.
                      </p>
                    )}
                  </div>

                  <div className="grid gap-3">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={attrData.title ?? ""}
                        onChange={(e) =>
                          setContent((c) => ({
                            ...c,
                            attributes: {
                              ...c.attributes,
                              [attrKey]: {
                                ...c.attributes?.[attrKey],
                                title: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={attrData.description ?? ""}
                        onChange={(e) =>
                          setContent((c) => ({
                            ...c,
                            attributes: {
                              ...c.attributes,
                              [attrKey]: {
                                ...c.attributes?.[attrKey],
                                description: e.target.value,
                              },
                            },
                          }))
                        }
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      case "stats":
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              These appear in the stats counter section of the homepage.
            </p>
            {[
              { label: "Members (e.g. 500+)", key: "members" },
              { label: "Trainers (e.g. 15+)", key: "trainers" },
              { label: "Programs (e.g. 20+)", key: "programs" },
              { label: "Years Experience (e.g. 5+)", key: "years" },
            ].map((f) => (
              <div key={f.key} className="space-y-2">
                <Label>{f.label}</Label>
                <Input
                  value={
                    (content.stats as Record<string, string>)?.[f.key] ?? ""
                  }
                  onChange={(e) =>
                    setContent((c) => ({
                      ...c,
                      stats: { ...c.stats, [f.key]: e.target.value },
                    }))
                  }
                />
              </div>
            ))}
          </div>
        );
      case "footer":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Footer Tagline</Label>
              <Input
                value={content.footer?.description ?? ""}
                onChange={(e) =>
                  setContent((c) => ({
                    ...c,
                    footer: { ...c.footer, description: e.target.value },
                  }))
                }
              />
            </div>
          </div>
        );
    }
  };
  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" /> Site Content
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Edit homepage text and contact information
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="icon" onClick={load} title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <AnimatedSaveButton onClick={save} loading={saving} />
        </div>
      </div>

      {saved && (
        <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm rounded-lg">
          ✓ Site content saved successfully!
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Section Nav */}
        <div className="space-y-1">
          {sections.map((s) => (
            <Button
              key={s.key}
              variant={activeSection === s.key ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection(s.key)}
            >
              {s.label}
            </Button>
          ))}
        </div>

        {/* Editor */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {sections.find((s) => s.key === activeSection)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 bg-muted rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                renderSection()
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary text-sm">
        💡 <strong>Note:</strong> These values update the site content stored in
        the database. The homepage components will read this data. For complete
        homepage customization, also update Programs, Trainers, Plans, and FAQs
        from their dedicated tabs.
      </div>
    </div>
  );
}
