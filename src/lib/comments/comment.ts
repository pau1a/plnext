
export interface Comment {
  id: string;
  slug: string;
  author: {
    name: string;
    email: string | null;
  };
  body: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected" | "spam";
}
