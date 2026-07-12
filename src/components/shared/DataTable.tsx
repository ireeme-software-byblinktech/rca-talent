"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  exportValue?: (row: T) => string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  emptyMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  exportable?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
}

type SortDir = "asc" | "desc" | null;

function exportToCsv<T>(columns: Column<T>[], rows: T[], filename: string) {
  const exportCols = columns.filter((c) => c.exportValue || c.key !== "actions");
  const headers = exportCols.map((c) => c.header).join(",");
  const body = rows
    .map((row) =>
      exportCols
        .map((c) => {
          const val = c.exportValue
            ? c.exportValue(row)
            : String(c.cell(row)).replace(/,/g, ";");
          return `"${val}"`;
        })
        .join(",")
    )
    .join("\n");
  const blob = new Blob([`${headers}\n${body}`], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  pageSize: defaultPageSize = 10,
  emptyMessage = "No data available",
  searchable = false,
  searchPlaceholder = "Search...",
  exportable = false,
  selectable = false,
  onSelectionChange,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = col.exportValue
          ? col.exportValue(row)
          : String(col.cell(row));
        return val.toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return filtered;
    return [...filtered].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginatedData = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc");
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toggleSelectAll = () => {
    if (selected.size === paginatedData.length) {
      setSelected(new Set());
      onSelectionChange?.([]);
    } else {
      const ids = new Set(paginatedData.map((r, i) => r.id ?? String(i)));
      setSelected(ids);
      onSelectionChange?.(paginatedData);
    }
  };

  const toggleSelect = (row: T, idx: number) => {
    const id = row.id ?? String(idx);
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
    onSelectionChange?.(
      data.filter((r, i) => next.has(r.id ?? String(i)))
    );
  };

  if (data.length === 0) {
    return (
      <div className="rounded-none border border-border/50 bg-card p-12 text-center text-muted-foreground shadow-card">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(searchable || exportable) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {searchable && (
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 bg-secondary border-0"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            {exportable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportToCsv(columns, sorted, `export-${Date.now()}.csv`)
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )}
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-28 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-none border border-border/50 bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="border-b-0 bg-primary hover:bg-primary">
              {selectable && (
                <TableHead className="w-10 text-primary-foreground">
                  <Checkbox
                    checked={
                      paginatedData.length > 0 &&
                      selected.size === paginatedData.length
                    }
                    onCheckedChange={toggleSelectAll}
                    className="border-primary-foreground data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary"
                  />
                </TableHead>
              )}
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className="rounded-none text-primary-foreground"
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className="flex items-center gap-1 font-semibold text-primary-foreground transition-colors hover:text-white/90"
                      onClick={() => toggleSort(col.key)}
                    >
                      {col.header}
                      {sortKey === col.key ? (
                        sortDir === "asc" ? (
                          <ArrowUp className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    <span className="font-semibold text-primary-foreground">
                      {col.header}
                    </span>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  No matching results
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, idx) => {
                const rowId = row.id ?? String(idx);
                return (
                  <TableRow
                    key={rowId}
                    className={cn(
                      "transition-colors",
                      selected.has(rowId) && "bg-primary/5"
                    )}
                  >
                    {selectable && (
                      <TableCell>
                        <Checkbox
                          checked={selected.has(rowId)}
                          onCheckedChange={() => toggleSelect(row, idx)}
                        />
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell key={col.key}>{col.cell(row)}</TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          Showing {(page - 1) * pageSize + 1}–
          {Math.min(page * pageSize, sorted.length)} of {sorted.length}
          {selected.size > 0 && ` · ${selected.size} selected`}
        </p>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(1)} disabled={page === 1}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="flex items-center px-3 text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(totalPages)} disabled={page === totalPages}>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
