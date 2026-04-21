web application/stitch/projects/14436496760299674277/screens/d3c858e82a9d4971b34ff1c5e5e3a823
# Design System Specification: Axiom Geometric (Refined)

## 1. Overview & Creative North Star
**The Creative North Star: "The Friendly Scholar"**
The Axiom Geometric system is designed to transform the math learning experience from "clinical and dry" to "inviting and modern." By moving away from harsh, sharp-edged rectangles and embracing a softer, rounded visual language, we create a space that feels encouraging rather than intimidating, all while maintaining the clarity required for complex subject matter.

---

## 2. Visual Principles
*   **Approachable Geometry:** Every interactive element features a high degree of roundness (`ROUND_FULL`), symbolizing the fluid and continuous nature of learning.
*   **Learning-First Hierarchy:** Typography and spacing are optimized for mathematical notation and long-form problem solving, ensuring the UI never competes with the content.
*   **Intuitive Feedback:** Visual cues are prioritized through color and subtle elevation, providing immediate reinforcement for user actions.

---

## 3. Color Palette & Functional States

### Core Brand Colors
*   **Primary (Indigo):** `#3F51B5` - Used for primary actions, progress indicators, and key navigational elements.
*   **Background (Soft Gray):** `#F8FAFC` - A neutral, low-strain backdrop that makes mathematical symbols pop.
*   **Surface (White):** `#FFFFFF` - Used for cards and content containers to create depth.

### The Feedback Palette (Learning States)
These colors are specifically tuned to provide emotional and functional guidance without being visually jarring.
*   **Correct ("Success"):** `#10B981` (Emerald Green) - Clear, positive reinforcement for right answers.
*   **Almost ("Warning"):** `#F59E0B` (Amber/Yellow) - Encouraging, signaling a "close but not quite" state or a hint.
*   **Fail ("Error"):** `#EF4444` (Coral Red) - Direct but soft, used to highlight errors without feeling punitive.

---

## 4. Typography
*   **Typeface:** **Epilogue**
*   **Scale:** A modular scale that prioritizes readability for fractions, exponents, and equations. 
*   **Weight:** Bold for headers and button labels; regular for instructional text to keep the interface light.

---

## 5. UI Elements & Components
*   **Buttons:** Fully rounded pills (`border-radius: 9999px`). 
    *   *Primary:* Solid Indigo with White text.
    *   *Secondary:* Outlined Indigo with Indigo text.
*   **Input Fields:** Rounded containers with clear focus states using the Feedback Palette when validating answers.
*   **Progress Bars:** Smooth, rounded tracks with a high-contrast Indigo fill.
*   **Cards:** Softly shadowed, rounded-corner containers (`border-radius: 24px`) to group related problems or concepts.

---

## 6. Implementation Strategy
The design system will be applied across all screens—from the Practice Dashboard to the Results Summary—ensuring that every interaction feels consistent, supportive, and focused on the goal of mastering mathematics.