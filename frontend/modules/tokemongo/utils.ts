export function parseTime(time: number | bigint | Date) {
  return new Date(Number(time))
}

export function toUTCTime(time: Date) {
  return new Date(
    time.getUTCFullYear(),
    time.getUTCMonth(),
    time.getUTCDate(),
    time.getUTCHours(),
    time.getUTCMinutes(),
    time.getUTCSeconds(),
  )
}

// NOTE: using ISO string here to prevent timezone ambiguity
export function formatTime(time: number | bigint | Date) {
  return parseTime(time).toISOString()
}

export function formatAddress(address: string) {
  return `${address.substring(0, 10)}...${address.slice(33)}`
}
