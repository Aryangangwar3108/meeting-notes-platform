from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
from app import models, crud, schemas

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Clear existing data
db.query(models.MeetingParticipant).delete()
db.query(models.TranscriptSegment).delete()
db.query(models.ActionItem).delete()
db.query(models.Topic).delete()
db.query(models.Meeting).delete()
db.query(models.Participant).delete()
db.commit()

# Create participants
participants_data = [
    {"name": "Sarah Chen", "email": "sarah.chen@company.com"},
    {"name": "John Smith", "email": "john.smith@company.com"},
    {"name": "Alex Rivera", "email": "alex.rivera@company.com"},
    {"name": "Emily Watson", "email": "emily.watson@company.com"},
    {"name": "Michael Brown", "email": "michael.brown@company.com"},
    {"name": "Lisa Park", "email": "lisa.park@company.com"},
]

participants = []
for p_data in participants_data:
    participant = models.Participant(**p_data)
    db.add(participant)
    db.commit()
    db.refresh(participant)
    participants.append(participant)

# Meeting 1: Q4 Product Strategy
meeting1 = models.Meeting(
    title="Q4 Product Strategy",
    summary="Discussion about Q4 product roadmap, focusing on new feature launches and timeline alignment across teams.",
    date=datetime(2026, 9, 24, 14, 0),
    duration=42
)
db.add(meeting1)
db.commit()
db.refresh(meeting1)

# Add participants to meeting 1
for p in participants[:4]:
    mp = models.MeetingParticipant(meeting_id=meeting1.id, participant_id=p.id)
    db.add(mp)

# Add transcript segments for meeting 1
transcript1 = """00:00 Sarah Chen
Welcome everyone to our Q4 product strategy meeting. Today we need to finalize our launch timeline and discuss key priorities.

00:12 John Smith
Thanks Sarah. I think we should start with the timeline discussion since that's the most pressing item.

00:24 Alex Rivera
I agree. Marketing needs the final launch date by end of week to prepare campaigns.

00:41 Sarah Chen
Let's target the second week of October. That gives us enough buffer for QA and final polish.

01:05 Emily Watson
From engineering perspective, that timeline is tight but achievable if we cut scope on the advanced analytics feature.

01:23 John Smith
What would that mean for the MVP? Can we still deliver core value without analytics?

01:45 Alex Rivera
Yes, absolutely. The core value proposition is around team collaboration and real-time updates. Analytics can be a v1.1 feature.

02:10 Sarah Chen
Great, let's proceed with October 14th as the target date. Alex, please coordinate with marketing.

02:30 John Smith
I'll update the project plan and communicate the scope changes to the engineering team."""

crud.parse_and_add_transcript(db, meeting1.id, transcript1)

# Add action items for meeting 1
action_items1 = [
    models.ActionItem(
        meeting_id=meeting1.id,
        title="Update project plan with new timeline",
        description="Revise project plan to reflect October 14th launch date and scope changes",
        assignee="John Smith",
        due_date=datetime(2026, 9, 26),
        completed=False
    ),
    models.ActionItem(
        meeting_id=meeting1.id,
        title="Coordinate marketing campaign timeline",
        description="Work with marketing team to align campaign launch with October 14th date",
        assignee="Alex Rivera",
        due_date=datetime(2026, 9, 27),
        completed=False
    ),
    models.ActionItem(
        meeting_id=meeting1.id,
        title="Scope advanced analytics feature to v1.1",
        description="Remove advanced analytics from MVP and plan for v1.1 release",
        assignee="Emily Watson",
        due_date=datetime(2026, 9, 28),
        completed=False
    ),
]
for ai in action_items1:
    db.add(ai)

# Add topics for meeting 1
topics1 = [
    models.Topic(meeting_id=meeting1.id, title="Introduction", timestamp=0),
    models.Topic(meeting_id=meeting1.id, title="Timeline Discussion", timestamp=12),
    models.Topic(meeting_id=meeting1.id, title="Marketing Coordination", timestamp=24),
    models.Topic(meeting_id=meeting1.id, title="Scope Decisions", timestamp=41),
    models.Topic(meeting_id=meeting1.id, title="Final Timeline", timestamp=130),
]
for t in topics1:
    db.add(t)

# Meeting 2: Weekly Marketing Sync
meeting2 = models.Meeting(
    title="Weekly Marketing Sync",
    summary="Regular marketing team sync discussing campaign performance, upcoming launches, and resource allocation.",
    date=datetime(2026, 9, 22, 10, 0),
    duration=35
)
db.add(meeting2)
db.commit()
db.refresh(meeting2)

# Add participants to meeting 2
for p in participants[1:5]:
    mp = models.MeetingParticipant(meeting_id=meeting2.id, participant_id=p.id)
    db.add(mp)

transcript2 = """00:00 Alex Rivera
Good morning team. Let's start with a quick review of last week's campaign performance.

00:15 Michael Brown
The email campaign had a 28% open rate, which is above our benchmark of 25%. Click-through was 4.2%.

00:32 Lisa Park
Social media engagement was strong on LinkedIn but weaker on Twitter. We should adjust our strategy.

00:48 Alex Rivera
Agreed. Let's focus more resources on LinkedIn for the next campaign. What's coming up this week?

01:05 Michael Brown
We have the product launch campaign starting Thursday. Assets are ready and the team is briefed.

01:22 Lisa Park
I'll need final copy approval by tomorrow EOD. Also, we should consider a blog post to support the launch.

01:40 Alex Rivera
Good idea. Michael, can you coordinate with the product team for blog content? Lisa, please finalize the copy.

02:00 Michael Brown
Will do. I'll set up a meeting with product team today.

02:15 Alex Rivera
Perfect. Let's also discuss budget allocation for Q4..."""

crud.parse_and_add_transcript(db, meeting2.id, transcript2)

action_items2 = [
    models.ActionItem(
        meeting_id=meeting2.id,
        title="Finalize launch campaign copy",
        description="Complete and approve all copy for Thursday's product launch campaign",
        assignee="Lisa Park",
        due_date=datetime(2026, 9, 23),
        completed=True
    ),
    models.ActionItem(
        meeting_id=meeting2.id,
        title="Coordinate blog content with product team",
        description="Work with product team to create blog post supporting the launch",
        assignee="Michael Brown",
        due_date=datetime(2026, 9, 24),
        completed=False
    ),
]
for ai in action_items2:
    db.add(ai)

topics2 = [
    models.Topic(meeting_id=meeting2.id, title="Campaign Performance Review", timestamp=0),
    models.Topic(meeting_id=meeting2.id, title="Social Media Strategy", timestamp=32),
    models.Topic(meeting_id=meeting2.id, title="Upcoming Campaigns", timestamp=48),
    models.Topic(meeting_id=meeting2.id, title="Content Planning", timestamp=100),
]
for t in topics2:
    db.add(t)

# Meeting 3: Client Discovery Call
meeting3 = models.Meeting(
    title="Client Discovery Call - TechCorp",
    summary="Initial discovery call with TechCorp to understand their requirements for our collaboration platform.",
    date=datetime(2026, 9, 20, 15, 30),
    duration=28
)
db.add(meeting3)
db.commit()
db.refresh(meeting3)

# Add participants to meeting 3
for p in participants[0:3]:
    mp = models.MeetingParticipant(meeting_id=meeting3.id, participant_id=p.id)
    db.add(mp)

transcript3 = """00:00 Sarah Chen
Welcome to our discovery call. We're excited to learn more about TechCorp's collaboration needs.

00:12 John Smith
Thanks for having us. We're looking for a solution that can handle 500+ concurrent users with real-time updates.

00:28 Sarah Chen
That's well within our capabilities. Can you tell us more about your current workflow and pain points?

00:45 Alex Rivera
Currently using a mix of tools that don't integrate well. Team members waste time switching between applications.

01:02 John Smith
We also need robust reporting and analytics to track project progress across multiple teams.

01:20 Sarah Chen
Our platform includes those features. Would you be interested in a demo next week?

01:35 John Smith
Yes, that would be helpful. Can we include our CTO in the demo?

01:48 Sarah Chen
Absolutely. I'll send calendar invites for Tuesday at 2pm."""

crud.parse_and_add_transcript(db, meeting3.id, transcript3)

action_items3 = [
    models.ActionItem(
        meeting_id=meeting3.id,
        title="Schedule demo with TechCorp",
        description="Set up demo meeting including TechCorp's CTO for Tuesday at 2pm",
        assignee="Sarah Chen",
        due_date=datetime(2026, 9, 21),
        completed=True
    ),
    models.ActionItem(
        meeting_id=meeting3.id,
        title="Prepare demo environment",
        description="Set up demo environment with 500+ user simulation for TechCorp demo",
        assignee="Alex Rivera",
        due_date=datetime(2026, 9, 24),
        completed=False
    ),
]
for ai in action_items3:
    db.add(ai)

topics3 = [
    models.Topic(meeting_id=meeting3.id, title="Introduction", timestamp=0),
    models.Topic(meeting_id=meeting3.id, title="Requirements Discussion", timestamp=12),
    models.Topic(meeting_id=meeting3.id, title="Current Challenges", timestamp=28),
    models.Topic(meeting_id=meeting3.id, title="Solution Overview", timestamp=80),
    models.Topic(meeting_id=meeting3.id, title="Next Steps", timestamp=108),
]
for t in topics3:
    db.add(t)

# Meeting 4: Engineering Sprint Planning
meeting4 = models.Meeting(
    title="Engineering Sprint Planning",
    summary="Sprint planning session for Sprint 24, covering backlog items, capacity planning, and technical debt considerations.",
    date=datetime(2026, 9, 18, 11, 0),
    duration=55
)
db.add(meeting4)
db.commit()
db.refresh(meeting4)

# Add participants to meeting 4
for p in participants[2:6]:
    mp = models.MeetingParticipant(meeting_id=meeting4.id, participant_id=p.id)
    db.add(mp)

transcript4 = """00:00 Emily Watson
Let's start sprint planning. We have 10 days this sprint with the team at full capacity.

00:18 Alex Rivera
I've prioritized the backlog. Top items are the API performance improvements and the new user onboarding flow.

00:35 Michael Brown
The API work is estimated at 5 days. Onboarding should take 3 days with the current designs.

00:52 Lisa Park
We should also allocate time for technical debt. The authentication module needs refactoring.

01:10 Emily Watson
Good point. Let's allocate 2 days for tech debt. That totals 10 days, which fits our capacity.

01:28 Alex Rivera
What about the mobile app updates? Those were requested by product.

01:45 Emily Watson
We'll need to defer those to next sprint. The team doesn't have capacity this round.

02:00 Michael Brown
I'll update the sprint board and communicate the plan to the team."""

crud.parse_and_add_transcript(db, meeting4.id, transcript4)

action_items4 = [
    models.ActionItem(
        meeting_id=meeting4.id,
        title="Update sprint board",
        description="Update Jira board with sprint 24 items and assignments",
        assignee="Michael Brown",
        due_date=datetime(2026, 9, 19),
        completed=True
    ),
    models.ActionItem(
        meeting_id=meeting4.id,
        title="Communicate sprint plan to team",
        description="Send sprint plan email to engineering team with assignments and deadlines",
        assignee="Emily Watson",
        due_date=datetime(2026, 9, 19),
        completed=True
    ),
    models.ActionItem(
        meeting_id=meeting4.id,
        title="Refactor authentication module",
        description="Address technical debt in authentication module as planned",
        assignee="Lisa Park",
        due_date=datetime(2026, 9, 25),
        completed=False
    ),
]
for ai in action_items4:
    db.add(ai)

topics4 = [
    models.Topic(meeting_id=meeting4.id, title="Capacity Planning", timestamp=0),
    models.Topic(meeting_id=meeting4.id, title="Backlog Prioritization", timestamp=18),
    models.Topic(meeting_id=meeting4.id, title="Technical Debt", timestamp=52),
    models.Topic(meeting_id=meeting4.id, title="Scope Decisions", timestamp=88),
]
for t in topics4:
    db.add(t)

# Meeting 5: Product Launch Review
meeting5 = models.Meeting(
    title="Product Launch Review",
    summary="Post-launch review of the v2.0 release, analyzing metrics, gathering feedback, and planning improvements.",
    date=datetime(2026, 9, 15, 14, 30),
    duration=38
)
db.add(meeting5)
db.commit()
db.refresh(meeting5)

# Add participants to meeting 5
for p in participants[0:5]:
    mp = models.MeetingParticipant(meeting_id=meeting5.id, participant_id=p.id)
    db.add(mp)

transcript5 = """00:00 Sarah Chen
Thank you everyone for the successful v2.0 launch. Let's review the metrics and discuss what we learned.

00:15 Alex Rivera
Launch day traffic exceeded expectations by 40%. We had 2,500 sign-ups in the first 24 hours.

00:32 John Smith
User feedback has been overwhelmingly positive. The new interface is receiving great reviews.

00:48 Emily Watson
We did encounter some performance issues during peak load. Response times spiked to 3 seconds.

01:05 Michael Brown
The load balancer handled it well, but we should optimize the database queries for the next release.

01:22 Lisa Park
Support tickets increased by 25% but most were simple onboarding questions. We should improve our documentation.

01:40 Sarah Chen
Great insights. Let's create action items for performance optimization and documentation improvements.

02:00 Alex Rivera
I'll work with engineering on the performance optimization. Lisa can lead the documentation effort."""

crud.parse_and_add_transcript(db, meeting5.id, transcript5)

action_items5 = [
    models.ActionItem(
        meeting_id=meeting5.id,
        title="Optimize database queries",
        description="Address performance issues identified during launch peak load",
        assignee="Michael Brown",
        due_date=datetime(2026, 9, 22),
        completed=True
    ),
    models.ActionItem(
        meeting_id=meeting5.id,
        title="Improve onboarding documentation",
        description="Create better documentation to reduce support ticket volume",
        assignee="Lisa Park",
        due_date=datetime(2026, 9, 25),
        completed=False
    ),
    models.ActionItem(
        meeting_id=meeting5.id,
        title="Analyze user feedback patterns",
        description="Deep dive into user feedback to identify improvement opportunities",
        assignee="John Smith",
        due_date=datetime(2026, 9, 26),
        completed=False
    ),
]
for ai in action_items5:
    db.add(ai)

topics5 = [
    models.Topic(meeting_id=meeting5.id, title="Launch Metrics", timestamp=0),
    models.Topic(meeting_id=meeting5.id, title="User Feedback", timestamp=32),
    models.Topic(meeting_id=meeting5.id, title="Performance Issues", timestamp=48),
    models.Topic(meeting_id=meeting5.id, title="Support Analysis", timestamp=80),
    models.Topic(meeting_id=meeting5.id, title="Action Items", timestamp=120),
]
for t in topics5:
    db.add(t)

db.commit()
db.close()

print("Database seeded successfully with 5 meetings!")
