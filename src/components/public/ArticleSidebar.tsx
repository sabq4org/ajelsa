"use client";

import { AskTheArticle } from "./AskTheArticle";
import { KeyPoints } from "./KeyPoints";
import { ShareWidget } from "./ShareWidget";
import { ArticleStats } from "./ArticleStats";

interface Props {
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  articleContent: string;
  publishedAt: Date | null;
  readingTimeMinutes: number | null;
  viewCount: number;
  commentCount: number;
}

export function ArticleSidebar({
  articleId,
  articleTitle,
  articleSlug,
  articleContent,
  publishedAt,
  readingTimeMinutes,
  viewCount,
  commentCount,
}: Props) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      {/* النقاط الرئيسية — أهم شي للقارئ المستعجل */}
      <KeyPoints
        articleId={articleId}
        articleTitle={articleTitle}
        articleContent={articleContent}
      />

      {/* اسأل الخبر — الميزة النجمة */}
      <AskTheArticle
        articleTitle={articleTitle}
        articleContent={articleContent}
      />

      {/* معلومات الخبر */}
      <ArticleStats
        publishedAt={publishedAt}
        readingTimeMinutes={readingTimeMinutes}
        viewCount={viewCount}
        commentCount={commentCount}
      />

      {/* المشاركة */}
      <ShareWidget
        url={`/article/${articleSlug}`}
        title={articleTitle}
      />
    </aside>
  );
}
