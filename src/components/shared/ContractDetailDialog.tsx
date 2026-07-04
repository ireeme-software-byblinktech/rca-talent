"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SignaturePad, type SignatureResult } from "@/components/shared/SignaturePad";
import { ContractStatusBadge } from "@/components/shared/ContractStatusBadge";
import { downloadContractPdf, getContractPdfUrl } from "@/lib/contractPdf";
import type { ContractWithDetails } from "@/types";

interface ContractDetailDialogProps {
  contract: ContractWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: "student" | "company";
  onSign?: (signature: SignatureResult) => void;
  onDecline?: () => void;
  onVoid?: () => void;
  isLoading?: boolean;
}

function pdfCacheKey(contract: ContractWithDetails): string {
  return [
    contract.id,
    contract.status,
    contract.updatedAt,
    contract.companySignature?.signedAt,
    contract.studentSignature?.signedAt,
  ].join(":");
}

export function ContractDetailDialog({
  contract,
  open,
  onOpenChange,
  role,
  onSign,
  onDecline,
  onVoid,
  isLoading,
}: ContractDetailDialogProps) {
  const [signature, setSignature] = useState<SignatureResult | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const cacheKey = useMemo(
    () => (contract ? pdfCacheKey(contract) : null),
    [contract]
  );

  useEffect(() => {
    if (!contract || !open) {
      setPdfUrl(null);
      return;
    }
    const url = getContractPdfUrl(contract);
    setPdfUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [contract, open, cacheKey]);

  if (!contract) return null;

  const defaultName =
    role === "student"
      ? contract.student?.fullName ?? ""
      : contract.company?.companyName ?? "";

  const canStudentSign =
    role === "student" && contract.status === "pending_student" && onSign;
  const canCompanySign =
    role === "company" &&
    (contract.status === "draft" || contract.status === "pending_company") &&
    onSign;
  const canDecline = role === "student" && contract.status === "pending_student" && onDecline;
  const canVoid =
    role === "company" &&
    contract.status !== "signed" &&
    contract.status !== "void" &&
    onVoid;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setSignature(null);
        onOpenChange(v);
      }}
    >
      <DialogContent className="flex max-h-[92vh] max-w-4xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <div className="flex items-start justify-between gap-3 pr-6">
            <div className="min-w-0">
              <DialogTitle className="text-left leading-snug truncate">
                {contract.title}
              </DialogTitle>
              <p className="mt-1 text-xs text-muted-foreground">PDF document preview</p>
            </div>
            <ContractStatusBadge status={contract.status} className="shrink-0" />
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="border-b bg-muted/30 p-4">
            {pdfUrl ? (
              <div className="overflow-hidden rounded-lg border border-border/60 bg-white shadow-sm">
                <iframe
                  src={`${pdfUrl}#toolbar=0&navpanes=0`}
                  title={`Contract PDF: ${contract.title}`}
                  className="h-[min(520px,55vh)] w-full"
                />
              </div>
            ) : (
              <div className="flex h-[min(520px,55vh)] items-center justify-center rounded-lg border border-dashed bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg gap-1.5"
                onClick={() => downloadContractPdf(contract)}
              >
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </Button>
              {pdfUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-lg gap-1.5"
                  asChild
                >
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open in new tab
                  </a>
                </Button>
              )}
            </div>
          </div>

          {(canStudentSign || canCompanySign) && (
            <div className="border-b border-primary/10 bg-primary/5 px-6 py-4">
              <p className="mb-3 text-sm font-medium">
                {canCompanySign ? "Sign and send to student" : "Sign to accept this contract"}
              </p>
              <SignaturePad defaultName={defaultName} onSignatureChange={setSignature} />
            </div>
          )}

          <div className="flex flex-wrap gap-2 px-6 py-4">
            {(canStudentSign || canCompanySign) && (
              <Button
                className="rounded-lg"
                disabled={!signature || isLoading}
                onClick={() => signature && onSign?.(signature)}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {canCompanySign ? "Sign & send" : "Sign contract"}
              </Button>
            )}
            {canDecline && (
              <Button
                variant="outline"
                className="rounded-lg"
                disabled={isLoading}
                onClick={onDecline}
              >
                Decline
              </Button>
            )}
            {canVoid && (
              <Button
                variant="ghost"
                className="rounded-lg text-destructive"
                disabled={isLoading}
                onClick={onVoid}
              >
                Void contract
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
