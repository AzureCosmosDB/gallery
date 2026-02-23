export function adobeTagCheckboxData(id: string) {
  const checkbox = id.replace("showcase_checkbox_id_", "");
  return `{"id":"${checkbox}","cN":"Tags"}`;
}

export function adobeTagCategoryData(category: string) {
  return `{"id":"${category}","cN":"Tags Category"}`;
}
