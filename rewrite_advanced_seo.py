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
          <h2>Kurumsal SEO Yöneticisi (B2B Bulk Editor)</h2>
          <p style="color: var(--admin-muted); margin-top: 4px;">Şu anki dil: <strong>${esc(locName)}</strong>. Diğer dilleri düzenlemek için üst barda dili değiştirin.</p>
        </div>
      </div>

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
              <div class="admin-seo-bulk-body" style="padding: 0; display: none;">
                <div class="admin-seo-inner-tabs">
                  <button type="button" class="admin-seo-inner-tab active" data-inner-tab-target="general-${esc(pgKey)}">Genel SEO</button>
                  <button type="button" class="admin-seo-inner-tab" data-inner-tab-target="schema-${esc(pgKey)}">Etiketler &amp; Şema</button>
                  <button type="button" class="admin-seo-inner-tab" data-inner-tab-target="social-${esc(pgKey)}">Sosyal Medya</button>
                  <button type="button" class="admin-seo-inner-tab" data-inner-tab-target="tech-${esc(pgKey)}">Gelişmiş</button>
                </div>
                <div class="admin-seo-inner-panels">
                  
                  <!-- TAB 1: GENERAL -->
                  <div class="admin-seo-inner-panel active" data-inner-panel-id="general-${esc(pgKey)}">
                    <div class="admin-seo-bulk-editor-grid">
                      <div class="admin-seo-bulk-fields">
                        <label>
                          <strong style="display: block; margin-bottom: 6px; font-size: 0.85rem; color: var(--admin-ink);">SEO Başlığı (Title)</strong>
                          <input type="text" class="admin-input admin-seo-input" 
                            data-seo-page="${esc(pgKey)}" data-seo-locale="${esc(locale)}" data-seo-field="seoTitle" 
                            value="${esc(locData.seoTitle || '')}" placeholder="Google'da görünecek başlık" />
                          <div style="font-size: 0.75rem; text-align: right; margin-top: 4px; color: var(--admin-muted);" data-char-count="seoTitle-${esc(locale)}-${esc(pgKey)}">
                            ${(locData.seoTitle || '').length}/60
                          </div>
                        </label>
                        <label>
                          <strong style="display: block; margin-bottom: 6px; font-size: 0.85rem; color: var(--admin-ink);">Meta Açıklama (Description)</strong>
                          <textarea class="admin-textarea admin-seo-input" rows="3"
                            data-seo-page="${esc(pgKey)}" data-seo-locale="${esc(locale)}" data-seo-field="metaDescription" 
                            placeholder="Sayfa hakkında özet bilgi...">${esc(locData.metaDescription || '')}</textarea>
                          <div style="font-size: 0.75rem; text-align: right; margin-top: 4px; color: var(--admin-muted);" data-char-count="metaDescription-${esc(locale)}-${esc(pgKey)}">
                            ${(locData.metaDescription || '').length}/160
                          </div>
                        </label>
                        <label>
                          <strong style="display: block; margin-bottom: 6px; font-size: 0.85rem; color: var(--admin-ink);">Odak Anahtar Kelime (Focus Keyword)</strong>
                          <input type="text" class="admin-input admin-seo-input" 
                            data-seo-page="${esc(pgKey)}" data-seo-locale="${esc(locale)}" data-seo-field="focusKeyword" 
                            value="${esc(locData.focusKeyword || '')}" placeholder="Örn: endüstriyel otomasyon" />
                        </label>
                      </div>
                      <div class="admin-seo-bulk-preview">
                        <strong style="display: block; margin-bottom: 12px; font-size: 0.85rem; color: var(--admin-ink);">SERP Önizlemesi (Google)</strong>
                        <div style="font-family: Arial, sans-serif; max-width: 600px;">
                          <div style="color: #202124; font-size: 14px; margin-bottom: 2px;">willowbee.com › ${esc(locale)} › ${esc(pgKey)}</div>
                          <div style="color: #1a0dab; font-size: 20px; text-decoration: none; margin-bottom: 3px; line-height: 1.3;" data-serp-title="${esc(locale)}-${esc(pgKey)}">
                            ${esc(locData.seoTitle || 'SEO Başlığı Belirlenmedi...')}
                          </div>
                          <div style="color: #4d5156; font-size: 14px; line-height: 1.58;" data-serp-desc="${esc(locale)}-${esc(pgKey)}">
                            ${esc(locData.metaDescription || 'Meta açıklaması henüz girilmedi.')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- TAB 2: SCHEMA & TAGS -->
                  <div class="admin-seo-inner-panel" data-inner-panel-id="schema-${esc(pgKey)}">
                    <div style="max-width: 600px;">
                      <label style="display:block; margin-bottom:16px;">
                        <strong style="display: block; margin-bottom: 6px; font-size: 0.85rem;">Şema Türü (Schema.org)</strong>
                        <select class="admin-input admin-seo-input" data-seo-page="${esc(pgKey)}" data-seo-locale="${esc(locale)}" data-seo-field="schemaType">
                          <option value="WebPage" ${locData.schemaType === 'WebPage' || !locData.schemaType ? 'selected' : ''}>WebPage (Varsayılan)</option>
                          <option value="Article" ${locData.schemaType === 'Article' ? 'selected' : ''}>Article (Haber/Blog)</option>
                          <option value="FAQPage" ${locData.schemaType === 'FAQPage' ? 'selected' : ''}>FAQPage (Sıkça Sorulan Sorular)</option>
                          <option value="Organization" ${locData.schemaType === 'Organization' ? 'selected' : ''}>Organization (Şirket Profili)</option>
                          <option value="ContactPage" ${locData.schemaType === 'ContactPage' ? 'selected' : ''}>ContactPage (İletişim)</option>
                        </select>
                        <div style="font-size:0.75rem; color:var(--admin-muted); margin-top:4px;">Google'ın sayfa içeriğini anlamasına yardımcı olur.</div>
                      </label>

                      <label style="display:block;">
                        <strong style="display: block; margin-bottom: 6px; font-size: 0.85rem;">Etiketler (Virgülle ayırın)</strong>
                        <input type="text" class="admin-input admin-seo-input" 
                          data-seo-page="${esc(pgKey)}" data-seo-locale="${esc(locale)}" data-seo-field="tags" 
                          value="${esc(locData.tags || '')}" placeholder="B2B, Yazılım, Teknoloji..." />
                      </label>
                    </div>
                  </div>

                  <!-- TAB 3: SOCIAL MEDIA -->
                  <div class="admin-seo-inner-panel" data-inner-panel-id="social-${esc(pgKey)}">
                    <div class="admin-seo-bulk-editor-grid">
                      <div class="admin-seo-bulk-fields">
                        <label>
                          <strong style="display: block; margin-bottom: 6px; font-size: 0.85rem;">Sosyal Medya Başlığı (og:title)</strong>
                          <input type="text" class="admin-input admin-seo-input" 
                            data-seo-page="${esc(pgKey)}" data-seo-locale="${esc(locale)}" data-seo-field="ogTitle" 
                            value="${esc(locData.ogTitle || '')}" placeholder="SEO başlığı kullanılacak..." />
                        </label>
                        <label>
                          <strong style="display: block; margin-bottom: 6px; font-size: 0.85rem;">Sosyal Medya Açıklaması (og:description)</strong>
                          <textarea class="admin-textarea admin-seo-input" rows="2"
                            data-seo-page="${esc(pgKey)}" data-seo-locale="${esc(locale)}" data-seo-field="ogDescription" 
                            placeholder="SEO meta açıklaması kullanılacak...">${esc(locData.ogDescription || '')}</textarea>
                        </label>
                        <label>
                          <strong style="display: block; margin-bottom: 6px; font-size: 0.85rem;">Paylaşım Görseli URL (og:image)</strong>
                          <input type="text" class="admin-input admin-seo-input" 
                            data-seo-page="${esc(pgKey)}" data-seo-locale="${esc(locale)}" data-seo-field="ogImage" 
                            value="${esc(locData.ogImage || '')}" placeholder="/assets/images/social-cover.jpg" />
                        </label>
                      </div>
                      <div class="admin-seo-bulk-preview" style="background:#fff; border-color:#e2e8f0; border-radius:12px; overflow:hidden; padding:0;">
                         <div style="height: 150px; background: #e2e8f0 url('${esc(locData.ogImage || '')}') center/cover no-repeat; display:flex; align-items:center; justify-content:center; color:#94a3b8; font-size:0.8rem;">
                           ${!locData.ogImage ? 'Görsel Seçilmedi' : ''}
                         </div>
                         <div style="padding: 16px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
                           <div style="color: #475569; font-size: 12px; text-transform: uppercase; margin-bottom:4px;">willowbee.com</div>
                           <div style="color: #0f172a; font-weight: 600; font-size: 15px; margin-bottom: 4px;">${esc(locData.ogTitle || locData.seoTitle || 'Sosyal Medya Başlığı')}</div>
                           <div style="color: #64748b; font-size: 13px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${esc(locData.ogDescription || locData.metaDescription || 'Açıklama alanı...')}</div>
                         </div>
                      </div>
                    </div>
                  </div>

                  <!-- TAB 4: ADVANCED / TECHNICAL -->
                  <div class="admin-seo-inner-panel" data-inner-panel-id="tech-${esc(pgKey)}">
                    <div style="max-width: 600px;">
                      <div class="admin-toggle-wrapper">
                        <div class="admin-toggle-label">
                          <span class="admin-toggle-title">Arama Motorlarına Kapat (NoIndex)</span>
                          <span class="admin-toggle-desc">Google ve diğer botların bu sayfayı arama sonuçlarında göstermesini engeller.</span>
                        </div>
                        <label class="admin-toggle">
                          <input type="checkbox" class="admin-seo-input" data-seo-page="${esc(pgKey)}" data-seo-locale="${esc(locale)}" data-seo-field="noIndex" ${locData.noIndex ? 'checked' : ''} />
                          <span class="admin-toggle-slider"></span>
                        </label>
                      </div>

                      <div class="admin-toggle-wrapper">
                        <div class="admin-toggle-label">
                          <span class="admin-toggle-title">Linkleri Takip Etme (NoFollow)</span>
                          <span class="admin-toggle-desc">Botların bu sayfadaki linkleri takip ederek otorite aktarmasını engeller.</span>
                        </div>
                        <label class="admin-toggle">
                          <input type="checkbox" class="admin-seo-input" data-seo-page="${esc(pgKey)}" data-seo-locale="${esc(locale)}" data-seo-field="noFollow" ${locData.noFollow ? 'checked' : ''} />
                          <span class="admin-toggle-slider"></span>
                        </label>
                      </div>

                      <div style="margin-top: 20px;">
                        <label>
                          <strong style="display: block; margin-bottom: 6px; font-size: 0.85rem;">Canonical URL</strong>
                          <input type="text" class="admin-input admin-seo-input" 
                            data-seo-page="${esc(pgKey)}" data-seo-locale="${esc(locale)}" data-seo-field="canonicalUrl" 
                            value="${esc(locData.canonicalUrl || '')}" placeholder="Orijinal sayfa bağlantısı (Opsiyonel)" />
                          <div style="font-size:0.75rem; color:var(--admin-muted); margin-top:4px;">Kopya içerik sorunlarını önlemek için asıl URL'yi buraya girin. Boş bırakılırsa sayfanın kendi URL'si kullanılır.</div>
                        </label>
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
    print("Replaced renderSEOCenter successfully!")
else:
    print("Could not find renderSEOCenter")
