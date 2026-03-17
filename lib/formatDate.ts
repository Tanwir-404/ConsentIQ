// IST = UTC + 5 hours 30 minutes

export function toIST(dateStr: string): string {
  if (!dateStr) return '—'
  const utc = new Date(dateStr).getTime()
  const ist = new Date(utc + 5.5 * 3600000)
  const d    = ist.getUTCDate().toString().padStart(2, '0')
  const m    = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][ist.getUTCMonth()]
  const y    = ist.getUTCFullYear()
  const h    = ist.getUTCHours()
  const min  = ist.getUTCMinutes().toString().padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12  = h % 12 || 12
  return `${d} ${m} ${y}, ${h12}:${min} ${ampm}`
}

export function toISTDate(dateStr: string): string {
  if (!dateStr) return '—'
  const utc = new Date(dateStr).getTime()
  const ist = new Date(utc + 5.5 * 3600000)
  const d   = ist.getUTCDate().toString().padStart(2, '0')
  const m   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][ist.getUTCMonth()]
  const y   = ist.getUTCFullYear()
  return `${d} ${m} ${y}`
}

export function nowIST(): string {
  const utc = new Date().getTime()
  const ist = new Date(utc + 5.5 * 3600000)
  return ist.toISOString()
}