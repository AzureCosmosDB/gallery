export function setQueryParam(search: string, key: string, value?: string | null) {
  const params = new URLSearchParams(search);

  if (value && value.trim().length > 0) {
    params.set(key, value);
  } else {
    params.delete(key);
  }

  const next = params.toString();
  return next ? `?${next}` : '';
}

export function joinComma(values: string[]) {
  return values.join(',');
}
