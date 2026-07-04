"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FileSignature } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { ContractCard } from "@/components/shared/ContractCard";
import { ContractDetailDialog } from "@/components/shared/ContractDetailDialog";
import { downloadContractPdf } from "@/lib/contractPdf";
import { contractsApi } from "@/lib/api/contracts";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";
import type { ContractWithDetails } from "@/types";
import type { SignatureResult } from "@/components/shared/SignaturePad";

export default function StudentContractsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<ContractWithDetails | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["student-contracts", user?.id],
    queryFn: () => contractsApi.getForStudent(user!.id),
    enabled: !!user,
  });

  const signMutation = useMutation({
    mutationFn: ({
      contractId,
      signature,
    }: {
      contractId: string;
      signature: SignatureResult;
    }) => contractsApi.signAsStudent(user!.id, contractId, signature),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-contracts"] });
      toast({ title: "Contract signed", description: "Your digital signature has been recorded." });
      setDialogOpen(false);
      setSelected(null);
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Could not sign",
        description: err instanceof Error ? err.message : "Try again",
      });
    },
  });

  const declineMutation = useMutation({
    mutationFn: (contractId: string) => contractsApi.decline(user!.id, contractId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-contracts"] });
      toast({ title: "Contract declined" });
      setDialogOpen(false);
      setSelected(null);
    },
  });

  const openContract = (contract: ContractWithDetails) => {
    setSelected(contract);
    setDialogOpen(true);
  };

  const pendingCount = contracts.filter((c) => c.status === "pending_student").length;

  if (isLoading) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contracts"
        description="Review and digitally sign employment agreements from companies"
      />

      {pendingCount > 0 && (
        <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 px-4 py-3 text-sm text-amber-900">
          You have <strong>{pendingCount}</strong> contract{pendingCount > 1 ? "s" : ""} awaiting
          your signature.
        </div>
      )}

      {contracts.length === 0 ? (
        <EmptyState
          icon={<FileSignature className="h-8 w-8" />}
          title="No contracts yet"
          description="When a company sends you an employment contract after an interview, it will appear here for digital signing."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {contracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              variant="student"
              onView={() => openContract(contract)}
              onAction={
                contract.status === "pending_student"
                  ? () => openContract(contract)
                  : () => downloadContractPdf(contract)
              }
              actionLabel={
                contract.status === "pending_student" ? "Sign now" : "Download PDF"
              }
            />
          ))}
        </div>
      )}

      <ContractDetailDialog
        contract={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        role="student"
        isLoading={signMutation.isPending || declineMutation.isPending}
        onSign={(sig) =>
          selected && signMutation.mutate({ contractId: selected.id, signature: sig })
        }
        onDecline={() => selected && declineMutation.mutate(selected.id)}
      />
    </div>
  );
}
