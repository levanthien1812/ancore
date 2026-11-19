import ActivitiesClient from "@/components/activities/activities-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activities | Ancore",
};

export default function ActivitiesPage() {
  return <ActivitiesClient />;
}
