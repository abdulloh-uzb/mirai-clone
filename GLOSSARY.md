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

## Language

**UI language**:
The language the site is shown in. The student can change it at any time.
_Avoid_: Locale (on its own), site language

**Course language**:
The language a student's course is taught in. It is chosen before payment and fixed after that.
_Avoid_: Locale (on its own), enrollment language
