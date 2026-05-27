import { type ChangeEvent, useEffect, useRef, useState } from 'react'
import { RefreshCw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/app/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/app/components/ui/table'
import { AdminTablePanel } from '@/app/components/organisms/AdminTablePanel'
import { StatusTag } from '@/app/components/atoms/StatusTag'
import { SearchInput } from '@/app/components/molecules/SearchInput'
import * as adminApi from '@/app/lib/api/admin'
import type { ApiDocument, DocumentStatus } from '@/app/lib/api/admin'
import type { StatusVariant } from '@/app/components/atoms/StatusTag'

const STATUS_LABEL: Record<DocumentStatus, string> = {
  done:       '색인 완료',
  processing: '처리 중',
  failed:     '색인 실패',
  pending:    '대기 중',
}

const STATUS_VARIANT: Record<DocumentStatus, StatusVariant> = {
  done:       'success',
  processing: 'warning',
  failed:     'danger',
  pending:    'gray',
}

function fileExt(path: string): string {
  return path.split('.').pop()?.toUpperCase() ?? '—'
}

import { formatIsoDate } from '@/app/lib/formatIsoDate'

export function DocumentsTable() {
  const [docs, setDocs]         = useState<ApiDocument[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const fetchDocs = async () => {
    setLoading(true)
    try {
      const data = await adminApi.listDocuments()
      setDocs(data)
    } catch {
      toast.error('문서 목록을 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void fetchDocs() }, [])

  const handleDelete = async (doc: ApiDocument) => {
    if (!confirm(`"${doc.file_name}" 문서를 삭제하시겠습니까?`)) return
    setDeleting(doc.id)
    try {
      await adminApi.deleteDocument(doc.id)
      setDocs((prev) => prev.filter((d) => d.id !== doc.id))
      toast.success('문서가 삭제되었습니다.')
    } catch {
      toast.error('문서 삭제에 실패했습니다.')
    } finally {
      setDeleting(null)
    }
  }

  const handleReindex = async (doc: ApiDocument) => {
    try {
      await adminApi.reindexDocument(doc.id)
      toast.success(`재색인이 요청되었습니다.`)
      await fetchDocs()
    } catch {
      toast.error('재색인 요청에 실패했습니다.')
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleUploadFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        await adminApi.uploadDocument({ file })
      }
      toast.success(`${files.length}개 문서를 업로드했습니다.`)
      await fetchDocs()
    } catch {
      toast.error('문서 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const rows = docs.filter((d) => {
    const q = search.toLowerCase()
    return (
      d.file_name.toLowerCase().includes(q) ||
      (d.category ?? '').toLowerCase().includes(q) ||
      (d.owner_name ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <AdminTablePanel
      title={`문서 목록 ${loading ? '' : `(${docs.length}건)`}`}
      actions={
        <>
          <SearchInput value={search} onChange={setSearch} placeholder="문서 검색…" className="w-[200px]" />
          <Button size="sm" variant="outline" onClick={fetchDocs} disabled={loading} className="gap-1.5">
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button
            size="sm"
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            onClick={handleUploadClick}
            disabled={uploading}
          >
            + 문서 추가
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept=".txt,.md,.csv,.json"
            onChange={(event) => void handleUploadFiles(event)}
          />
        </>
      }
    >
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-[#F8F8F9]">
          <TableRow className="border-[#E5E5E5]">
            {['문서명', '카테고리', '유형', '상태', '등록일', '담당자', ''].map((h) => (
              <TableHead key={h} className="text-[11px] font-semibold text-muted-foreground h-9 px-4">
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="border-[#F0F0F0]">
                {Array.from({ length: 7 }).map((__, j) => (
                  <TableCell key={j} className="px-4 py-3">
                    <div className="h-3 bg-[#F0F2F6] rounded animate-pulse w-3/4" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="px-4 py-10 text-center text-[12px] text-muted-foreground">
                {search ? '검색 결과가 없습니다.' : '등록된 문서가 없습니다.'}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((doc) => (
              <TableRow key={doc.id} className="border-[#F0F0F0] hover:bg-[#FAFAFA]">
                <TableCell className="px-4 py-3 font-medium text-foreground text-[12px]">{doc.file_name}</TableCell>
                <TableCell className="px-4 py-3 text-[12px] text-muted-foreground">{doc.category ?? '—'}</TableCell>
                <TableCell className="px-4 py-3 text-[12px] text-muted-foreground">{fileExt(doc.file_name)}</TableCell>
                <TableCell className="px-4 py-3">
                  <StatusTag label={STATUS_LABEL[doc.status]} variant={STATUS_VARIANT[doc.status]} />
                </TableCell>
                <TableCell className="px-4 py-3 text-[12px] text-muted-foreground">{formatIsoDate(doc.created_at)}</TableCell>
                <TableCell className="px-4 py-3 text-[12px] text-muted-foreground">{doc.owner_name ?? '—'}</TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Button variant="link" size="sm" className="h-auto p-0 text-[11px] text-[#2563EB]" onClick={() => handleReindex(doc)}>
                      재색인
                    </Button>
                    <Button variant="link" size="sm" className="h-auto p-0 text-[11px] text-destructive" disabled={deleting === doc.id} onClick={() => handleDelete(doc)}>
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </AdminTablePanel>
  )
}
