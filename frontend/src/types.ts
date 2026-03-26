export type UserRole = "USER" | "ADMIN";
export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_RESPONSE"
  | "RESOLVED"
  | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type CommentItem = {
  id: string;
  message: string;
  createdAt: string;
  user: {
    id?: string;
    name: string;
    role: UserRole;
  };
};

export type Ticket = {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: {
    id?: string;
    name: string;
    email?: string;
    role?: UserRole;
  };
  comments: CommentItem[];
};

export type AuthResponse = {
  message: string;
  token: string;
  user: User;
};
