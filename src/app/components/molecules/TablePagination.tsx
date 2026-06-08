import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/app/components/ui/button'

type Props = {
  page: number          // 1-based
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function TablePagination({ page, pageSize, total, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = Math.min((page - 1) * pageSize + 1, total)
  const to   = Math.min(page * pageSize, total)

  if (total === 0) return null

  return (
    <div className="flex items-center justify-between border-t border-[#E5E5E5] px-4 py-2.5">
      <span className="text-[11px] text-muted-foreground">
        {from}–{to} / {total}건
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="px-1.5 text-[12px] text-muted-foreground">
          {page} / {totalPages}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
