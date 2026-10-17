"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  Plus,
  Users,
  CalendarDays,
  Send,
  ChevronRight,
  BarChart3,
  X,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { FaBell, FaPaperPlane } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export function CommunicationTab() {
  const [activeChannel, setActiveChannel] = useState("All");
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "Email",
    audience: "All Members",
    message: "",
  });
  const { toast } = useToast();

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/admin/communication");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (err) {
      console.error("Failed to fetch communications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async () => {
    if (!formData.title || !formData.message) {
      toast({
        title: "Error",
        description: "Title and message are required",
        variant: "destructive",
      });
      return;
    }
    try {
      const res = await fetch("/api/admin/communication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast({
          title: "Success",
          description: "Campaign created successfully",
        });
        setModalOpen(false);
        setFormData({
          title: "",
          type: "Email",
          audience: "All Members",
          message: "",
        });
        fetchCampaigns();
      } else {
        toast({
          title: "Error",
          description: "Failed to create campaign",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Marketing & Communication
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage bulk emails, WhatsApp broadcasts, and Push Notifications.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col group hover:border-primary/50 transition-colors cursor-pointer">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <FaPaperPlane className="w-5 h-5" />
              </div>
              <Badge
                variant="outline"
                className="border-emerald-500/50 text-emerald-500 bg-emerald-500/10"
              >
                Active
              </Badge>
            </div>
            <CardTitle className="mt-4 text-xl">Email Marketing</CardTitle>
            <CardDescription>
              Send newsletters and promotional offers via SendGrid.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto pt-4 border-t flex items-center justify-between text-sm">
            <span className="font-medium">12 Campaigns</span>
            <span className="text-primary font-medium group-hover:translate-x-1 transition-transform flex items-center">
              Manage <ChevronRight className="w-4 h-4 ml-1" />
            </span>
          </CardContent>
        </Card>

        <Card className="flex flex-col group hover:border-[#25D366]/50 transition-colors cursor-pointer">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
                <SiWhatsapp className="w-5 h-5" />
              </div>
              <Badge
                variant="outline"
                className="border-emerald-500/50 text-emerald-500 bg-emerald-500/10"
              >
                Active
              </Badge>
            </div>
            <CardTitle className="mt-4 text-xl">WhatsApp API</CardTitle>
            <CardDescription>
              Broadcast rich media messages directly to member inboxes.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto pt-4 border-t flex items-center justify-between text-sm">
            <span className="font-medium">5 Campaigns</span>
            <span className="text-[#25D366] font-medium group-hover:translate-x-1 transition-transform flex items-center">
              Manage <ChevronRight className="w-4 h-4 ml-1" />
            </span>
          </CardContent>
        </Card>

        <Card className="flex flex-col group hover:border-amber-500/50 transition-colors cursor-pointer">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <FaBell className="w-5 h-5" />
              </div>
              <Badge variant="secondary">Setup Required</Badge>
            </div>
            <CardTitle className="mt-4 text-xl">Push Notifications</CardTitle>
            <CardDescription>
              Send instant alerts to the UFC GYM Member Mobile App.
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto pt-4 border-t flex items-center justify-between text-sm">
            <span className="font-medium">0 Campaigns</span>
            <span className="text-amber-500 font-medium group-hover:translate-x-1 transition-transform flex items-center">
              Configure <ChevronRight className="w-4 h-4 ml-1" />
            </span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-muted-foreground" /> Campaign
            History
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {["All", "Email", "WhatsApp", "Push App"].map((tab) => (
              <Button
                key={tab}
                variant={activeChannel === tab ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveChannel(tab)}
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Target Audience</TableHead>
                  <TableHead className="text-right">Sent / Delivered</TableHead>
                  <TableHead className="text-right">Open Rate</TableHead>
                  <TableHead>Status / Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No marketing campaigns found.
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns
                    .filter(
                      (c) =>
                        activeChannel === "All" || c.type === activeChannel,
                    )
                    .map((camp, i) => (
                      <TableRow key={camp.id || i}>
                        <TableCell className="font-medium">
                          {camp.title || camp.name}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center text-xs font-medium text-muted-foreground">
                            {camp.type === "Email" && (
                              <FaPaperPlane className="w-3.5 h-3.5 mr-1.5" />
                            )}
                            {camp.type === "WhatsApp" && (
                              <SiWhatsapp className="w-3.5 h-3.5 mr-1.5" />
                            )}
                            {camp.type === "Push App" && (
                              <FaBell className="w-3.5 h-3.5 mr-1.5" />
                            )}
                            {camp.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <span className="flex items-center">
                            <Users className="w-3.5 h-3.5 mr-1.5 opacity-70" />{" "}
                            {camp.audience}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {camp.sent}
                        </TableCell>
                        <TableCell className="text-right font-medium text-primary">
                          {camp.openRate}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span
                              className={`text-xs font-semibold ${
                                camp.status === "Completed"
                                  ? "text-emerald-500"
                                  : "text-amber-500"
                              }`}
                            >
                              {camp.status}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {camp.date}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>New Campaign</DialogTitle>
            <DialogDescription>
              Create a new marketing campaign to reach your members.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Campaign Title</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g. Winter Promo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select
                  value={formData.type}
                  onValueChange={(val) =>
                    setFormData({ ...formData, type: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email (SendGrid)</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Push App">Push App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select
                  value={formData.audience}
                  onValueChange={(val) =>
                    setFormData({ ...formData, audience: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Members">All Members</SelectItem>
                    <SelectItem value="Active Members">
                      Active Members
                    </SelectItem>
                    <SelectItem value="Inactive Members">
                      Inactive Members
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Message / Content</Label>
              <Textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Type your campaign message here..."
                className="min-h-30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCampaign}>
              <Send className="w-4 h-4 mr-2" /> Send Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
