
export interface Comment {
  id: string;
  author: {
    name: string;
    email: string;
  };
  body: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected" | "spam";
}
