"use client"

import { useState, useEffect, useCallback } from "react"

interface CommentData {
  id: number
  slug: string
  parent_id: number | null
  nickname: string
  content: string
  approved: boolean
  created_at: string
  replies: CommentData[]
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "刚刚"
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 30) return `${days} 天前`
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })
}

function CommentForm({
  slug,
  parentId,
  replyTo,
  onCancel,
  onSubmit,
  submitting,
}: {
  slug: string
  parentId: number | null
  replyTo?: string
  onCancel?: () => void
  onSubmit: (data: { nickname: string; email: string; content: string; parent_id: number | null }) => void
  submitting: boolean
}) {
  const [nickname, setNickname] = useState("")
  const [email, setEmail] = useState("")
  const [content, setContent] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim() || !content.trim()) return
    onSubmit({ nickname: nickname.trim(), email: email.trim(), content: content.trim(), parent_id: parentId })
    setContent("")
  }

  return (
    <form onSubmit={handleSubmit} className={`${parentId ? "mt-3 pl-4 border-l-2 border-amber-200 dark:border-amber-900" : "mt-5"}`}>
      {replyTo && (
        <p className="text-[11px] text-ink-faint dark:text-ink-faint-dark mb-2">
          回复 @{replyTo}
        </p>
      )}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="署名"
            maxLength={50}
            required
            className="flex-1 px-2.5 py-1.5 text-sm rounded-sm border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-white dark:bg-[var(--color-surface-dark)] text-ink dark:text-ink-dark placeholder:text-ink-faint dark:placeholder:text-ink-faint-dark focus:outline-none focus:border-accent transition-colors"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="邮箱（选填）"
            className="flex-1 px-2.5 py-1.5 text-sm rounded-sm border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-white dark:bg-[var(--color-surface-dark)] text-ink dark:text-ink-dark placeholder:text-ink-faint dark:placeholder:text-ink-faint-dark focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentId ? "回复…" : "翻阅后，留句话…"}
          maxLength={2000}
          required
          rows={3}
          className="w-full px-2.5 py-1.5 text-sm rounded-sm border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-white dark:bg-[var(--color-surface-dark)] text-ink dark:text-ink-dark placeholder:text-ink-faint dark:placeholder:text-ink-faint-dark focus:outline-none focus:border-accent transition-colors resize-y"
        />
      </div>
      <div className="flex items-center gap-2 mt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-3 py-1 text-[13px] font-medium rounded-sm bg-accent hover:bg-accent-light text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "…" : "留言"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-[13px] text-ink-faint dark:text-ink-faint-dark hover:text-ink-subtle transition-colors"
          >
            取消
          </button>
        )}
      </div>
    </form>
  )
}

function CommentItem({
  comment,
  slug,
  onNewReply,
  submitting,
}: {
  comment: CommentData
  slug: string
  onNewReply: (data: { nickname: string; email: string; content: string; parent_id: number | null }) => void
  submitting: boolean
}) {
  const [showReplyForm, setShowReplyForm] = useState(false)

  return (
    <div className="group">
      <div className="flex items-start gap-3 py-3">
        <div
          className="shrink-0 w-7 h-7 rounded-sm flex items-center justify-center text-[11px] font-medium"
          style={{
            background: "var(--color-accent-soft)",
            color: "var(--color-accent)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {comment.nickname.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-medium text-ink dark:text-ink-dark">
              {comment.nickname}
            </span>
            <span className="text-[11px] text-ink-faint dark:text-ink-faint-dark">
              · {formatTime(comment.created_at)}
            </span>
          </div>
          <p className="mt-0.5 text-[14px] text-ink dark:text-ink-dark leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="mt-1 text-[11px] text-ink-faint dark:text-ink-faint-dark hover:text-accent dark:hover:text-accent-light transition-colors"
          >
            {showReplyForm ? "收起" : "回复"}
          </button>

          {showReplyForm && (
            <CommentForm
              slug={slug}
              parentId={comment.id}
              replyTo={comment.nickname}
              onCancel={() => setShowReplyForm(false)}
              onSubmit={(data) => {
                onNewReply(data)
                setShowReplyForm(false)
              }}
              submitting={submitting}
            />
          )}
        </div>
      </div>

      {comment.replies.length > 0 && (
        <div className="ml-4 pl-4 border-l border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              slug={slug}
              onNewReply={onNewReply}
              submitting={submitting}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<CommentData[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const fetchComments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
      const data = await res.json()
      setComments(data.comments || [])
    } catch {
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmit = async (data: { nickname: string; email: string; content: string; parent_id: number | null }) => {
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, ...data }),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "留言失败")
        return
      }
      await fetchComments()
    } catch {
      setError("网络错误，请稍后重试")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      {loading ? (
        <p className="text-[13px] text-ink-faint dark:text-ink-faint-dark py-4">
          正在翻开…
        </p>
      ) : (
        <div className="divide-y divide-[var(--color-border)] dark:divide-[var(--color-border-dark)]">
          {comments.length === 0 && (
            <p className="text-[13px] text-ink-faint dark:text-ink-faint-dark py-4">
              还没有留言。来做第一个翻阅它的人吧。
            </p>
          )}
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              slug={slug}
              onNewReply={handleSubmit}
              submitting={submitting}
            />
          ))}
        </div>
      )}

      {error && (
        <p className="mt-2 text-[12px]" style={{ color: "#dc2626" }}>
          {error}
        </p>
      )}

      <CommentForm
        slug={slug}
        parentId={null}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  )
}
