import sys

with open('assets/admin.js', 'r') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if 'function renderSEOCenter()' in line:
        start_idx = i
        break

if start_idx != -1:
    open_brackets = 0
    for i in range(start_idx, len(lines)):
        open_brackets += lines[i].count('{')
        open_brackets -= lines[i].count('}')
        if open_brackets == 0 and lines[i].count('}') > 0:
            end_idx = i
            break

if start_idx != -1 and end_idx != -1:
    # We will replace start_idx to end_idx + 1
    new_code = """  function renderSEOCenter() {
    const root = qs('[data-admin-seo-center]');
    if (!root || !state.content) return;
    const pageSeo = state.content.pageSeo || {};
    const pageLabels = { home: 'Ana Sayfa', products: 'Ürün Kataloğu', news: 'Haberler', services: 'Hizmetler', solutions: 'Çözümler', company: 'Şirket', contact: 'İletişim', startProject: 'Projeye Başla' };
    const LOCALES = ['en','tr','de','fr','it','es','ar','ja'];
    const locale = state.editLocale || "tr";
    const locName = localeNames[locale] || locale.toUpperCase();

    const totalPages = Object.keys(pageSeo).length;
    const totalLocales = totalPages * LOCALES.length;
    const filledCount = Object.values(pageSeo).reduce((sum, page) => sum + Object.values(page).filter(loc => loc.seoTitle && loc.metaDescription).length, 0);
    const healthPct = totalLocales > 0 ? Math.round((filledCount / totalLocales) * 100) : 0;
    const totalIssues = totalLocales - filledCount;

    root.innerHTML = `
      <div class="admin-card-top" style="margin-bottom: 24px;">
        <div>
          <h2>Toplu SEO Yönetimi (Bulk Editor)</h2>
          <p style="color: var(--admin-muted); margin-top: 4px;">Şu anki dil: <strong>${esc(locName)}</strong>. Diğer dilleri düzenlemek için üst barda dili değiştirin.</p>
        </div>
      </div>

      <!-- Özet Kartlar -->
      <div class="admin-seo-summary-row">
        <div class="admin-seo-summary-card">
          <div class="admin-seo-summary-num" style="color: ${healthPct >= 80 ? '#10b981' : healthPct >= 50 ? '#f59e0b' : '#ef4444'}">${healthPct}%</div>
          <div class="admin-seo-summary-label">SEO Sağlık Skoru</div>
        </div>
        <div class="admin-seo-summary-card">
          <div class="admin-seo-summary-num">${filledCount} / ${totalLocales}</div>
          <div class="admin-seo-summary-label">Tamamlanan (Tüm Diller)</div>
        </div>
        <div class="admin-seo-summary-card">
          <div class="admin-seo-summary-num" style="color: ${totalIssues > 0 ? '#ef4444' : '#10b981'}">${totalIssues}</div>
          <div class="admin-seo-summary-label">Eksik Alan (Tüm Diller)</div>
        </div>
        <div class="admin-seo-summary-card">
          <div class="admin-seo-summary-num">${totalPages}</div>
          <div class="admin-seo-summary-label">İndekslenen Sayfa</div>
        </div>
      </div>

      <!-- Bulk Editor List -->
      <div class="admin-seo-bulk-list">
        ${Object.entries(pageSeo).map(([pgKey, pgData]) => {
          const locData = pgData[locale] || {};
          const isComplete = locData.seoTitle && locData.metaDescription;
          const statusColor = isComplete ? '#10b981' : '#f59e0b';
          const statusText = isComplete ? 'Tamamlandı' : 'Eksik Veri';
          
          return `
            <details class="admin-seo-bulk-row">
              <summary class="admin-seo-bulk-header">
                <div class="admin-seo-bulk-title">
                  <span style="font-size: 1.25rem;">📄</span>
                  ${esc(pageLabels[pgKey] || pgKey)}
                  <span style="font-size: 0.85rem; color: var(--admin-muted); font-weight: 400; font-family: monospace;">/${esc(pgKey)}</span>
                </div>
                <div class="admin-seo-bulk-badges">
                  <div class="admin-seo-bulk-badge" style="background: ${statusColor}22; color: ${statusColor}; border: 1px solid ${statusColor}44;">
                    ${statusText}
                  </div>
                </div>
              </summary>
              <div class="admin-seo-bulk-body">
                <div class="admin-seo-bulk-editor-grid">
                  <div class="admin-seo-bulk-fields">
                    <label>
                      <strong style="display: block; margin-bottom: 6px; font-size: 0.85rem; color: var(--admin-ink);">SEO Başlığı (Title)</strong>
                      <input type="text" class="admin-input admin-seo-input" 
                        data-seo-page="${esc(pgKey)}" data-seo-locale="${esc(locale)}" data-seo-field="seoTitle" 
                        value="${esc(locData.seoTitle || '')}" placeholder="Google'da görünecek başlık" />
                      <div style="font-size: 0.75rem; text-align: right; margin-top: 4px; color: var(--admin-muted);" data-char-count="seoTitle-${esc(locale)}">
                        ${(locData.seoTitle || '').length}/60
                      </div>
                    </label>
                    <label>
                      <strong style="display: block; margin-bottom: 6px; font-size: 0.85rem; color: var(--admin-ink);">Meta Açıklama (Description)</strong>
                      <textarea class="admin-textarea admin-seo-input" rows="3"
                        data-seo-page="${esc(pgKey)}" data-seo-locale="${esc(locale)}" data-seo-field="metaDescription" 
                        placeholder="Sayfa hakkında özet bilgi...">${esc(locData.metaDescription || '')}</textarea>
                      <div style="font-size: 0.75rem; text-align: right; margin-top: 4px; color: var(--admin-muted);" data-char-count="metaDescription-${esc(locale)}">
                        ${(locData.metaDescription || '').length}/160
                      </div>
                    </label>
                    <label>
                      <strong style="display: block; margin-bottom: 6px; font-size: 0.85rem; color: var(--admin-ink);">Odak Anahtar Kelime (Focus Keyword)</strong>
                      <input type="text" class="admin-input admin-seo-input" 
                        data-seo-page="${esc(pgKey)}" data-seo-locale="${esc(locale)}" data-seo-field="focusKeyword" 
                        value="${esc(locData.focusKeyword || '')}" placeholder="Örn: endüstriyel sensör" />
                    </label>
                  </div>
                  <div class="admin-seo-bulk-preview">
                    <strong style="display: block; margin-bottom: 12px; font-size: 0.85rem; color: var(--admin-ink);">SERP Önizlemesi (Google)</strong>
                    <div style="font-family: Arial, sans-serif; max-width: 600px;">
                      <div style="color: #202124; font-size: 14px; margin-bottom: 2px;">willowbee.com › ${esc(locale)} › ${esc(pgKey)}</div>
                      <div style="color: #1a0dab; font-size: 20px; text-decoration: none; margin-bottom: 3px; line-height: 1.3;" data-serp-title="${esc(locale)}">
                        ${esc(locData.seoTitle || 'SEO Başlığı Belirlenmedi...')}
                      </div>
                      <div style="color: #4d5156; font-size: 14px; line-height: 1.58;" data-serp-desc="${esc(locale)}">
                        ${esc(locData.metaDescription || 'Meta açıklaması henüz girilmedi.')}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="admin-seo-bulk-actions">
                  <button type="button" class="btn btn-secondary btn-small" data-goto-page-seo="${esc(pgKey)}">
                    İçerik Düzenleyiciyi Aç
                  </button>
                </div>
              </div>
            </details>
          `;
        }).join('')}
      </div>
    `;
  }
"""
    del lines[start_idx:end_idx+1]
    lines.insert(start_idx, new_code + "\n")
    
    with open('assets/admin.js', 'w') as f:
        f.writelines(lines)
    print("Replaced successfully!")
else:
    print("Could not find renderSEOCenter")
