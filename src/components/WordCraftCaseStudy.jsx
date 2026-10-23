import { wordcraftChallenges, wordcraftFeatures } from "../data/wordcraft.js";

/** WordCraft-only content. Other project detail pages retain their existing markup. */
export default function WordCraftCaseStudy() {
  return (
    <section className="wordcraft-case-study" aria-label="WordCraft technical case study">
      <h2>Features</h2>
      <ul>{wordcraftFeatures.map(feature => <li key={feature}>{feature}</li>)}</ul>
      <h2>Engineering challenges and solutions</h2>
      {wordcraftChallenges.map(([title, solution]) => (
        <section key={title}><h3>{title}</h3><p>{solution}</p></section>
      ))}
      <h2>Testing and measured results</h2>
      <p>258 automated tests pass using Node's built-in runner. Executed-module coverage is 100% lines, 96.78% branches and 97.35% functions. Recorded Chromium QA includes 120 responsive cases across six widths and both themes.</p>
      <p>The same five-letter sequence fell from 930 to 15 DOM mutation records. The measured layout shift fell from 0.3586 to zero. Local warm-cache FCP was 68ms. These are local observations, not production field scores or controlled loading-speed comparisons.</p>
      <div className="wordcraft-captures">
        <figure><img src="/projects/wordcraft-desktop.jpg" alt="Actual WordCraft desktop layout with scored guesses and on-screen keyboard" loading="lazy" width="1008" height="840" /><figcaption>Actual Chromium desktop capture, using a 1440px CSS viewport displayed at 70% scale.</figcaption></figure>
        <figure><img src="/projects/wordcraft-mobile.jpg" alt="Actual WordCraft narrow layout showing the board and keyboard in a 390px CSS viewport" loading="lazy" width="1363" height="936" /><figcaption>Actual 390px CSS layout in Chromium. Raw capture includes the surrounding fixture background. No physical phone was used.</figcaption></figure>
      </div>
      <h2>Scope and limitations</h2>
      <p>This is an independent demonstration, not a paid client delivery. Firefox, WebKit, physical devices, spoken screen-reader output, OS reduced motion and actual 200% browser zoom remain unverified. No accessibility certification is claimed.</p>
      <p>The original source retains all rights reserved. The separately licensed Wordnik dictionary uses MIT with bundled attribution. Source ownership remains with its owner unless a signed client agreement states otherwise.</p>
    </section>
  );
}
