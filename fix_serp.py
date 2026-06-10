import sys

with open('assets/admin.js', 'r') as f:
    code = f.read()

# Replace in Bulk Editor template
code = code.replace(
    'data-serp-title="${esc(locale)}"',
    'data-serp-title="${esc(locale)}-${esc(pgKey)}"'
)
code = code.replace(
    'data-serp-desc="${esc(locale)}"',
    'data-serp-desc="${esc(locale)}-${esc(pgKey)}"'
)
code = code.replace(
    'data-char-count="seoTitle-${esc(locale)}"',
    'data-char-count="seoTitle-${esc(locale)}-${esc(pgKey)}"'
)
code = code.replace(
    'data-char-count="metaDescription-${esc(locale)}"',
    'data-char-count="metaDescription-${esc(locale)}-${esc(pgKey)}"'
)

# Replace in Event Listener
code = code.replace(
    'data-serp-title-${CSS.escape(loc)}',
    'data-serp-title-${CSS.escape(loc)}-${CSS.escape(pageKey)}'
)
code = code.replace(
    'data-serp-desc-${CSS.escape(loc)}',
    'data-serp-desc-${CSS.escape(loc)}-${CSS.escape(pageKey)}'
)
code = code.replace(
    'data-char-count="seoTitle-${CSS.escape(loc)}"',
    'data-char-count="seoTitle-${CSS.escape(loc)}-${CSS.escape(pageKey)}"'
)
code = code.replace(
    'data-char-count="metaDescription-${CSS.escape(loc)}"',
    'data-char-count="metaDescription-${CSS.escape(loc)}-${CSS.escape(pageKey)}"'
)

with open('assets/admin.js', 'w') as f:
    f.write(code)
print('Fixed uniqueness of SERP previews!')
