# RoadReady Traffic School

An online traffic violator school: drivers with a traffic ticket take a self-paced course so the court can hide the violation point.

## People

**Student**:
A signed-up person with the student role. They may or may not have bought the course.
_Avoid_: User (in domain talk), customer, learner

**Admin**:
School staff with full control over students, content, money and reporting.
_Avoid_: Teacher, staff, moderator

**Visitor**:
Someone browsing without being signed in. A visitor has no role.
_Avoid_: Guest, anonymous user

## Student stages

Every Student is in exactly one stage, set by their most recent enrollment. Admins see the counts and lists by stage.

**Registered**:
Has an account but no paid course: never bought it, or got a full refund.
_Avoid_: Lead, unpaid user

**Studying**:
Has paid and is working through the course; has not yet passed the final exam.
_Avoid_: Paid (on its own), active student, in progress

**Needs attention**:
Has paid but cannot go on without an Admin: paused after failed identity checks, locked after failing the final exam twice, or out of access time before finishing.
_Avoid_: Blocked, stuck

**Completed**:
Passed the final exam and received a certificate.
_Avoid_: Exam passed, graduated, finished

**Reported**:
Completed, and the DMV has accepted the school's completion report.
_Avoid_: Submitted (a report can be submitted and still rejected), DMV done

**Completion report**:
The school's electronic notice to the DMV that a Student completed the course. It is sent in batches, can be accepted or rejected, and an Admin can correct and re-send a rejected one.
_Avoid_: DMV submission, certificate (the certificate goes to the Student)

## Language

**UI language**:
The language the site is shown in. The student can change it at any time.
_Avoid_: Locale (on its own), site language

**Course language**:
The language a student's course is taught in. It is chosen before payment and fixed after that.
_Avoid_: Locale (on its own), enrollment language

## Courts and citations

**Citation**:
The traffic ticket a driver received. It has a citation number and a court due date, and is the reason the driver takes the course.
_Avoid_: Ticket (in domain talk; fine in UI copy), violation notice

**County**:
One of California's 58 counties. Each county has exactly one Court, and drivers pick their County to find it.
_Avoid_: Region, area

**Court**:
The superior court of one County, which decides whether a driver may take traffic school and hides the point afterwards.
_Avoid_: Courthouse (when the whole court is meant)

**Courthouse**:
One physical location of a Court, with its own address and court code. A Court can have several.
_Avoid_: Court (when one building is meant), branch

## Site content

**Support request**:
Shown to Admins as "Support requests". A message a person sends to the school: a contact message, a "Got a problem?" report, an accessibility (ADA) request or an AI handoff.
_Avoid_: Ticket (clashes with Citation), issue, case

**Translation**:
One language version of a content item. All versions of an item share one slug; a missing version is shown in English with a "not yet translated" notice.
_Avoid_: Localization, copy (for the item itself)

**Sample review**:
A made-up review used only to fill the demo. It is always labelled as a sample, in admin and on the site.
_Avoid_: Testimonial, fake review

**Classroom waitlist**:
The list of people who want the in-person classroom course when it opens.
_Avoid_: Notify-me list (that is the waitlist for other states)

**State waitlist**:
The list of people who want to be told when the school opens in their state.
_Avoid_: Notify-me list, classroom waitlist
