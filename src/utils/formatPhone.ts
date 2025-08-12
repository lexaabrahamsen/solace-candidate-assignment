export function formatPhone(raw: string) {
  const d = (raw || "").replace(/\D/g, "");
  if (d.length === 10) return `+1 (${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  if (d.length === 11 && d.startsWith("1"))
    return `+1 (${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7)}`;
  return raw;
}