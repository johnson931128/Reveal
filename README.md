<p align="center">
  <a href="https://revealjs.com">
  <img src="https://hakim-static.s3.amazonaws.com/reveal-js/logo/v1/reveal-black-text-sticker.png" alt="reveal.js" width="500">
  </a>
  <br><br>
  <a href="https://github.com/hakimel/reveal.js/actions"><img src="https://github.com/hakimel/reveal.js/workflows/tests/badge.svg"></a>
  <a href="https://slides.com/"><img src="https://static.slid.es/images/slides-github-banner-320x40.png?1" alt="Slides" width="160" height="20"></a>
</p>

reveal.js is an open source HTML presentation framework. It enables anyone with a web browser to create beautiful presentations for free. Check out the live demo at [revealjs.com](https://revealjs.com/).

The framework comes with a powerful feature set including [nested slides](https://revealjs.com/vertical-slides/), [Markdown support](https://revealjs.com/markdown/), [Auto-Animate](https://revealjs.com/auto-animate/), [PDF export](https://revealjs.com/pdf-export/), [speaker notes](https://revealjs.com/speaker-view/), [LaTeX typesetting](https://revealjs.com/math/), [syntax highlighted code](https://revealjs.com/code/) and an [extensive API](https://revealjs.com/api/).

---

Want to create reveal.js presentation in a graphical editor? Try <https://slides.com>. It's made by the same people behind reveal.js.

---

### Getting started

- 🚀 [Install reveal.js](https://revealjs.com/installation)
- 👀 [View the demo presentation](https://revealjs.com/demo)
- 📖 [Read the documentation](https://revealjs.com/markup/)
- 🖌 [Try the visual editor for reveal.js at Slides.com](https://slides.com/)
- 🎬 [Watch the reveal.js video course (paid)](https://revealjs.com/course)

---

### Engineering light Mermaid 文字裁切處理紀錄

日期：2026-09-08
範圍：`templates/engineering-light-general/`

問題現象：第 7 頁 Mermaid class diagram 的 class name、method 或 field 可能超出 SVG `foreignObject` 的文字範圍而被裁切。整張投影片本身沒有 overflow；問題發生在 Mermaid 計算節點尺寸時使用的字型度量，與 Reveal/theme.css 最終套用的字級及行高不一致。

處理方式：

- Mermaid render 前等待 `document.fonts.ready`，避免使用 fallback font 計算節點尺寸。
- Mermaid `themeVariables.fontSize` 固定為 `16px`。
- 在 `.mermaid-stage` 內隔離 `text`、`.label`、`.nodeLabel`、`.edgeLabel` 與 `foreignObject` 文字樣式，固定使用相同字型、`16px` 字級及 `1.2` 行高。
- 保留既有 Mermaid 內容、節點自動尺寸與縮放功能，沒有手動加寬個別 node。

驗證結果：第 7 頁的 class name、method、field 與 edge label 均可完整顯示，node 沒有異常放大；完成全部 9 頁的 1600x900 screenshot audit，未發現 slide overflow、clipping 或非目前頁面疊加。

驗證截圖位於 `templates/engineering-light-general/screenshots/slide-01.png` 至 `slide-09.png`。

---

<div align="center">
  MIT licensed | Copyright © 2011-2026 Hakim El Hattab, https://hakim.se
</div>
