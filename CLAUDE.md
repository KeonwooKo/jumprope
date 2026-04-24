@AGENTS.md

# CLAUDE.md

Rules Claude Code must follow in this project.

---

## 1. All styling must follow Tailwind CSS rules

- Write every piece of styling using **Tailwind CSS utility classes**.
- Do not use inline `style` attributes, separate `.css` files, `<style>` blocks, or CSS-in-JS (styled-components, emotion, etc.).
- Prefer Tailwind's default scale (spacing, color, font-size, etc.). Use arbitrary values (`w-[437px]`, `bg-[#1a1a1a]`) only when the default scale cannot express the required value.

## 2. Convert existing HTML to follow Tailwind rules

- Any `<style>` blocks, external CSS, and inline `style` attributes in the HTML being worked on must be **fully converted into Tailwind classes**.
- After conversion, delete the original style code. Do not leave raw CSS mixed with Tailwind.
- The conversion must not change the visual result — the output must look identical to the original.

## 3. Stay as close to the original HTML as possible

- When an HTML document or design is provided, reproduce its **layout, spacing, colors, typography, responsive behavior, and animations exactly**.
- Do not "improve", reinterpret, or simplify the original. Match it pixel by pixel.
- Use the exact color values, sizes, and spacings from the source. Do not round them to the nearest Tailwind value if that changes the appearance — use arbitrary values instead.

## 4. Agent execution: use Opus or Sonnet, not Haiku, and spend tokens freely

- When running subagents (Task tool), **never use Haiku**. Use **Opus or Sonnet** only.
- Do not optimize for token cost or speed. **Use as many tokens as needed** to produce the best result.
- Read full file contents instead of skimming. Load generous context. Think thoroughly before writing code. Write detailed, complete responses.
- Quality is the priority, not brevity.
