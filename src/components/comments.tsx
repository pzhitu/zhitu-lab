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
    <form onSubmit={handleSubmit} className={`${parentId ? "mt-3 pl-4 border-l-2 border-warm-200 dark:border-warm-800" : "mt-6"}`}>
      {replyTo && <p className="text-xs text-subtle dark:text-subtle-dark mb-2">回复 @{replyTo}</p>}
      <div className="flex gap-3 mb-2">
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="昵称 *"
          maxLength={50}
          required
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-white dark:bg-[var(--color-surface-dark)] text-text dark:text-text-dark placeholder-subtle dark:placeholder-subtle-dark focus:outline-none focus:border-warm-400 transition-colors"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="邮箱（选填）"
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-white dark:bg-[var(--color-surface-dark)] text-text dark:text-text-dark placeholder-subtle dark:placeholder-subtle-dark focus:outline-none focus:border-warm-400 transition-colors"
        />
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentId ? "写下你的回复…" : "写下你的评论…"}
        maxLength={2000}
        required
        rows={3}
        className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-white dark:bg-[var(--color-surface-dark)] text-text dark:text-text-dark placeholder-subtle dark:placeholder-subtle-dark focus:outline-none focus:border-warm-400 transition-colors resize-y"
      />
      <div className="flex items-center gap-2 mt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-1.5 text-sm font-medium rounded-md bg-warm-500 hover:bg-warm-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "提交中…" : "提交"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-sm text-subtle dark:text-subtle-dark hover:text-text dark:hover:text-text-dark transition-colors">
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
  replyingTo,
  submitting,
}: {
  comment: CommentData
  slug: string
  onNewReply: (data: { nickname: string; email: string; content: string; parent_id: number | null }) => void
  replyingTo: number | null
  submitting: boolean
}) {
  const [showReplyForm, setShowReplyForm] = useState(false)

  return (
    <div className="group">
      <div className="flex items-start gap-3 py-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-warm-100 dark:bg-warm-900 flex items-center justify-center text-sm font-medium text-warm-700 dark:text-warm-300">
          {comment.nickname.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-text dark:text-text-dark">{comment.nickname}</span>
            <span className="text-xs text-subtle dark:text-subtle-dark">{formatTime(comment.created_at)}</span>
          </div>
          <p className="mt-1 text-sm text-text dark:text-text-dark leading-relaxed whitespace-pre-wrap">{comment.content}</p>
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="mt-1 text-xs text-subtle dark:text-subtle-dark hover:text-warm-600 dark:hover:text-warm-400 transition-colors"
          >
            回复
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

      {/* 嵌套回复 */}
      {comment.replies.length > 0 && (
        <div className="ml-5 pl-4 border-l border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} slug={slug} onNewReply={onNewReply} replyingTo={replyingTo} submitting={submitting} />
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
        setError(err.error || "提交失败")
        return
      }
      // 重新拉取评论
      await fetchComments()
    } catch {
      setError("网络错误，请稍后重试")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-12 pt-8 border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
      <h3 className="text-lg font-serif font-semibold text-text dark:text-text-dark mb-4">
        评论 ({comments.length})
      </h3>

      {/* 评论列表 */}
      {loading ? (
        <p className="text-sm text-subtle dark:text-subtle-dark">加载中…</p>
      ) : (
        <div className="divide-y divide-[var(--color-border)] dark:divide-[var(--color-border-dark)]">
          {comments.length === 0 && (
            <p className="text-sm text-subtle dark:text-subtle-dark py-4">还没有评论，来写第一条吧。</p>
          )}
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} slug={slug} onNewReply={handleSubmit} replyingTo={null} submitting={submitting} />
          ))}
        </div>
      )}

      {/* 错误 */}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {/* 新评论表单 */}
      <CommentForm slug={slug} parentId={null} onSubmit={handleSubmit} submitting={submitting} />
    </section>
  )
}
