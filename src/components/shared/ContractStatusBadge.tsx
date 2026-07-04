import { Badge } from "@/components/ui/badge";
import type { ContractStatus } from "@/types";

const labels: Record<ContractStatus, string> = {
  draft: "Draft",
  pending_student: "Awaiting student",
  pending_company: "Awaiting company",
  signed: "Signed",
  declined: "Declined",
  void: "Void",
};

const variants: Record<
  ContractStatus,
  "pending" | "approved" | "rejected" | "accepted" | "declined" | "secondary"
> = {
  draft: "secondary",
  pending_student: "pending",
  pending_company: "pending",
  signed: "approved",
  declined: "declined",
  void: "secondary",
};

interface ContractStatusBadgeProps {
  status: ContractStatus;
  className?: string;
}

export function ContractStatusBadge({ status, className }: ContractStatusBadgeProps) {
  return (
    <Badge variant={variants[status]} className={className}>
      {labels[status]}
    </Badge>
  );
}
