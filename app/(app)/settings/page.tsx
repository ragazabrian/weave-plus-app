"use client";

import { useRole } from "@/lib/role-context";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function SettingsPage() {
  const { role } = useRole();

  if (role === "student") {
    return (
      <div className="flex flex-col gap-8">
        <SectionHeader title="Settings" />
        <Card>This page isn&apos;t available for students.</Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Settings"
        description={role === "admin" ? "Workspace, billing, and integrations." : "Your account settings."}
      />

      <Card density="compact">
        <div className="text-body-sm text-fog">Display name</div>
        <div className="text-body text-ink font-geist mt-1">
          {role === "admin" ? "Workspace Admin" : "Dr. Elena Cho"}
        </div>
      </Card>

      {role === "admin" && (
        <>
          <Card density="compact">
            <div className="text-body-sm text-fog">Billing plan</div>
            <div className="text-body text-ink font-geist mt-1">Free tier</div>
          </Card>
          <Card density="compact">
            <div className="text-body-sm text-fog">Integrations</div>
            <div className="text-body text-ink font-geist mt-1">None connected yet</div>
          </Card>
        </>
      )}
    </div>
  );
}
