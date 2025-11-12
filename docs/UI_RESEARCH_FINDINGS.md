# ADHD-Friendly and Dyslexia-Friendly UI/UX Design Research Summary

## 1. ADHD-Friendly UI Design

### Core Design Principles

**Minimize Visual Clutter**
- Excess visual clutter leads to cognitive overload for ADHD users
- Clean, minimalist design with minimal visual distractions is crucial
- Limit primary navigation to 5-7 main categories to prevent overwhelming users
- Use white space strategically - studies show adequate white space improves text comprehension by 20% and reduces errors by 62%

**Information Display Guidelines**
- ADHD brains don't filter information effectively and struggle to order, prioritize, and organize incoming data
- Cognitive overload occurs when users are forced to process too much information at once
- Information anxiety isn't caused by large amounts of information, but by large amounts of **irrelevant** information
- Break content into manageable chunks using short paragraphs, bullet points, or collapsible sections
- Keep progressive disclosure levels below three for optimal effectiveness

**Visual & Audio Cues**
- Incorporate visual and audio cues to help with short-term memory challenges
- Visual cues bypass many executive functioning demands by creating direct pathways from seeing to doing
- Make objects, actions, and options obvious and persistent - users shouldn't rely on memory
- Visual cues like icons and labels act as signposts telling users exactly what to do next
- Make cues more obvious by placing them where they cannot be missed
- Use colorful, novel, or personally meaningful visual cues to provide dopamine hits

**Reduce Decision Fatigue**
- Follow Hick's Law: fewer choices = faster decisions
- Research shows individuals with ADHD exhibit increased brain activation during decision tasks compared to neurotypical controls
- Limit choices to streamline decisions and reduce mental load
- Smart defaults and automation reduce cognitive load by making choices for users while allowing customization
- Autofill, smart defaults, and predictive search reduce required thinking

**Making "Next Action" Always Obvious**
- Progressive disclosure gradually reveals information and breaks things into manageable chunks
- Simplifying flows into steps provides feeling of progress and dopamine boosts
- Use clear call-to-action buttons
- Features like distraction-free modes, task breakdowns, and progress indicators support focus and executive function
- Allow users to pause and resume tasks - don't expect everything in one go

### Color Palettes for ADHD

**Recommended Colors**
- Soft, muted colors: light blues, greens, and pastels reduce sensory overload
- Blue facilitates concentration and learning, lowers heart rate and blood pressure
- Green can enhance reading ability and comprehension
- Use soft hues with minimal saturation - easy on the eyes

**Colors to Avoid**
- Bright and intense colors (reds, oranges, yellows) can be overstimulating
- These colors may increase hyperactivity and agitation
- Use sparingly if at all

**Color Strategy**
- Consistent and simple color schemes reduce visual clutter and promote order
- Sudden changes in color can be distracting
- Use neutral backgrounds with strategic color accents for visual interest without overstimulation
- Minimal cognitive load through minimalist palette

**The Best Colors for Focus vs. Distraction Study (W3C)**
People with dyslexia most preferred (in order):
1. Black & yellow
2. Black & cream
3. Blue & white
4. Black & white
5. Blue & yellow
6. Dark brown & light green

**Note**: Off-black and off-white is recommended rather than pure black and white

### Navigation Patterns

**Sidebar Navigation Best Practices**
- Simple, straightforward navigation systems help users find their way without getting lost
- Consistent and predictable layouts make navigation intuitive and reassuring
- Keep navigation menus in same place and order on all pages
- Use consistent colors and icons to convey specific messages
- Consider collapsible menus (accordions) to moderate initial cognitive load
- Offer option to hide parts of UI (e.g., navigation areas) to reduce visual/cognitive overwhelm
- Careful with icons - too many can cause cognitive overload

### Animation Guidelines

**Impact on ADHD Users**
- People with ADHD might be so distracted by animated elements they forget why they visited the website
- Non-essential movement can trigger distraction, dizziness, headaches, and nausea
- Blinking and flashing animation is particularly problematic for ADHD

**Technical Requirements**
- Implement `prefers-reduced-motion` media query to provide experience with fewer animations
- Motion animation triggered by interaction can be disabled unless essential
- Build option for users to pause, stop, or hide movement for non-essential moving/blinking/scrolling elements that start automatically, last more than 5 seconds
- Avoid flashes and limit bounces to 3 times maximum
- Excessive animations, autoplay videos, flashing graphics, pop-up ads, and busy backgrounds cause sensory overload

**WCAG Guidelines**
- WCAG 2.3.3: Animation from interactions can be disabled unless essential to functionality
- Reduce unnecessary animations to minimize distractions

### Gamification Elements

**Why Gamification Works**
- ADHD brains have lower dopamine availability, making tasks without immediate payoff feel uninteresting
- Gamification triggers reward loops that strengthen task engagement
- Each action provides immediate feedback to reinforce forward motion
- Research shows apps with game elements had 48% higher retention than non-gamified ones
- Study with adolescents reported 60% boost in compliance with rewards like points, badges, and streaks

**Effective Gamification Elements**
- **Streaks**: Visual progress bars track consecutive days completing tasks, create sense of consistency
- **Completion Animations**: Color changes, animations, or icons offer immediate feedback
- **Micro-Rewards**: Points, badges, and achievements tap into dopamine system for habit formation
- **Progress Tracking**: Visual indicators showing advancement towards goals
- **Daily Streak Counters**: Provide motivation boost to keep going
- **Subtle Sounds**: Signal progress and invite users back

**Design Considerations**
- Keep gamification simple, meaningful, and tailored to individual needs
- Avoid flashy visuals and constant feedback that could lead to sensory overload
- Prevent novelty from fading by varying rewards
- Don't make it too complex - simplicity is key

### Time Blindness Solutions

**The Problem**
- Time blindness is the inability to sense the passing of time
- People with ADHD struggle to sense time passage internally
- Abstract time concepts are difficult for ADHD brains to process

**Visual Timer Design**
- **Pie-chart/colored disk approach**: Red disk provides immediate visual update of time passed and remaining
- Make time visible and trackable - externalize it
- Analog clocks show movement of time more intuitively than digital
- Display time as shrinking colored disk to make abstract time concrete

**UI Implementation**
- Use calendars, reminders, timers, and visual cues to make time visible
- Break day into chunks and subchunks with visual timers for each segment
- Time blocking: Schedule blocks and use visual timers to track
- Seeing time disappear helps reinforce limits and transitions
- Consider hourglass visualizations for time passing

**Recommended Apps/Features**
- Structured (visual daily planner)
- Inflow (ADHD management)
- Toggl (time tracking)
- Time Timer (pie-chart approach)

---

## 2. Dyslexia-Friendly Design

### Typography

**Recommended Font Families**

**Top Choices (Research-Backed)**
- **Arial**: Widely supported, though spacing criticized as "horrible" and letters "quite closed"
- **Helvetica**: Performed well in studies, preferred by dyslexics over specialized fonts
- **Verdana**: Explicitly designed for on-screen reading with wide letter spacing, tall x-heights, highly legible at small sizes
- **Tahoma**: Bold straightforward lines, narrow clean appearance, strong character definition
- **Comic Sans**: BDA recommends it - letters appear less crowded, few repeated letter-shapes, but not empirically tested
- **Trebuchet**: BDA recommended
- **Calibri**: BDA recommended
- **Century Gothic**: BDA recommended
- **Open Sans**: Straightforward, clear spacing, tall letter sizes, rounded shapes, free and open-source

**Key Characteristics**
- Sans serif, monospaced, and roman font styles significantly improve reading performance
- Wide letter spacing (letterforms spaced farther apart)
- Tall x-heights
- Clear, distinct letterforms
- Strong character definition

**Fonts to Avoid**
- Serif fonts (letters can appear crowded)
- Proportional fonts
- Italic fonts (especially OpenDyslexic Italic) - significantly reduce readability

### OpenDyslexic Font Controversy

**Research Findings - Mostly Negative**
- 2016 study (Wery & Diliberto): No improvement in reading rate or accuracy for students with dyslexia
- Actually reduced reading speed and accuracy compared to Arial and Times New Roman
- None of the students preferred reading in OpenDyslexic
- Rello & Baeza-Yates (2013): No significant improvement in reading time or eye fixation with OD
- Standard fonts like Arial, Helvetica, and Verdana were more effective and preferred than specialized dyslexia fonts

**Positive Finding**
- 2023 study: OpenDyslexic effective in increasing reading fluency and comprehension for three students
- Readers reported font was easier to read, leading to less reading anxiety

**Scientific Consensus**
- OpenDyslexic does not provide measurable improvements in reading performance for most individuals with dyslexia
- However, subjective preference matters - some find it reduces anxiety even if performance doesn't improve

### Font Size

- **Body Text**: 12-14 point or equivalent (1-1.2em / 16-19px)
- **Headings**: At least 20% larger than normal text

### Spacing Guidelines

**Letter Spacing**
- BDA 2018 guide recommends larger inter-letter/character spacing (tracking)
- Ideally around **35% of the average letter width**
- Improves readability significantly

**Word Spacing**
- Inter-word spacing should be at least **3.5 times the inter-letter spacing**

**Line Spacing**
- **1.5 line spacing is preferable** (BDA recommendation)
- Some sources suggest 1.5x-2x range
- For optimal readability, aim for line height of 1.5x the font size

### Line Length

**General Guidelines**
- **BDA Recommendation**: 60-70 characters per line
- **Optimal for body text**: 50-60 characters (Emil Ruder)
- **Widely regarded as satisfactory**: 45-75 characters
- **Ideal**: 66 characters often cited
- **For dyslexic readers**: Up to 45 characters to minimize visual tracking difficulties

**Accessibility Standards**
- **WCAG 1.4.8**: Lines should be 80 or fewer characters (40 or fewer for Chinese/Japanese/Korean)
- **Novice readers**: 34-60 characters (45 optimal)
- **Expert readers**: 45-80 characters (60 optimal)

**Key Insight**: 40-60 character range particularly well-suited for novice readers and those with dyslexia

### Color Contrast

**WCAG Requirements**
- **Level AA**: Text and background contrast ratio of at least **4.5:1**
- **Level AA Large Text**: Heading/larger text at least **3:1**
- **Level AAA**: Text and background at least **7:1**
- **Level AAA Large Text**: At least **4.5:1**

**Large text defined as**: At least 18pt, or 14pt bold

**Dyslexia-Specific Considerations**
- Total contrast (pure white on black or vice versa) can be **difficult** for people with dyslexia
- Very high contrast can hinder readability
- Better option: Black text on off-white background
- Use cream or soft pastel color for backgrounds
- White can appear too dazzling
- **Avoid pure black on pure white**

### Text Alignment

**Recommended: Left-Aligned**
- BDA guideline: Left align text, without justification
- Creates consistent edge that helps users with visual tracking issues
- Research (Ling & van Schaik): Left-aligned text boosted performance over justified

**Avoid: Justified Text**
- Creates "rivers" of white running down the page due to extra word spacing
- River effect: Large irregular gaps stack up, creating distracting whitespace
- Wide spaces make it difficult to identify individual words
- Uneven spacing creates "wavy" effect that's distracting
- WCAG AAA (1.4.8): No justified text for highest conformance

**Also Avoid**
- Centered text (limit to 1-2 line blocks)
- Right-aligned text

### Chunking Information

**Why It Matters**
- "Walls of text" (large blocks of unbroken text) particularly difficult for dyslexic readers
- Breaking text into smaller chunks helps process information more effectively
- Visual breaks reduce cognitive load

**Best Practices**
- **Short paragraphs**: 3-5 sentences ideally
- **Descriptive headings and subheadings**: Help with orientation and finding information
- **Bullet points**: Where appropriate
- **Extra line spacing**: Between paragraphs
- **Avoid cramping material**: Space it out
- **Avoid long, dense paragraphs**
- **Use readable fonts and consistent spacing**
- **Well-organized sections**: Aid comprehension

---

## 3. Specific Design Patterns

### Kanban Boards for ADHD Users

**Why Kanban Works**
- Visual organization helps ADHD users stay focused and manage tasks effectively
- Visual representation perfect for ADHD brains that thrive on clarity
- Helps grasp entire workflow at a glance, reducing cognitive overload
- Provides clear focus on ongoing tasks

**Core Principles**
1. **Visualize your work**
2. **Limit your works in progress**

**Recommended Structure**
- Columns: To Do, Doing, Done
- Provides sense of progress
- Keeps users focused on few tasks rather than flitting between many

**Key Features**
- **Color coding**: Assign colors to indicate priority, urgency, or categories - visual cues help identify what needs attention
- **Custom statuses**: Closed, Open, Review, In Progress, Blocked
- **Task specificity**: Clear, specific task descriptions (e.g., "Study math chapter 5, pages 45-60, for 30 minutes" vs. "Study math")
- **Physical option**: Experts recommend starting with Post-It notes and whiteboard before digital

**Benefits**
- Visualizing tasks and progress makes it easier to stay focused
- Prioritizing based on urgency prevents overwhelm
- Breaking down larger tasks into smaller, manageable steps
- Prevents feeling overwhelmed by backlog

### Card-Based Layouts

**Why They Work**
- Break information into digestible, scannable chunks
- Reduce cognitive load
- Support visual processing
- Allow for easy reorganization (drag-and-drop)
- Mirror fluid nature of thoughts and priorities many with ADHD experience

**Best Practices**
- Use consistent card structure
- Include visual indicators (status, priority)
- Allow customization of card appearance
- Support detailed descriptions, checklists, attachments within cards
- Enable due dates and reminders

### Progressive Disclosure

**Definition**
- Technique that reduces cognitive load by gradually revealing information as needed
- Ensures users get right amount of information at right time

**Implementation Patterns**
- **Accordions and tabs**: For organizing content
- **Dropdown menus**: Keep interfaces uncluttered
- **Step-by-step processes (staged disclosure)**: For complex forms and onboarding
- **Collapsible sections**: Let users control information density

**ADHD-Specific Benefits**
- Helps maintain focus by revealing information only when necessary
- Prevents overwhelm from seeing too much at once
- Allows users to focus on one task at a time (e.g., Nike's step-by-step onboarding)

**Best Practices**
- Keep disclosure levels below three - too many layers have opposite effect
- Ensure clear and intuitive navigation paths
- Provide context about what's hidden
- Make it obvious how to expand/collapse

### Status Indicators

**Why Color Coding Works for ADHD**
- Studies show color boosts memory and attention
- Visual cues help compensate for executive function challenges
- Children with ADHD can focus significantly longer on colorful text vs. plain
- Color enhances memory performance

**Common Color Coding Systems**

**By Energy Level/Effort**
- Green: 5-minute tasks
- Orange: Medium-effort tasks
- Red: Big-deal tasks requiring major focus
- Purple: "Would be nice" tasks (not urgent but meaningful)

**By Priority/Urgency**
- Red: Urgent/deadline tasks
- Yellow: Medium priority
- Green: "Go!" - top priority or low urgency (depends on system)

**By Life Category**
- Blue: Work
- Green: Personal/health
- Red: Urgent/deadline
- Yellow: Fun and social
- Purple: Family

**Traffic Light System**
- Red: Not started/blocked
- Yellow: In progress
- Green: Complete

**Design Recommendations**
- Externalize priorities - make them visible
- Reduce cognitive load through visual systems
- Allow customization of color meanings
- Include task completion celebrations
- Visual progress indicators
- Combine with gamification elements

---

## 4. Dark Mode vs. Light Mode

### Research Findings - Complex and Individualized

**For Dyslexia**
- **Mixed preferences** - highly individual
- Many prefer lighter backgrounds with appropriate contrast (not pure white)
- Some find dark mode easier (reduces visual noise and distraction)
- Total contrast (pure white on black OR black on white) can be difficult
- Higher contrast harder for many to read
- **Best solution**: Change background to something other than white or black

**For ADHD**
- Neurodivergent users find dark mode less overstimulating
- Improves focus and usability for some

**Accessibility Concerns**
- Dark mode can cause "halation effect" for users with astigmatism (~47% of people)
- Can make things hard to read for people with dyslexia and astigmatism
- Not a one-size-fits-all accessibility solution

**Recommendation**
- **Provide user choice** - essential
- Dark mode valuable option but not universal solution
- Best approach: Offer customization options
- Consider off-white/cream and off-black options in addition to pure white/black

---

## 5. Real App Examples & Case Studies

### Amazing Marvin

**Why It Works for ADHD**
- Designed specifically for executive dysfunction, ADHD, and procrastinators
- "Hands down one of the best to-do apps for ADHD"

**Key Features**
- **Full customization**: Tailor workflows, color schemes, productivity strategies
- **Strategies library**: Enable/disable features based on specific ADHD challenges
- **Procrastination Wizard**: Identifies barriers to productivity, provides strategies to overcome
- **Eisenhower Matrix**: Built-in priority framework
- **Pomodoro Technique**: Integrated time management
- **Completion feedback**: Marshmallow mascot dances when you finish tasks
- **View completed tasks**: From daily view for sense of accomplishment

**User Testimonials**
- "Every task needs a different tool, and some days I need more tools than others"
- "ADHD craves structure but loves novelty - Marvin is the perfect level of customizable vs structured"
- Everything needed is immediately available and customizable

### TickTick

**ADHD-Friendly Features**
- "Built to help you focus on your tasks, not just keep track of them"
- Rewards focus with fun achievement system

**Gamification System**
- **Points**: For task creation, task completion (scaled by priority/complexity), habit tracking
- **Achievements & badges**: For specific milestones
- **Streaks**: For maintaining daily/weekly task completion
- **Visual progress bars**: Showing advancement towards goals

**UI Design**
- Clean, user-friendly design minimizes friction when capturing tasks
- Priority levels (low, medium, high) visually distinguish urgent tasks
- Color coding as ADHD-friendly feature
- Integrated tools reduce cognitive load (to-do, calendar, habit tracker, Pomodoro timer all in one)

**Key Features**
- **"Won't do" option**: Leaves door open for low-energy days
- **Eisenhower Matrix**: View and assign tasks by importance and urgency
- **Built-in Pomodoro**: Estimate task duration, track time via sprints
- **Quick capture**: Hotkeys and voice capture for fleeting ideas

### Trello

**Why It's ADHD-Friendly**
- "Much more ADHD-friendly with highly visual interface"
- "Works like magic for people with ADHD"
- Makes it easier to see, understand, and prioritize goals

**Visual Processing**
- Many with ADHD are visual thinkers who process information better in graphical format
- Having tasks visually clear makes it quicker to know where work is or what to work on next
- Capitalizes on brain's ability to process visual information more efficiently than text

**Design Features**
- **Board-and-card system**: Perfect for non-linear thinking
- **Drag-and-drop**: Easy reorganization of tasks
- **Visual representation**: Reduces overwhelm, provides clearer sense of what needs to be done
- **Fixed board layout**: Consistency and predictability
- **Intuitive organization**: Makes task management stress-free
- **Color coding**: With deadlines and reminders
- **Detailed cards**: Descriptions, checklists, attachments help break down complex tasks

---

## 8. Actionable Design Recommendations

### Typography Hierarchy
```
Font Family: Verdana, Arial, Tahoma, Open Sans, Helvetica (in priority order)
Body Text Size: 16-19px (1-1.2em)
Heading Size: At least 20% larger than body
Letter Spacing: 0.12em (35% of average letter width)
Word Spacing: 0.42em (3.5x letter spacing)
Line Height: 1.5
Line Length: 45-60 characters (max 70 for dyslexia)
Alignment: Left-aligned, never justified
```

### Color Palette
```
Background: Off-white (#FAFAF8) or cream, never pure white
Text: Off-black (#2B2B2B), never pure black
Accent Colors: Muted blues and greens for calm
Avoid: Bright reds, oranges, yellows
Status Colors:
  - Green: Complete/low effort
  - Orange/Yellow: In progress/medium effort
  - Red: Urgent/high effort
  - Blue: Informational
Contrast Ratio: Minimum 4.5:1, but avoid pure black/white
```

### Layout Structure
```
White Space: Generous - aim for 20% comprehension improvement
Progressive Disclosure: Maximum 3 levels deep
Navigation Items: Limit to 5-7 primary items
Paragraph Length: 3-5 sentences
Spacing Between Paragraphs: 1.5-2x line height
Card Padding: Generous internal spacing
Chunking: Use headings, bullets, short paragraphs
```

### Interactive Elements
```
Animations:
  - Implement prefers-reduced-motion
  - Limit bounces to 3 max
  - No autoplay, flashing, or blinking
  - Keep subtle and purposeful

Buttons:
  - Clear, obvious call-to-action
  - High contrast
  - Generous click/tap targets
  - Immediate visual feedback

Forms:
  - One question per screen (staged disclosure)
  - Smart defaults
  - Autofill where possible
  - Clear field labels and icons
  - Error messages that guide
```

### Task Management Features
```
Board Structure:
  - Kanban: To Do, Doing, Done (minimum)
  - Color-coded by priority/category
  - Limit WIP (works in progress)

Visual Timers:
  - Pie chart/shrinking disk approach
  - Color changes as time depletes
  - Make time visible and concrete

Gamification:
  - Streaks with visual counter
  - Completion animations (subtle)
  - Points/badges for milestones
  - Progress bars
  - Keep simple, avoid overwhelming

Status Indicators:
  - Color-coded (customizable system)
  - Clear visual differentiation
  - Traffic light approach works well
  - Allow user to define meanings
```

### Customization Options (Essential)
```
Required Options:
  - Dark mode / Light mode / Auto
  - Font size adjustment
  - Color scheme customization
  - Animation on/off toggle
  - Notification preferences
  - Layout density (compact/comfortable/spacious)
```

### Navigation Best Practices
```
Sidebar:
  - Consistent position
  - Collapsible sections
  - Clear icons + labels
  - Option to hide entirely
  - Limit to 5-7 main items

General:
  - Breadcrumbs for orientation
  - Persistent navigation
  - Clear current location indicator
  - No sudden changes in placement
```
