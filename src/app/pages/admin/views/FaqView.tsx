import { useCallback, useEffect, useState } from 'react'
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Switch } from '@/app/components/ui/switch'
import { Textarea } from '@/app/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table'
import { AdminTablePanel } from '@/app/components/organisms/AdminTablePanel'
import * as adminApi from '@/app/lib/api/admin'
import type { FaqEntry } from '@/app/lib/api/admin'

const ALL_CATEGORY = '__all__'

const formatDate = (iso: string): string => iso.slice(0, 10)

interface FaqForm {
  question: string
  answer: string
  category: string
  display_order: number
  is_active: boolean
}

const DEFAULT_FORM: FaqForm = {
  question: '',
  answer: '',
  category: '',
  display_order: 0,
  is_active: true,
}

const formFromEntry = (faq: FaqEntry): FaqForm => ({
  question: faq.question,
  answer: faq.answer,
  category: faq.category ?? '',
  display_order: faq.display_order,
  is_active: faq.is_active,
})

export const FaqView = () => {
  const [faqs, setFaqs] = useState<FaqEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORY)
  const [activeOnly, setActiveOnly] = useState(false)

  // 추가/수정 다이얼로그
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<FaqEntry | null>(null)
  const [form, setForm] = useState<FaqForm>(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)

  // 삭제 다이얼로그
  const [deleteTarget, setDeleteTarget] = useState<FaqEntry | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchFaqs = useCallback(async (cat: string, active: boolean) => {
    setLoading(true)
    try {
      const data = await adminApi.listFaqs({
        category: cat === ALL_CATEGORY ? undefined : cat,
        is_active: active ? true : undefined,
      })
      setFaqs(data)
    } catch {
      toast.error('FAQ 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchFaqs(categoryFilter, activeOnly)
  }, [fetchFaqs, categoryFilter, activeOnly])

  // 카테고리 목록은 현재 FAQ 목록에서 파생
  const categories = [...new Set(
    faqs.map((f) => f.category).filter((c): c is string => c !== null),
  )]

  const handleCategoryFilterChange = useCallback((v: string) => {
    setCategoryFilter(v)
  }, [])

  const handleActiveToggle = useCallback((checked: boolean) => {
    setActiveOnly(checked)
  }, [])

  const handleOpenCreate = useCallback(() => {
    setEditTarget(null)
    setForm(DEFAULT_FORM)
    setDialogOpen(true)
  }, [])

  const handleOpenEdit = useCallback((faq: FaqEntry) => {
    setEditTarget(faq)
    setForm(formFromEntry(faq))
    setDialogOpen(true)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast.error('질문과 답변을 입력해주세요.')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        question: form.question.trim(),
        answer: form.answer.trim(),
        category: form.category.trim() || null,
        display_order: form.display_order,
        is_active: form.is_active,
      }
      if (editTarget) {
        const updated = await adminApi.updateFaq(editTarget.id, payload)
        setFaqs((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
        toast.success('FAQ가 수정되었습니다.')
      } else {
        const created = await adminApi.createFaq(payload)
        setFaqs((prev) => [created, ...prev])
        toast.success('FAQ가 추가되었습니다.')
      }
      setDialogOpen(false)
    } catch {
      toast.error('저장에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }, [form, editTarget])

  const handleOpenDelete = useCallback((faq: FaqEntry) => {
    setDeleteTarget(faq)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminApi.deleteFaq(deleteTarget.id)
      setFaqs((prev) => prev.filter((f) => f.id !== deleteTarget.id))
      toast.success('FAQ가 삭제되었습니다.')
      setDeleteTarget(null)
    } catch {
      toast.error('삭제에 실패했습니다.')
    } finally {
      setDeleting(false)
    }
  }, [deleteTarget])

  const handleToggle = useCallback(async (faq: FaqEntry) => {
    // 낙관적 업데이트
    setFaqs((prev) =>
      prev.map((f) => (f.id === faq.id ? { ...f, is_active: !f.is_active } : f)),
    )
    try {
      const updated = await adminApi.toggleFaq(faq.id)
      setFaqs((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
    } catch {
      // 실패 시 원복
      setFaqs((prev) => prev.map((f) => (f.id === faq.id ? faq : f)))
      toast.error('상태 변경에 실패했습니다.')
    }
  }, [])

  return (
    <>
      <AdminTablePanel
        title={`FAQ ${loading ? '' : `(${faqs.length}건)`}`}
        actions={
          <>
            <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
              <SelectTrigger className="h-8 w-[160px] text-[12px]">
                <SelectValue placeholder="카테고리 전체" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORY} className="text-[12px]">전체</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c} className="text-[12px]">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1.5">
              <Switch
                id="faq-active-only"
                checked={activeOnly}
                onCheckedChange={handleActiveToggle}
                className="scale-90"
              />
              <Label
                htmlFor="faq-active-only"
                className="text-[12px] text-muted-foreground cursor-pointer select-none"
              >
                활성만
              </Label>
            </div>

            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-8 text-[12px]"
            >
              <Plus className="size-3.5" />
              FAQ 추가
            </Button>
          </>
        }
      >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-[#F8F8F9]">
            <TableRow className="border-[#E5E5E5]">
              {['순서', '질문', '카테고리', '상태', '작성일', '액션'].map((h) => (
                <TableHead
                  key={h}
                  className="text-[11px] font-semibold text-muted-foreground h-9 px-4"
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-[#F0F0F0]">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j} className="px-4 py-3">
                      <div className="h-3 bg-[#F0F2F6] rounded animate-pulse w-3/4" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : faqs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-4 py-10 text-center text-[12px] text-muted-foreground"
                >
                  등록된 FAQ가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              faqs.map((faq) => (
                <TableRow key={faq.id} className="border-[#F0F0F0] hover:bg-[#FAFAFA]">
                  <TableCell className="px-4 py-3 text-[12px] text-muted-foreground w-[56px]">
                    {faq.display_order}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[12px] font-medium text-foreground max-w-[260px] truncate">
                    {faq.question}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[12px] text-muted-foreground">
                    {faq.category ?? '—'}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        faq.is_active
                          ? 'bg-[#D1FAE5] text-[#065F46]'
                          : 'bg-[#F3F4F6] text-[#6B7280]'
                      }`}
                    >
                      {faq.is_active ? '활성' : '비활성'}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[12px] text-muted-foreground whitespace-nowrap">
                    {formatDate(faq.created_at)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => void handleToggle(faq)}
                        title={faq.is_active ? '비활성화' : '활성화'}
                        className="p-1.5 rounded hover:bg-[#F3F4F6] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {faq.is_active
                          ? <Eye className="size-3.5" />
                          : <EyeOff className="size-3.5" />
                        }
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(faq)}
                        title="수정"
                        className="p-1.5 rounded hover:bg-[#F3F4F6] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDelete(faq)}
                        title="삭제"
                        className="p-1.5 rounded hover:bg-[#FEE2E2] text-muted-foreground hover:text-[#991B1B] transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminTablePanel>

      {/* FAQ 추가 / 수정 다이얼로그 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'FAQ 수정' : 'FAQ 추가'}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* 질문 */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px]">
                질문 <span className="text-[#DC2626]">*</span>
              </Label>
              <Textarea
                value={form.question}
                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                maxLength={500}
                placeholder="질문을 입력하세요"
                className="text-[13px] resize-none"
                rows={2}
              />
              <span className="text-[11px] text-muted-foreground text-right">
                {form.question.length}/500
              </span>
            </div>

            {/* 답변 */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px]">
                답변 <span className="text-[#DC2626]">*</span>
              </Label>
              <Textarea
                value={form.answer}
                onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                maxLength={2000}
                placeholder="답변을 입력하세요"
                className="text-[13px] resize-none"
                rows={6}
              />
              <span className="text-[11px] text-muted-foreground text-right">
                {form.answer.length}/2000
              </span>
            </div>

            {/* 카테고리 + 순서 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[12px]">카테고리</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="선택 사항"
                  className="text-[13px] h-8"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[12px]">노출 순서</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.display_order}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, display_order: parseInt(e.target.value, 10) || 0 }))
                  }
                  className="text-[13px] h-8"
                />
              </div>
            </div>

            {/* 활성 여부 */}
            <div className="flex items-center gap-2">
              <Switch
                id="faq-dialog-active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, is_active: checked }))}
              />
              <Label htmlFor="faq-dialog-active" className="text-[12px] cursor-pointer">
                활성화 상태로 저장
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
            >
              취소
            </Button>
            <Button
              size="sm"
              onClick={() => void handleSubmit()}
              disabled={submitting}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            >
              {submitting ? '저장 중…' : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>FAQ 삭제</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-[13px] text-muted-foreground space-y-1">
                <p>이 FAQ를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
                {deleteTarget && (
                  <p className="font-semibold text-foreground truncate">
                    Q: {deleteTarget.question}
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleConfirmDelete()}
              disabled={deleting}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white"
            >
              {deleting ? '삭제 중…' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
