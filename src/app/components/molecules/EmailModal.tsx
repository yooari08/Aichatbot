import { useState } from "react";
import { Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageText: string;
};

export function EmailModal({ open, onOpenChange, messageText }: Props) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("사내 챗봇 답변 공유");
  const [body, setBody] = useState(
    `안녕하세요,\n\n사내 챗봇에서 확인한 내용을 공유드립니다.\n\n[챗봇 답변]\n${messageText}\n\n위 내용 참고 부탁드립니다.\n\n감사합니다.`
  );

  const handleOpen = (next: boolean) => {
    if (!next) {
      setTo("");
      setSubject("사내 챗봇 답변 공유");
    }
    onOpenChange(next);
  };

  const handleSend = () => {
    window.alert(`이메일이 전송되었습니다.\n받는 사람: ${to}`);
    handleOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="size-4 text-[#2563EB]" />
            이메일로 공유
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email-to" className="text-[13px] font-medium">
              받는 사람
            </Label>
            <Input
              id="email-to"
              type="email"
              placeholder="example@company.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email-subject" className="text-[13px] font-medium">
              제목
            </Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email-body" className="text-[13px] font-medium">
              내용
            </Label>
            <Textarea
              id="email-body"
              rows={9}
              className="text-[13px] leading-relaxed resize-none"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <p className="text-[11px] text-muted-foreground bg-[#F8F8F9] rounded-md px-3 py-2">
            위 내용을 검토 후 수정하여 전송하세요. 챗봇 답변을 메일 본문으로 활용할 수 있습니다.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpen(false)}>
            취소
          </Button>
          <Button onClick={handleSend} disabled={!to.trim()}>
            <Mail className="size-3.5 mr-1.5" />
            보내기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
