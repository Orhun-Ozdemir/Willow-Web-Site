import sys

with open('assets/admin.js', 'r') as f:
    code = f.read()

replacement = """
        // SERP Güncellemesi
        if (field === "seoTitle") {
          const pvTitle = document.querySelector(`[data-serp-title-${CSS.escape(loc)}-${CSS.escape(pageKey)}]`);
          const count = document.querySelector(`[data-char-count="seoTitle-${CSS.escape(loc)}-${CSS.escape(pageKey)}"]`);
          if (pvTitle) pvTitle.textContent = val || "SEO Başlığı Belirlenmedi...";
          if (count) count.textContent = `${val.length}/60`;
          
          const socTitle = document.querySelector(`[data-social-title="${CSS.escape(loc)}-${CSS.escape(pageKey)}"]`);
          if (socTitle && (!state.content.pageSeo[pageKey][loc].ogTitle)) {
             socTitle.textContent = val || "Sosyal Medya Başlığı";
          }
        }
        if (field === "metaDescription") {
          const pvDesc = document.querySelector(`[data-serp-desc-${CSS.escape(loc)}-${CSS.escape(pageKey)}]`);
          const count = document.querySelector(`[data-char-count="metaDescription-${CSS.escape(loc)}-${CSS.escape(pageKey)}"]`);
          if (pvDesc) pvDesc.textContent = val || "Meta açıklaması henüz girilmedi.";
          if (count) count.textContent = `${val.length}/160`;
          
          const socDesc = document.querySelector(`[data-social-desc="${CSS.escape(loc)}-${CSS.escape(pageKey)}"]`);
          if (socDesc && (!state.content.pageSeo[pageKey][loc].ogDescription)) {
             socDesc.textContent = val || "Açıklama alanı...";
          }
        }
        
        // Sosyal Medya Güncellemesi
        if (field === "ogTitle") {
           const socTitle = document.querySelector(`[data-social-title="${CSS.escape(loc)}-${CSS.escape(pageKey)}"]`);
           if (socTitle) {
              socTitle.textContent = val || state.content.pageSeo[pageKey][loc].seoTitle || "Sosyal Medya Başlığı";
           }
        }
        if (field === "ogDescription") {
           const socDesc = document.querySelector(`[data-social-desc="${CSS.escape(loc)}-${CSS.escape(pageKey)}"]`);
           if (socDesc) {
              socDesc.textContent = val || state.content.pageSeo[pageKey][loc].metaDescription || "Açıklama alanı...";
           }
        }
        if (field === "ogImage") {
           const socImg = document.querySelector(`[data-social-img="${CSS.escape(loc)}-${CSS.escape(pageKey)}"]`);
           if (socImg) {
              socImg.style.backgroundImage = val ? `url('${val}')` : 'none';
              socImg.textContent = val ? '' : 'Görsel Seçilmedi';
           }
        }
"""

start_idx = code.find('        // SERP Güncellemesi')
if start_idx != -1:
    end_idx = code.find('      }', start_idx)
    new_code = code[:start_idx] + replacement.lstrip('\n') + "\n" + code[end_idx:]
    with open('assets/admin.js', 'w') as f:
        f.write(new_code)
    print("Updated SEO Live Sync block successfully!")
else:
    print("Could not find SERP Güncellemesi block")
