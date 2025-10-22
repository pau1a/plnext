import { redirect } from "next/navigation";

export default function BlogIndexRedirectPage() {
  redirect("/writing");
}
