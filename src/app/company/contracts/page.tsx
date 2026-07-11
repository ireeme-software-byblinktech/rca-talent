"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileSignature, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { ContractCard } from "@/components/shared/ContractCard";
import { ContractDetailDialog } from "@/components/shared/ContractDetailDialog";
import { downloadContractPdf } from "@/lib/contractPdf";
import type { SignatureResult } from "@/components/shared/SignaturePad";
import { contactRequestsApi } from "@/lib/api/contactRequests";
import { contractsApi } from "@/lib/api/contracts";
import { jobsApi } from "@/lib/api/jobs";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/hooks/use-toast";
import type { ContractWithDetails } from "@/types";

const DEFAULT_TERMS = `This Employment Agreement ("Agreement") is entered into between the Employer and the Employee.

1. POSITION: Employee shall perform duties as described in this contract.

2. START DATE: Employment commences on the agreed start date.

3. COMPENSATION: As stated in this contract. Paid monthly via bank transfer.

4. CONFIDENTIALITY: Employee agrees to protect proprietary information.

5. TERMINATION: Either party may terminate with 30 days written notice.

By signing below, both parties agree to the terms of this Agreement.`;

const createSchema = z.object({
  studentId: z.string().min(1),
  jobId: z.string().optional(),
  title: z.string().min(5),
  role: z.string().min(2),
  startDate: z.string().min(1),
  compensation: z.string().min(2),
  terms: z.string().min(50),
});

type CreateForm = z.infer<typeof createSchema>;

export default function CompanyContractsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<ContractWithDetails | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const form = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { terms: DEFAULT_TERMS },
  });

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["company-contracts", user?.id],
    queryFn: () => contractsApi.getForCompany(user!.id),
    enabled: !!user,
  });

  const { data: candidates = [], isLoading: candidatesLoading } = useQuery({
    queryKey: ["company-candidates", user?.id],
    queryFn: () => contactRequestsApi.getAcceptedCandidates(user!.id),
    enabled: !!user,
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["company-jobs", user?.id],
    queryFn: () => jobsApi.getForCompany(user!.id),
    enabled: !!user,
  });

  const acceptedCandidates = candidates;

  const createMutation = useMutation({
    mutationFn: (data: CreateForm) =>
      contractsApi.create(user!.id, {
        studentId: data.studentId,
        jobId: data.jobId || undefined,
        title: data.title,
        role: data.role,
        startDate: data.startDate,
        compensation: data.compensation,
        terms: data.terms,
      }),
    onSuccess: (contract) => {
      queryClient.invalidateQueries({ queryKey: ["company-contracts"] });
      setCreateOpen(false);
      form.reset({ terms: DEFAULT_TERMS });
      contractsApi.getById(contract.id).then((c) => {
        if (c) {
          setSelected(c);
          setDetailOpen(true);
        }
      });
      toast({ title: "Contract drafted", description: "Sign and send to the student." });
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Could not create contract",
        description: err instanceof Error ? err.message : "Try again",
      });
    },
  });

  const signMutation = useMutation({
    mutationFn: ({
      contractId,
      sig,
    }: {
      contractId: string;
      sig: SignatureResult;
    }) => contractsApi.signAndSend(user!.id, contractId, sig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-contracts"] });
      toast({ title: "Contract sent", description: "The student can now sign digitally." });
      setDetailOpen(false);
      setSelected(null);
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Could not send contract",
        description: err instanceof Error ? err.message : "Try again",
      });
    },
  });

  const voidMutation = useMutation({
    mutationFn: (contractId: string) => contractsApi.voidContract(user!.id, contractId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-contracts"] });
      toast({ title: "Contract voided" });
      setDetailOpen(false);
      setSelected(null);
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Could not void contract",
        description: err instanceof Error ? err.message : "Try again",
      });
    },
  });

  const openContract = (contract: ContractWithDetails) => {
    setSelected(contract);
    setDetailOpen(true);
  };

  if (isLoading) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contracts"
        description="Create employment agreements and collect digital signatures"
      >
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full gap-2" disabled={candidatesLoading || acceptedCandidates.length === 0}>
              <Plus className="h-4 w-4" />
              New contract
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create employment contract</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={form.handleSubmit((d) => createMutation.mutate(d))}
              className="space-y-4"
            >
              <div>
                <Label>Candidate</Label>
                <Select
                  onValueChange={(v) => form.setValue("studentId", v)}
                  value={form.watch("studentId")}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select accepted candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    {acceptedCandidates.map((candidate) => (
                      <SelectItem key={candidate.userId} value={candidate.userId}>
                        {candidate.fullName}
                        {candidate.cohortYear
                          ? ` · Class of ${candidate.cohortYear}`
                          : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {acceptedCandidates.length === 0 && !candidatesLoading && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Accept a contact request first. Send one from a student profile in Find Talent.
                  </p>
                )}
              </div>
              <div>
                <Label>Related job (optional)</Label>
                <Select onValueChange={(v) => form.setValue("jobId", v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Link to job posting" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((j) => (
                      <SelectItem key={j.id} value={j.id}>
                        {j.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Contract title</Label>
                <Input
                  className="mt-1.5"
                  placeholder="Employment Agreement — Full-Stack Developer"
                  {...form.register("title")}
                />
              </div>
              <div>
                <Label>Role</Label>
                <Input className="mt-1.5" placeholder="Junior Developer" {...form.register("role")} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Start date</Label>
                  <Input type="date" className="mt-1.5" {...form.register("startDate")} />
                </div>
                <div>
                  <Label>Compensation</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="RWF 800,000 / month"
                    {...form.register("compensation")}
                  />
                </div>
              </div>
              <div>
                <Label>Terms & conditions</Label>
                <Textarea rows={8} className="mt-1.5 font-mono text-xs" {...form.register("terms")} />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending || candidatesLoading || acceptedCandidates.length === 0}
              >
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create draft
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {contracts.length === 0 ? (
        <EmptyState
          icon={<FileSignature className="h-8 w-8" />}
          title="No contracts yet"
          description={
            acceptedCandidates.length === 0
              ? "Accept a contact request from a student before sending contracts."
              : "Create an employment contract and send it for digital signature."
          }
          action={
            acceptedCandidates.length > 0
              ? { label: "New contract", onClick: () => setCreateOpen(true) }
              : undefined
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {contracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              variant="company"
              onView={() => openContract(contract)}
              onAction={() =>
                contract.status === "draft"
                  ? openContract(contract)
                  : downloadContractPdf(contract)
              }
              actionLabel={
                contract.status === "draft" ? "Sign & send" : "Download PDF"
              }
            />
          ))}
        </div>
      )}

      <ContractDetailDialog
        contract={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        role="company"
        isLoading={signMutation.isPending || voidMutation.isPending}
        onSign={(sig) =>
          selected && signMutation.mutate({ contractId: selected.id, sig })
        }
        onVoid={() => selected && voidMutation.mutate(selected.id)}
      />
    </div>
  );
}
