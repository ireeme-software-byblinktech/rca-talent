import { Badge } from "@/components/ui/badge";
import type {
  ContactRequestStatus,
  VerificationStatus,
} from "@/types";

type StatusType =
  | VerificationStatus
  | ContactRequestStatus
  | "open"
  | "closed"
  | "completed";

const statusLabels: Record<StatusType, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  accepted: "Accepted",
  declined: "Declined",
  open: "Open",
  closed: "Closed",
  completed: "Completed",
};

const statusVariants: Record<
  StatusType,
  "pending" | "approved" | "rejected" | "accepted" | "declined" | "secondary"
> = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
  accepted: "accepted",
  declined: "declined",
  open: "approved",
  closed: "declined",
  completed: "accepted",
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={statusVariants[status]} className={className}>
      {statusLabels[status]}
    </Badge>
  );
}
