import { ExternalLink, X } from "lucide-react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

import type { ArticleRow } from "~/components/ArticleGrid"

interface ArticleSheetProps {
  article: ArticleRow | null
  onClose: () => void
}

export function ArticleSheet({ article, onClose }: ArticleSheetProps) {
  return (
    <Sheet open={!!article} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-[52vw] max-w-none flex-col border-white/10 bg-[#111111] p-0 sm:max-w-none"
      >
        {/* Header bar */}
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/10 px-4">
          <span className="max-w-[80%] truncate text-xs font-medium text-zinc-300">
            {article?.domain ?? "Article Reader"}
          </span>
          <div className="flex items-center gap-1">
            {article && (
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in new tab"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-zinc-500 hover:text-white"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6 text-zinc-500 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Reader View */}
        {article && (
          <div className="flex-1 overflow-y-auto px-8 py-10">
            <div className="mx-auto max-w-2xl">
              {article.feedName && (
                <p className="mb-2 text-sm font-semibold tracking-wider text-zinc-500 uppercase">
                  {article.feedName}
                </p>
              )}
              <h1 className="mb-6 text-3xl font-bold tracking-tight text-white leading-tight">
                {article.title}
              </h1>
              
              {article.image && (
                <div className="mb-8 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="h-auto w-full object-cover" 
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
                  />
                </div>
              )}

              <div className="prose prose-invert prose-zinc max-w-none">
                {/* Fallback to simple rendered text layout */}
                {article.description ? (
                  <div 
                    className="text-lg leading-relaxed text-zinc-300 *:mb-4 *:break-words" 
                    dangerouslySetInnerHTML={{ __html: article.description }} 
                  />
                ) : (
                  <p className="text-zinc-500 italic">No description available for this article.</p>
                )}
              </div>

               <div className="mt-12 flex justify-center pb-12">
                 <a href={article.link} target="_blank" rel="noopener noreferrer">
                   <Button className="h-10 rounded-full bg-white px-8 text-sm font-bold text-black hover:bg-zinc-200">
                     Read Full Article on {article.domain}
                   </Button>
                 </a>
               </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
