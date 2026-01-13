"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, Funnel } from "lucide-react";

type Project = {
  id: string;
  title: string;
  project_type?: string;
  status?: string;
  created_at?: string;
};

export default function OrgProjectsPage() {
  return <p>Analytic pending</p>
}
