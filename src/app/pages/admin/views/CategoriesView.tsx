import { useCallback, useEffect, useRef, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/app/components/ui/button'
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
import * as adminApi from '@/app/lib/api/admin'
import type { CategorySummary } from '@/app/lib/api/admin'

const NONE_VALUE = '__none__'

export const CategoriesView = () => {
  const [categories, setCategories] = useState<CategorySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [unclassifiedCount, setUnclassifiedCount] = useState(0)

  // 인라인 수정 상태
  const [editing, setEditing] = useState<{ name: string; value: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const editRef = useRef<HTMLInputElement>(null)

  // 새 카테고리 입력 상태
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const newInputRef = useRef<HTMLInputElement>(null)

  // 삭제 다이얼로그 상태
  const [deleteTarget, setDeleteTarget] = useState<CategorySummary | null>(null)
  const [reassignTo, setReassignTo] = useState(NONE_VALUE)
  const [deleting, setDeleting] = useState(false)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.listCategories()
      setCategories(data)
    } catch {
      toast.error('카테고리 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUnclassified = useCallback(async () => {
    try {
      const docs = await adminApi.listDocuments()
      setUnclassifiedCount(docs.filter((d) => d.category === null).length)
    } catch {
      // 배너는 보조 정보이므로 실패 시 무시
    }
  }, [])

  useEffect(() => {
    void fetchCategories()
    void fetchUnclassified()
  }, [fetchCategories, fetchUnclassified])

  useEffect(() => {
    if (editing) editRef.current?.focus()
  }, [editing])

  useEffect(() => {
    if (isAdding) newInputRef.current?.focus()
  }, [isAdding])

  const handleStartEdit = useCallback((cat: CategorySummary) => {
    setEditing({ name: cat.name, value: cat.name })
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditing(null)
  }, [])

  const handleSaveEdit = useCallback(async () => {
    if (!editing) return
    const trimmed = editing.value.trim()
    if (!trimmed || trimmed === editing.name) {
      setEditing(null)
      return
    }
    setSaving(true)
    try {
      await adminApi.renameCategory(editing.name, trimmed)
      setCategories((prev) =>
        prev.map((c) => (c.name === editing.name ? { ...c, name: trimmed } : c)),
      )
      toast.success('카테고리 이름이 변경되었습니다.')
      setEditing(null)
    } catch {
      toast.error('이름 변경에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }, [editing])

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') void handleSaveEdit()
      if (e.key === 'Escape') handleCancelEdit()
    },
    [handleSaveEdit, handleCancelEdit],
  )

  const handleOpenDelete = useCallback((cat: CategorySummary) => {
    setDeleteTarget(cat)
    setReassignTo(NONE_VALUE)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const target = reassignTo === NONE_VALUE ? undefined : reassignTo
      await adminApi.deleteCategory(deleteTarget.name, target)
      setCategories((prev) => prev.filter((c) => c.name !== deleteTarget.name))
      toast.success('카테고리가 삭제되었습니다.')
      setDeleteTarget(null)
      void fetchUnclassified()
    } catch {
      toast.error('카테고리 삭제에 실패했습니다.')
    } finally {
      setDeleting(false)
    }
  }, [deleteTarget, reassignTo, fetchUnclassified])

  const handleStartAdd = useCallback(() => {
    setIsAdding(true)
    setNewName('')
  }, [])

  const handleAddKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setIsAdding(false)
        setNewName('')
        return
      }
      if (e.key === 'Enter') {
        const trimmed = newName.trim()
        if (!trimmed) return
        setAdding(true)
        try {
          const created = await adminApi.createCategory(trimmed)
          setCategories((prev) => [created, ...prev])
          setIsAdding(false)
          setNewName('')
          toast.success('카테고리가 추가되었습니다.')
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : ''
          toast.error(
            msg.includes('409') ? '이미 존재하는 카테고리입니다.' : '카테고리 추가에 실패했습니다.',
          )
        } finally {
          setAdding(false)
        }
      }
    },
    [newName],
  )

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-1">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-[#F0F2F6] rounded animate-pulse w-36" />
          <div className="h-8 bg-[#F0F2F6] rounded animate-pulse w-28" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E5E5E5] p-4 flex flex-col gap-2">
              <div className="h-4 bg-[#F0F2F6] rounded animate-pulse w-3/4" />
              <div className="h-3 bg-[#F0F2F6] rounded animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 h-full min-h-0 overflow-y-auto py-1">
      {/* 헤더 */}
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-[16px] font-bold text-foreground">
          카테고리 설정 ({categories.length}개)
        </h2>
        <Button
          size="sm"
          onClick={handleStartAdd}
          disabled={isAdding}
          className="gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white h-8 text-[12px]"
        >
          <Plus className="size-3.5" />
          카테고리 추가
        </Button>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-3 gap-4">
        {/* 새 카테고리 입력 카드 */}
        {isAdding && (
          <div className="bg-white rounded-xl border-2 border-[#2563EB] p-4 flex flex-col gap-2">
            <input
              ref={newInputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => void handleAddKeyDown(e)}
              placeholder="카테고리 이름 입력…"
              disabled={adding}
              className="text-[13px] font-bold text-foreground bg-transparent border-b border-[#E5E5E5] outline-none pb-1 focus:border-[#2563EB] transition-colors"
            />
            <span className="text-[11px] text-muted-foreground">Enter로 저장, Esc로 취소</span>
          </div>
        )}

        {/* 기존 카테고리 카드 */}
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="bg-white rounded-xl border border-[#E5E5E5] p-4 flex flex-col gap-2 hover:border-[#D1D5DB] transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              {editing?.name === cat.name ? (
                <input
                  ref={editRef}
                  value={editing.value}
                  onChange={(e) => setEditing({ name: cat.name, value: e.target.value })}
                  onKeyDown={handleEditKeyDown}
                  onBlur={handleCancelEdit}
                  disabled={saving}
                  className="flex-1 text-[13px] font-bold text-foreground bg-transparent border-b border-[#2563EB] outline-none pb-0.5 transition-colors min-w-0"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => handleStartEdit(cat)}
                  className="flex-1 text-left text-[13px] font-bold text-foreground hover:text-[#2563EB] transition-colors truncate"
                >
                  {cat.name}
                </button>
              )}
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleStartEdit(cat)}
                  title="이름 변경"
                  className="p-1.5 rounded hover:bg-[#F3F4F6] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenDelete(cat)}
                  title="삭제"
                  className="p-1.5 rounded hover:bg-[#FEE2E2] text-muted-foreground hover:text-[#991B1B] transition-colors"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </div>
            <p className="text-[12px] text-muted-foreground">문서 {cat.document_count}건</p>
          </div>
        ))}
      </div>

      {/* 미분류 배너 */}
      {unclassifiedCount > 0 && (
        <div className="shrink-0 rounded-lg bg-[#F3F4F6] border border-[#E5E5E5] px-4 py-3 text-[12px] text-[#6B7280]">
          미분류 문서:{' '}
          <span className="font-semibold text-foreground">{unclassifiedCount}건</span>
          {' '}— 카테고리가 지정되지 않은 문서입니다.
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>카테고리 삭제</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-[13px] text-muted-foreground space-y-1">
                <p>
                  <span className="font-semibold text-foreground">{deleteTarget?.name}</span>{' '}
                  카테고리를 삭제합니다.
                </p>
                {(deleteTarget?.document_count ?? 0) > 0 && (
                  <p>
                    이 카테고리의 문서{' '}
                    <span className="font-semibold text-foreground">{deleteTarget?.document_count}건</span>은
                    아래에서 선택한 카테고리로 재분류됩니다.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="px-0 py-2 flex flex-col gap-1.5">
            <p className="text-[12px] text-muted-foreground">재분류할 카테고리</p>
            <Select value={reassignTo} onValueChange={setReassignTo}>
              <SelectTrigger className="h-8 text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE} className="text-[12px]">
                  선택 안 함 (미분류)
                </SelectItem>
                {categories
                  .filter((c) => c.name !== deleteTarget?.name)
                  .map((c) => (
                    <SelectItem key={c.name} value={c.name} className="text-[12px]">
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

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
    </div>
  )
}
