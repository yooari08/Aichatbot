import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/app/components/ui/table";
import { Card } from "@/app/components/ui/card";
import { UserAvatar } from "@/app/components/atoms/UserAvatar";
import { StatusTag } from "@/app/components/atoms/StatusTag";
import { SearchInput } from "@/app/components/molecules/SearchInput";
import { USERS, ROLE_LABELS } from "@/app/constants/adminData";
import type { StatusVariant } from "@/app/components/atoms/StatusTag";

const ROLE_VARIANT: Record<string, StatusVariant> = {
  admin:  "danger",
  editor: "info",
  user:   "gray",
};

export function UsersTable() {
  const [search, setSearch] = useState("");

  const rows = USERS.filter(
    (u) =>
      u.name.includes(search) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.dept.includes(search)
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-foreground">사용자 목록</h2>
        <div className="flex gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder="사용자 검색…" className="w-[200px]" />
          <Button size="sm" className="bg-[#012DFF] hover:bg-[#0025d4] text-white">
            + 사용자 초대
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden gap-0">
        <Table>
          <TableHeader className="bg-[#F8F8F9]">
            <TableRow className="border-[#E5E5E5]">
              {["이름", "이메일", "역할", "부서", "최근 로그인", "질문 수", "상태", ""].map((h) => (
                <TableHead key={h} className="text-[11px] font-semibold text-muted-foreground h-9 px-4">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((user) => (
              <TableRow key={user.email} className="border-[#F0F0F0] hover:bg-[#FAFAFA]">
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar initials={user.name.slice(0, 2)} size="sm" />
                    <span className="text-[12px] font-medium text-foreground">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-[12px] text-muted-foreground">{user.email}</TableCell>
                <TableCell className="px-4 py-3">
                  <StatusTag
                    label={ROLE_LABELS[user.role].label}
                    variant={ROLE_VARIANT[user.role]}
                  />
                </TableCell>
                <TableCell className="px-4 py-3 text-[12px] text-muted-foreground">{user.dept}</TableCell>
                <TableCell className="px-4 py-3 text-[12px] text-muted-foreground">{user.lastLogin}</TableCell>
                <TableCell className="px-4 py-3 text-[12px] text-muted-foreground">{user.qCount}</TableCell>
                <TableCell className="px-4 py-3">
                  <StatusTag
                    label={user.active ? "활성" : "비활성"}
                    variant={user.active ? "success" : "gray"}
                  />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Button variant="link" size="sm" className="h-auto p-0 text-[11px] text-[#012DFF]">
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
