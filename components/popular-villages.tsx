import Link from 'next/link'
import { MapPin, CheckCircle2 } from 'lucide-react'
import { VILLAGES_DATABASE } from '@/lib/data/villages-store'

export function PopularVillages() {
  const villageList = Object.values(VILLAGES_DATABASE)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Desa Data Riil:
      </span>
      {villageList.map((v) => (
        <Link
          key={v.slug}
          href={`/desa/${v.slug}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-primary/40 hover:bg-secondary hover:text-primary shadow-xs"
        >
          <MapPin className="size-3 text-primary" aria-hidden="true" />
          <span>{v.nama}</span>
          {v.isRealData && (
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded-full font-bold">
              Riil
            </span>
          )}
        </Link>
      ))}
    </div>
  )
}
