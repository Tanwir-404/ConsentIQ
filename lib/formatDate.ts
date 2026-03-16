// Converts any UTC date string to IST (Indian Standard Time)
// IST = UTC + 5 hours 30 minutes

export function toIST(dateStr: string): string {
  const date = new Date(dateStr)

  // Add 5 hours 30 minutes manually
  const istOffset = 5.5 * 60 * 60 * 1000 // 5h30m in milliseconds
  const istDate   = new Date(date.getTime() + istOffset)

  const day   = istDate.getUTCDate()
  const month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][istDate.getUTCMonth()]
  const year  = istDate.getUTCFullYear()
  const hours = istDate.getUTCHours()
  const mins  = istDate.getUTCMinutes().toString().padStart(2, '0')
  const ampm  = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12

  return `${day} ${month} ${year}, ${hour12}:${mins} ${ampm}`
}

export function toISTDate(dateStr: string): string {
  const date = new Date(dateStr)
  const istOffset = 5.5 * 60 * 60 * 1000
  const istDate   = new Date(date.getTime() + istOffset)

  const day   = istDate.getUTCDate()
  const month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][istDate.getUTCMonth()]
  const year  = istDate.getUTCFullYear()

  return `${day} ${month} ${year}`
}