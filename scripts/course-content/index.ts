import { examQuestions } from "./exam";
import { section1 } from "./section-1";
import { section2 } from "./section-2";
import { section3 } from "./section-3";
import { section4 } from "./section-4";
import { section5 } from "./section-5";
import { section6 } from "./section-6";
import { section7 } from "./section-7";
import { section8 } from "./section-8";
import type { SectionContent } from "./helpers";

export const COURSE_SLUG = "california-traffic-violator-course";

/** Demo minimum per lesson. TODO(spec): real minimums. */
export const LESSON_MIN_SECONDS = 60;

export const sections: { position: number; content: SectionContent }[] = [
  section1,
  section2,
  section3,
  section4,
  section5,
  section6,
  section7,
  section8,
].map((content, index) => ({ position: index + 1, content }));

export { examQuestions };
