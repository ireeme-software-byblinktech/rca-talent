"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, PenLine, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface SignatureResult {
  signerName: string;
  signatureData: string;
  method: "drawn" | "typed";
}

interface SignaturePadProps {
  defaultName?: string;
  onSignatureChange?: (result: SignatureResult | null) => void;
  className?: string;
}

export function SignaturePad({
  defaultName = "",
  onSignatureChange,
  className,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [signerName, setSignerName] = useState(defaultName);
  const [typedSignature, setTypedSignature] = useState(defaultName);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    setSignerName(defaultName);
    setTypedSignature(defaultName);
  }, [defaultName]);

  const emit = useCallback(
    (result: SignatureResult | null) => {
      onSignatureChange?.(result);
    },
    [onSignatureChange]
  );

  useEffect(() => {
    if (!signerName.trim()) {
      emit(null);
      return;
    }
    if (mode === "type" && typedSignature.trim()) {
      emit({
        signerName: signerName.trim(),
        signatureData: `typed:${typedSignature.trim()}`,
        method: "typed",
      });
    } else if (mode === "draw" && hasDrawn && canvasRef.current) {
      emit({
        signerName: signerName.trim(),
        signatureData: canvasRef.current.toDataURL("image/png"),
        method: "drawn",
      });
    } else {
      emit(null);
    }
  }, [mode, signerName, typedSignature, hasDrawn, emit]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#1A2B4B";
  }, [mode]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    drawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const endDraw = () => {
    drawing.current = false;
    if (hasDrawn && canvasRef.current && signerName.trim()) {
      emit({
        signerName: signerName.trim(),
        signatureData: canvasRef.current.toDataURL("image/png"),
        method: "drawn",
      });
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    emit(null);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <Label className="text-xs text-muted-foreground">Full legal name</Label>
        <Input
          className="mt-1.5"
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
          placeholder="Your full name"
        />
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as "draw" | "type")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="draw" className="gap-1.5 text-xs">
            <PenLine className="h-3.5 w-3.5" />
            Draw
          </TabsTrigger>
          <TabsTrigger value="type" className="gap-1.5 text-xs">
            <Type className="h-3.5 w-3.5" />
            Type
          </TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="mt-3">
          <div className="relative rounded-lg border border-border/60 bg-white">
            <canvas
              ref={canvasRef}
              className="h-36 w-full cursor-crosshair touch-none"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
            <div className="absolute bottom-2 left-3 text-[10px] text-muted-foreground pointer-events-none">
              Sign above
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-7 gap-1 text-xs"
              onClick={clearCanvas}
            >
              <Eraser className="h-3 w-3" />
              Clear
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="type" className="mt-3">
          <Input
            value={typedSignature}
            onChange={(e) => setTypedSignature(e.target.value)}
            placeholder="Type your signature"
            className="font-serif text-lg italic h-14"
          />
          <p className="mt-2 text-[10px] text-muted-foreground">
            Typed signatures are legally binding in this demo environment.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface SignatureDisplayProps {
  signature: {
    signerName: string;
    signedAt: string;
    signatureData: string;
    method: "drawn" | "typed";
  };
  label: string;
}

export function SignatureDisplay({ signature, label }: SignatureDisplayProps) {
  const isTyped = signature.method === "typed" || signature.signatureData.startsWith("typed:");
  const typedText = isTyped
    ? signature.signatureData.replace(/^typed:/, "")
    : signature.signerName;

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-2">
        {label}
      </p>
      <div className="flex min-h-[72px] items-center justify-center rounded-md border border-dashed border-border/50 bg-white px-4">
        {isTyped ? (
          <span className="font-serif text-2xl italic text-primary">{typedText}</span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={signature.signatureData}
            alt={`Signature of ${signature.signerName}`}
            className="max-h-16 max-w-full object-contain"
          />
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {signature.signerName} ·{" "}
        {new Intl.DateTimeFormat("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(signature.signedAt))}
      </p>
    </div>
  );
}
