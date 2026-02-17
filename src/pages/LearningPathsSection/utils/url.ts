export function setSingleParam(search: string, key: string, value?: string | null) {
  const params = new URLSearchParams(search);

  if (value && value.trim()) params.set(key, value);
  else params.delete(key);

  const next = params.toString();
  return next ? `?${next}` : "";
}

export function getAllParams(search: string, key: string) {
  return new URLSearchParams(search).getAll(key);
}
