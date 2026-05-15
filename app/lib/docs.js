export function groupDocsBySection(items) {
  return items.reduce((acc, item) => {
    acc[item.group] ||= [];
    acc[item.group].push(item);
    return acc;
  }, {});
}

export function filterNavigationDocs(items, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return groupDocsBySection(items);

  const filteredItems = items.filter((item) => {
    const searchable = [item.label, item.title, item.intro, ...item.sections.map((section) => section.title)]
      .join(" ")
      .toLowerCase();

    return searchable.includes(normalizedQuery);
  });

  return groupDocsBySection(filteredItems);
}

export function searchDocs(items, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return items;

  return items.filter((item) => {
    const searchable = [
      item.group,
      item.label,
      item.title,
      item.intro,
      ...item.sections.map((section) => `${section.title} ${section.body}`),
    ]
      .join(" ")
      .toLowerCase();

    return searchable.includes(normalizedQuery);
  });
}

export function getPageCopy(doc) {
  return `${doc.title}\n\n${doc.intro}\n\n${doc.sections
    .map((section) => `${section.title}\n${section.body}`)
    .join("\n\n")}`;
}
