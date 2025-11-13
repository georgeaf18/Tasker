# UI/UX Research & Design System

## Research Phase

### 1. ADHD-Friendly UI Principles (To Research)

**Sources to investigate:**

- [ ] Academic research on ADHD and interface design
- [ ] ADHD design guidelines from accessibility experts
- [ ] Case studies of successful task management apps for ADHD users
- [ ] Color psychology for focus and attention

**Key questions:**

- [ ] What color palettes minimize distraction while maintaining engagement?
- [ ] How much information can be shown before overwhelming?
- [ ] Best practices for reducing decision fatigue
- [ ] Visual cues that support executive function
- [ ] How to make "next action" always obvious

### 2. Dyslexia-Friendly Design Principles (To Research)

**Sources to investigate:**

- [ ] British Dyslexia Association design guidelines
- [ ] Web Content Accessibility Guidelines (WCAG) for dyslexia
- [ ] Typography research for readability
- [ ] OpenDyslexic font effectiveness studies

**Key questions:**

- [ ] Optimal font families (sans-serif confirmed, but which?)
- [ ] Line spacing requirements (1.5x-2x, but exact?)
- [ ] Line length for readability (40-60 characters confirmed)
- [ ] Color contrast ratios needed
- [ ] Left-aligned vs centered text
- [ ] Avoiding walls of text - how to chunk information

### 3. Inspiration App Deep Dives

#### Arc Browser

**What to study:**

- [ ] Sidebar navigation pattern
- [ ] Space/workspace organization
- [ ] Color system (how they use color for organization)
- [ ] Minimalist chrome, content-focused
- [ ] Command palette interaction
- [ ] How complexity is hidden but accessible

**Screenshots/notes:**

- [ ] Capture sidebar layout
- [ ] Note color usage
- [ ] Document interaction patterns

#### Printables (Prusa3D)

**What to study:**

- [ ] Card-based layout system
- [ ] Grid organization
- [ ] Typography hierarchy
- [ ] Spacing/whitespace usage
- [ ] How they show metadata without clutter
- [ ] Filter/sort patterns

**Screenshots/notes:**

- [ ] Capture main feed layout
- [ ] Note card design patterns
- [ ] Document spacing system

#### Bitbucket/GitLab

**What to study:**

- [ ] Why cleaner than GitHub? (less visual noise)
- [ ] Navigation structure
- [ ] Information density balance
- [ ] Status indicators (colors, icons)
- [ ] Action button placement

**Screenshots/notes:**

- [ ] Compare side-by-side with GitHub
- [ ] Document what makes it less overwhelming

#### TikTok/Instagram

**What to study:**

- [ ] Bottom navigation pattern
- [ ] Clear primary actions
- [ ] How they guide user flow
- [ ] Icon + label usage
- [ ] Swipe/gesture patterns (if applicable)

---

## Design System Definition

### Color Palette

**Primary Colors:**

```
To be defined based on research

Considerations:
- High contrast for dyslexia
- Calming but engaging for ADHD
- Avoid red/green for critical info (colorblind)
- Workspace differentiation (work = blue?, personal = purple?)
- Status colors (backlog, today, in progress, done)
```

**Color Psychology Research Needed:**

- [ ] Blue: calming, focus (good for work?)
- [ ] Green: completion, success (done state?)
- [ ] Yellow/amber: attention, warning (due soon?)
- [ ] Purple: creativity (personal tasks?)
- [ ] Avoid overwhelming saturated colors
- [ ] Dark mode palette

### Typography System

**Font Families to Test:**

```
Sans-serif options:
- [ ] Inter (modern, highly legible)
- [ ] Atkinson Hyperlegible (designed for low vision)
- [ ] Lexend (designed for readability)
- [ ] OpenDyslexic (controversial - test with user)
- [ ] System fonts (San Francisco on macOS)

Decision criteria:
- Readability at various sizes
- Clear character distinction (1 vs l vs I)
- Generous spacing
- How it feels to user (George's preference matters most)
```

**Type Scale:**

```
To be defined

Considerations:
- Large enough to read comfortably
- Clear hierarchy (h1, h2, body, small)
- Adjustable user preference (settings)
```

**Text Rules:**

```
- Line height: 1.5-2x (exact ratio TBD)
- Line length: 40-60 characters max
- Left-aligned (no justified text)
- Generous paragraph spacing
- Avoid italics (harder to read with dyslexia)
- Use bold for emphasis, not color alone
```

### Layout Patterns

**Grid System:**

```
To be defined based on inspiration apps

Likely structure:
┌─────────────────────────────────────────────┐
│ Top Bar (minimal)                           │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ Sidebar  │  Main Content Area               │
│          │                                  │
│          │                                  │
│          │                                  │
└──────────┴──────────────────────────────────┘

Sidebar: ~250-300px (collapsible)
Main: Flexible, max-width for readability
```

**Spacing System:**

```
To be defined

Likely approach:
- Base unit: 8px
- Scale: 8px, 16px, 24px, 32px, 48px, 64px
- Generous whitespace to prevent overwhelm
```

**Card Design:**

```
Task cards need:
- Clear boundaries (shadow or border)
- Adequate padding
- Visual hierarchy (title > description > metadata)
- Status indicators (color-coded edge? icon?)
- Workspace/channel tags
- Nested subtask area
```

### Component Library

**Components to Design:**

1. **Task Card**
   - [ ] Default state
   - [ ] Hover state
   - [ ] Drag state
   - [ ] Completed state
   - [ ] Nested subtask kanban

2. **Backlog Sidebar**
   - [ ] Collapsible sections
   - [ ] Workspace headers
   - [ ] Channel groups
   - [ ] Empty states

3. **Kanban Column**
   - [ ] Column header
   - [ ] Empty state
   - [ ] Drag target indicator

4. **Buttons**
   - [ ] Primary action
   - [ ] Secondary action
   - [ ] Destructive action
   - [ ] Icon buttons

5. **Forms**
   - [ ] Text input
   - [ ] Textarea
   - [ ] Select/dropdown
   - [ ] Date picker
   - [ ] Checkbox
   - [ ] Radio buttons

6. **Modals**
   - [ ] Task creation
   - [ ] Task details
   - [ ] Settings

7. **Navigation**
   - [ ] Top bar
   - [ ] Sidebar nav
   - [ ] View switcher (Kanban/List/Calendar)

8. **Timers**
   - [ ] Focus timer display
   - [ ] Pomodoro timer display
   - [ ] Both visible simultaneously

9. **Completion Feedback**
   - [ ] Confetti animation specs
   - [ ] Sound selection
   - [ ] Color pulse effect

10. **Morning Ritual**
    - [ ] Greeting screen
    - [ ] Yesterday review interface
    - [ ] Quick action buttons

11. **End-of-Day Ritual**
    - [ ] Reflection interface
    - [ ] Streak display
    - [ ] Celebration screen

### Interaction Patterns

**Drag and Drop:**

```
- Visual feedback when dragging (card lifts, shadow)
- Clear drop zones (highlight or outline)
- Snap to grid on drop
- Undo option
- Alternative: click-to-move buttons (accessible fallback)
```

**Navigation:**

```
- Always visible "home" or back button
- Breadcrumbs if deep navigation
- Clear active state
- Keyboard shortcuts for power users
```

**Progressive Disclosure:**

```
- Minimalist default view
- Expand for details
- "Show more" patterns
- Reports hidden until requested
```

**Feedback:**

```
- Immediate visual response to actions
- Loading states (spinners, skeletons)
- Success confirmations (subtle, not annoying)
- Error messages (helpful, not technical)
```

### Animation Guidelines

**When to use animations:**

- [ ] Task completion (confetti - dopamine hit)
- [ ] Drag and drop feedback
- [ ] Modal open/close (smooth transition)
- [ ] Collapsible sections (smooth expand/collapse)

**When NOT to use animations:**

- [ ] General navigation (slows down)
- [ ] Data loading (use instant updates)
- [ ] Repeated actions (gets annoying)

**Animation specs:**

```
Duration: 200-300ms (fast, not sluggish)
Easing: ease-out (natural feeling)
Respect prefers-reduced-motion (accessibility)
```

---

## Design Rules (The Guardrails)

### Rule 1: One Primary Action Per View

- User should always know "what do I do next"
- Prominent primary button
- Secondary actions less prominent
- No decision paralysis

### Rule 2: Information Hierarchy

- Most important = biggest, boldest
- Metadata = smaller, muted
- Use size, weight, color to create clear hierarchy
- Scan in F-pattern (Western reading)

### Rule 3: Whitespace is Your Friend

- Never cram information
- Generous padding/margins
- Let content breathe
- Empty space reduces cognitive load

### Rule 4: Text + Icons Always

- Never icon-only (ambiguous)
- Always pair icon with label
- Redundant cues support memory

### Rule 5: Status Must Be Obvious

- Color-coded (but not color alone)
- Icon indicators
- Text labels
- Multiple cues for same information

### Rule 6: No Hidden Critical Features

- If it's important, make it visible
- Don't bury in menus
- Progressive disclosure for nice-to-haves only

### Rule 7: Consistency Everywhere

- Same patterns across app
- Don't reinvent interactions
- Predictable = less cognitive load

### Rule 8: Mobile-Responsive (Even Though Desktop-First)

- Layout adapts
- Touch targets adequate (44px minimum)
- Works on smaller screens

---

## Research Action Items

**Immediate (Before Design):**

1. [ ] Research ADHD UI best practices (1-2 hours)
2. [ ] Research dyslexia design guidelines (1-2 hours)
3. [ ] Screenshot/analyze Arc Browser UI patterns
4. [ ] Screenshot/analyze Printables layout
5. [ ] Compare Bitbucket vs GitHub (what's cleaner?)
6. [ ] Document TikTok/Instagram navigation patterns

**Design Phase:** 7. [ ] Define color palette (test with George) 8. [ ] Choose font family (test with George) 9. [ ] Create spacing/grid system 10. [ ] Design task card component 11. [ ] Design backlog sidebar 12. [ ] Create wireframes for main views 13. [ ] Build interactive prototype (Figma? or code directly?)

**Validation:** 14. [ ] Test prototype with George 15. [ ] Iterate based on feedback 16. [ ] Document final design system

---

## Tools & Resources

**Design Tools:**

- Figma (for mockups/prototypes)
- Excalidraw (for quick wireframes)
- Or code directly in Angular with placeholder content

**Color Tools:**

- Coolors.co (palette generation)
- Contrast checker (WCAG compliance)
- Adobe Color (accessibility tools)

**Typography:**

- Google Fonts
- FontPair (pairing suggestions)
- Type Scale (visual type scale generator)

**Inspiration:**

- Dribbble (ADHD-friendly task manager designs)
- Behance (case studies)
- Real apps (Arc, Printables, etc.)

---

## Next Steps

1. **Research session** - Claude investigates ADHD/dyslexia UI best practices
2. **Inspiration analysis** - Deep dive on Arc, Printables, Bitbucket/GitLab
3. **Draft design system** - Define colors, typography, spacing
4. **Wireframe key views** - Backlog sidebar + kanban board
5. **Get George's feedback** - Validate direction
6. **Iterate** - Refine until it feels right
7. **Document final system** - Ready for implementation

---

## Notes

- George has final say on what works for him
- Research informs, but user testing validates
- Start simple, iterate based on actual usage
- Ugly and functional > beautiful and unusable
