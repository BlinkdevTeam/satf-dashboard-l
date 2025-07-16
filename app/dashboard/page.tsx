"use client";

import { useEffect, useState } from "react";
import emailjs from "emailjs-com";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import ParticipantsTable from "../components/ParticipantsTable";
import UserPreview from "../components/UserPreview";
import { Participant } from "../types/participant";
import Image from "next/image";

const tabs = [
  { label: "Online 17", table: "satf_participant_online_17" },
  { label: "Online 24", table: "satf_participant_online_24" },
  { label: "Onsite 17", table: "satf_participant_onsite_17" },
  { label: "Onsite 24", table: "satf_participant_onsite_24" },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedUser, setSelectedUser] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const emailTemplateMap: Record<string, string> = {
    satf_participant_online_17:
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ONLINE_17!,
    satf_participant_online_24:
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ONLINE_24!,
    satf_participant_onsite_17:
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ONSITE_17!,
    satf_participant_onsite_24:
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ONSITE_24!,
  };

  useEffect(() => {
    fetchParticipants();
  }, [activeTab]);

  const fetchParticipants = async () => {
    setLoading(true);
    const { data, error } = await supabase.from(activeTab.table).select("*");
    if (error) {
      console.error(error);
      setParticipants([]);
    } else {
      const transformed = data.map((p: Participant) => ({
        ...p,
        participation_type: activeTab.label,
        source: activeTab.table,
      }));
      setParticipants(transformed);
    }
    setLoading(false);
  };

  const handleTimeAction = async (type: "in" | "out") => {
    if (!selectedUser) return;

    const now = new Date();
    const timestamp = now.toISOString();
    const formatted = now.toLocaleString("en-PH", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const updateData =
      type === "in"
        ? { time_in: timestamp, formatted_timein: formatted }
        : { time_out: timestamp, formatted_timeout: formatted };

    const { error } = await supabase
      .from(selectedUser.source)
      .update(updateData)
      .eq("id", selectedUser.id);

    if (error) {
      toast.error(`Error updating time ${type}: ${error.message}`);
    } else {
      // Immediately update local preview
      const updatedUser = {
        ...selectedUser,
        ...updateData,
      };
      setSelectedUser(updatedUser);
      await fetchParticipants();
    }
  };

  const handleApprove = async () => {
    if (!selectedUser) return;
    const templateId = emailTemplateMap[selectedUser.source];
    if (!templateId) {
      toast.error("No EmailJS template configured for this table.");
      return;
    }

    setApproving(true);

    try {
      const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

      const emailSendPromise = emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        templateId,
        {
          email: selectedUser.email,
          name: `${selectedUser.first_name_upper} ${selectedUser.last_name_upper}`,
          company: selectedUser.company,
          designation: selectedUser.designation,
          participation_type: selectedUser.participation_type,
        },
        process.env.NEXT_PUBLIC_EMAILJS_USER_ID!
      );

      await Promise.all([emailSendPromise, delay(2000)]);

      const { error } = await supabase
        .from(selectedUser.source)
        .update({ approved: true })
        .eq("id", selectedUser.id);

      if (error) {
        toast.error(`Email sent but failed to approve: ${error.message}`);
        return;
      }

      toast.success("User approved and email sent!");
      await fetchParticipants();
      setSelectedUser((prev) => (prev ? { ...prev, approved: true } : null));
    } catch (err) {
      console.error("EmailJS send error:", err);
      toast.error("Email failed. Approval not saved.");
    } finally {
      setApproving(false);
    }
  };

  const filteredParticipants = participants.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      `${p.first_name_upper} ${p.last_name_upper}`
        .toLowerCase()
        .includes(term) ||
      p.email?.toLowerCase().includes(term) ||
      p.company?.toLowerCase().includes(term)
    );
  });

  const handleReject = async () => {
    if (!selectedUser) return;
    setApproving(true);

    const { error } = await supabase
      .from(activeTab.table)
      .update({ rejected: true })
      .eq("id", selectedUser.id);

    if (error) {
      console.error("Reject failed:", error.message);
    } else {
      fetchParticipants();
    }

    setApproving(false);
  };

  return (
    <div className="px-6 py-8">
      {/* Logo */}
      <div className="mb-4">
        <Image
          src="/assets/SATF_LOGO_Black.png"
          alt="SATF Logo"
          width={290}
          height={0}
          style={{ height: "auto" }}
          priority
        />
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        {/* Search Field */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, email, or company..."
          className="w-full md:w-2/7 px-4 py-2 border border-[#00072C] rounded text-sm text-black"
        />

        <div className="flex gap-8">
          {/* Total Count */}
          <h1 className="text-base lg:text-lg font-semibold text-gray-800">
            Total Number of Participants: {participants.length}
          </h1>
          {["Onsite 17", "Onsite 24"].includes(activeTab.label) && (
            <h1 className="text-base lg:text-lg font-semibold text-gray-800">
              Total Active Participants:{" "}
              {
                participants.filter(
                  (p) => p.time_in !== null && p.time_in !== ""
                ).length
              }
            </h1>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-4">
        {tabs.map((tab, index) => {
          const tabColors = ["#0035E6", "#3EAD35", "#FEC205", "#EF1748"];
          const isActive = activeTab.label === tab.label;

          return (
            <button
              key={tab.label}
              onClick={() => {
                setActiveTab(tab);
                setSelectedUser(null);
              }}
              className={`px-4 py-2 rounded text-sm font-bold cursor-pointer ${
                isActive ? "text-white" : "text-white"
              }`}
              style={{
                backgroundColor: isActive ? "#00072C" : tabColors[index],
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content area with vertical scroll */}
      <div className="flex gap-6 h-auto py-2 overflow-hidden">
        <div className={selectedUser ? "w-2/3" : "w-full overflow-y-auto"}>
          <div className="h-full overflow-y-auto">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <ParticipantsTable
                data={filteredParticipants}
                onSelect={(user) => setSelectedUser(user)}
                selectedUser={selectedUser}
              />
            )}
          </div>
        </div>

        {selectedUser && (
          <div className="w-1/3 border rounded p-4 bg-[#FEF9DB] shadow-sm h-full overflow-y-hidden">
            <UserPreview
              user={selectedUser}
              onTimeIn={() => handleTimeAction("in")}
              onTimeOut={() => handleTimeAction("out")}
              onApprove={handleApprove}
              approving={approving}
              onReject={handleReject}
            />
          </div>
        )}
      </div>
    </div>
  );
}
