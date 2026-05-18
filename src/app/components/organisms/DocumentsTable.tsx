import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/app/components/ui/table";
import { Card } from "@/app/components/ui/card";
import { StatusTag } from "@/app/components/atoms/StatusTag";
import { SearchInput } from "@/app/components/molecules/SearchInput";
import { DOCUMENTS, STATUS_LABELS } from "@/app/constants/adminData";
import type { StatusVariant } from "@/app/components/atoms/StatusTag";

const STATUS_VARIANT: Record<string, StatusVariant> = {
  done:       "success",
  processing: "warning",
  failed:     "danger",
};

export function DocumentsTable() {
  const [search, setSearch] = useState("");

  const rows = DOCUMENTS.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.cat.includes(search) ||
      d.owner.includes(search)
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-foreground">문서 목록</h2>
        <div className="flex gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder="문서 검색…" className="w-[200px]" />
          <Button size="sm" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
            + 문서 추가
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden gap-0">
        <Table>
          <TableHeader className="bg-[#F8F8F9]">
            <TableRow className="border-[#E5E5E5]">
              {["문서명", "카테고리", "유형", "버전", "상태", "등록일", "담당자", ""].map((h) => (
                <TableHead key={h} className="text-[11px] font-semibold text-muted-foreground h-9 px-4">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((doc) => (
              <TableRow key={doc.name} className="border-[#F0F0F0] hover:bg-[#FAFAFA]">
                <TableCell className="px-4 py-3 font-medium text-foreground text-[12px]">
                  {doc.name}
                </TableCell>
                <TableCell className="px-4 py-3 text-[12px] text-muted-foreground">{doc.cat}</TableCell>
                <TableCell className="px-4 py-3 text-[12px] text-muted-foreground">{doc.type}</TableCell>
                <TableCell className="px-4 py-3 text-[12px] text-muted-foreground">{doc.ver}</TableCell>
                <TableCell className="px-4 py-3">
                  <StatusTag
                    label={STATUS_LABELS[doc.status].label}
                    variant={STATUS_VARIANT[doc.status]}
                  />
                </TableCell>
                <TableCell className="px-4 py-3 text-[12px] text-muted-foreground">{doc.date}</TableCell>
                <TableCell className="px-4 py-3 text-[12px] text-muted-foreground">{doc.owner}</TableCell>
                <TableCell className="px-4 py-3">
                  <Button variant="link" size="sm" className="h-auto p-0 text-[11px] text-[#2563EB]">
                    편집
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
