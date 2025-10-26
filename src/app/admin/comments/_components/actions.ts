
"use server";

import { revalidatePath } from "next/cache";

export async function approveComment(id: string) {
  console.log(`Approving comment ${id}`);
  revalidatePath("/admin/comments");
}

export async function rejectComment(id: string) {
  console.log(`Rejecting comment ${id}`);
  revalidatePath("/admin/comments");
}

export async function markAsSpam(id: string) {
  console.log(`Marking comment ${id} as spam`);
  revalidatePath("/admin/comments");
}
