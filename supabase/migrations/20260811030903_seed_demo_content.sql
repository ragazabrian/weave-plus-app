INSERT INTO public.profiles (id, email, full_name, avatar_url) VALUES
  ('4eb89314-94c7-4b47-a0a7-c31200d389d3', 'm.castellanos@weaveplus.edu', 'Dr. Miriam Castellanos', NULL),
  ('80a15abd-6638-4dce-a9a0-31dca83d12bd', 'a.whitfield@weaveplus.edu', 'Dr. Adrian Whitfield', NULL),
  ('c9b5fd0a-a11c-41fc-80d8-19cf55a18401', 'n.mokoena@weaveplus.edu', 'Prof. Naledi Mokoena', NULL),
  ('82be3b87-45b6-44f9-ae01-c91a9831c2f7', 'k.arata@weaveplus.edu', 'Prof. Kenji Arata', NULL),
  ('b2f0e16b-428c-4a9d-b821-b90135ba0c20', 'priya.nair@student.weaveplus.edu', 'Priya Nair', NULL),
  ('adf4f589-e657-4aea-b5c7-f2ad433ce31c', 'diego.fuentes@student.weaveplus.edu', 'Diego Fuentes', NULL),
  ('11847ffa-b28f-4e5a-9025-ae79a5f6c4bd', 'maya.lin@student.weaveplus.edu', 'Maya Lin', NULL),
  ('aa963deb-79c7-475c-9f01-8b0c88b63dfb', 'jordan.reyes@student.weaveplus.edu', 'Jordan Reyes', NULL),
  ('bcc7aad5-540f-49d1-ba8d-b30ef991da07', 'ines.kovac@student.weaveplus.edu', 'Ines Kovac', NULL),
  ('836890fc-46da-4a02-9edb-8db1a74d822a', 'tobias.reinholt@student.weaveplus.edu', 'Tobias Reinholt', NULL),
  ('a292dc80-b126-468f-9db8-43c3280723ca', 'aaliyah.brooks@student.weaveplus.edu', 'Aaliyah Brooks', NULL),
  ('3f04b4a8-daaf-4637-a9ed-40c8f1b956ec', 'sana.farooq@student.weaveplus.edu', 'Sana Farooq', NULL),
  ('49a520c1-ee5a-4375-a035-09b66ba2e1d6', 'lucas.bergman@student.weaveplus.edu', 'Lucas Bergman', NULL),
  ('8907ff1b-49b9-4d33-a05a-3de788b5f336', 'yuki.tanaka@student.weaveplus.edu', 'Yuki Tanaka', NULL);

INSERT INTO public.user_roles (user_id, role) VALUES
  ('4eb89314-94c7-4b47-a0a7-c31200d389d3', 'lecturer'),
  ('80a15abd-6638-4dce-a9a0-31dca83d12bd', 'lecturer'),
  ('c9b5fd0a-a11c-41fc-80d8-19cf55a18401', 'lecturer'),
  ('82be3b87-45b6-44f9-ae01-c91a9831c2f7', 'lecturer'),
  ('b2f0e16b-428c-4a9d-b821-b90135ba0c20', 'student'),
  ('adf4f589-e657-4aea-b5c7-f2ad433ce31c', 'student'),
  ('11847ffa-b28f-4e5a-9025-ae79a5f6c4bd', 'student'),
  ('aa963deb-79c7-475c-9f01-8b0c88b63dfb', 'student'),
  ('bcc7aad5-540f-49d1-ba8d-b30ef991da07', 'student'),
  ('836890fc-46da-4a02-9edb-8db1a74d822a', 'student'),
  ('a292dc80-b126-468f-9db8-43c3280723ca', 'student'),
  ('3f04b4a8-daaf-4637-a9ed-40c8f1b956ec', 'student'),
  ('49a520c1-ee5a-4375-a035-09b66ba2e1d6', 'student'),
  ('8907ff1b-49b9-4d33-a05a-3de788b5f336', 'student');

INSERT INTO public.courses (id, code, title, description, category, subject, owner_id, starts_on, ends_on) VALUES
  ('e8e202a9-efff-4a43-b47c-17591607bde9', 'IS201', 'Database Systems', 'Relational modeling, normalization, and SQL for real-world data-driven applications.', 'lavender', 'Information Systems', '4eb89314-94c7-4b47-a0a7-c31200d389d3', '2026-06-15', '2026-10-15'),
  ('a7233dea-92e6-4aa5-9049-a6d3e5cf3fcb', 'IS310', 'Enterprise Systems Analysis & Design', 'Requirements gathering, process modeling, and system design for enterprise software.', 'lavender', 'Information Systems', '4eb89314-94c7-4b47-a0a7-c31200d389d3', '2026-06-15', '2026-10-15'),
  ('14e0082d-e795-4ca1-8c3c-aec25735618e', 'IS405', 'IT Governance & Risk Management', 'Frameworks and practices for aligning IT strategy with organizational risk and compliance.', 'lavender', 'Information Systems', '4eb89314-94c7-4b47-a0a7-c31200d389d3', '2026-06-15', '2026-10-15'),
  ('6a1b8dee-0887-4853-a6d7-9b7fc168daf2', 'CS101', 'Data Structures & Algorithms', 'Core data structures, algorithmic complexity, and problem-solving patterns.', 'mint', 'Computer Science', '80a15abd-6638-4dce-a9a0-31dca83d12bd', '2026-06-15', '2026-10-15'),
  ('e7d7f387-d8c5-48b0-91bb-773b365ac8c6', 'CS250', 'Operating Systems', 'Processes, scheduling, memory management, and concurrency in modern operating systems.', 'mint', 'Computer Science', '80a15abd-6638-4dce-a9a0-31dca83d12bd', '2026-06-15', '2026-10-15'),
  ('68aab0f2-478b-4fd2-a55f-3b9a7dfc1606', 'CS360', 'Machine Learning Foundations', 'Supervised and unsupervised learning, model evaluation, and practical ML workflows.', 'mint', 'Computer Science', '80a15abd-6638-4dce-a9a0-31dca83d12bd', '2026-06-15', '2026-10-15'),
  ('4bfbf06e-3e57-4645-bbf5-a3a7912756d8', 'IT220', 'Network Administration', 'Network design, the OSI model, subnetting, and day-to-day network operations.', 'powder', 'Information Technology', 'c9b5fd0a-a11c-41fc-80d8-19cf55a18401', '2026-06-15', '2026-10-15'),
  ('55f1e260-59c5-42b6-a04c-dc38152d4548', 'IT330', 'Cloud Infrastructure & DevOps', 'Cloud platforms, CI/CD pipelines, and container orchestration for modern infrastructure.', 'powder', 'Information Technology', 'c9b5fd0a-a11c-41fc-80d8-19cf55a18401', '2026-06-15', '2026-10-15'),
  ('12a3d400-795b-4687-b623-dd4826aa632d', 'IT410', 'Cybersecurity Fundamentals', 'Threat modeling, common attack vectors, and defensive security practices.', 'powder', 'Information Technology', 'c9b5fd0a-a11c-41fc-80d8-19cf55a18401', '2026-06-15', '2026-10-15'),
  ('ac4578ce-adfe-4d19-8296-c5e80e6c3a76', 'GD150', 'Introduction to Game Design', 'Core design pillars, player experience, and rapid prototyping of game mechanics.', 'solar', 'Game Development', '82be3b87-45b6-44f9-ae01-c91a9831c2f7', '2026-06-15', '2026-10-15'),
  ('27954b4d-4fe9-4655-a6bf-e5728eb5f314', 'GD260', 'Game Engine Architecture', 'Game loops, entity-component systems, and the architecture behind modern engines.', 'solar', 'Game Development', '82be3b87-45b6-44f9-ae01-c91a9831c2f7', '2026-06-15', '2026-10-15'),
  ('b5a61e58-e55c-4b7d-ad1b-24e867373de9', 'GD340', 'Multiplayer Systems & Networking', 'Client-server netcode, lag compensation, and state synchronization for online games.', 'solar', 'Game Development', '82be3b87-45b6-44f9-ae01-c91a9831c2f7', '2026-06-15', '2026-10-15');

INSERT INTO public.enrollments (course_id, user_id) VALUES
  ('e8e202a9-efff-4a43-b47c-17591607bde9', 'b2f0e16b-428c-4a9d-b821-b90135ba0c20'),
  ('a7233dea-92e6-4aa5-9049-a6d3e5cf3fcb', 'b2f0e16b-428c-4a9d-b821-b90135ba0c20'),
  ('6a1b8dee-0887-4853-a6d7-9b7fc168daf2', 'b2f0e16b-428c-4a9d-b821-b90135ba0c20'),
  ('6a1b8dee-0887-4853-a6d7-9b7fc168daf2', 'adf4f589-e657-4aea-b5c7-f2ad433ce31c'),
  ('e7d7f387-d8c5-48b0-91bb-773b365ac8c6', 'adf4f589-e657-4aea-b5c7-f2ad433ce31c'),
  ('4bfbf06e-3e57-4645-bbf5-a3a7912756d8', 'adf4f589-e657-4aea-b5c7-f2ad433ce31c'),
  ('4bfbf06e-3e57-4645-bbf5-a3a7912756d8', '11847ffa-b28f-4e5a-9025-ae79a5f6c4bd'),
  ('55f1e260-59c5-42b6-a04c-dc38152d4548', '11847ffa-b28f-4e5a-9025-ae79a5f6c4bd'),
  ('ac4578ce-adfe-4d19-8296-c5e80e6c3a76', '11847ffa-b28f-4e5a-9025-ae79a5f6c4bd'),
  ('ac4578ce-adfe-4d19-8296-c5e80e6c3a76', 'aa963deb-79c7-475c-9f01-8b0c88b63dfb'),
  ('27954b4d-4fe9-4655-a6bf-e5728eb5f314', 'aa963deb-79c7-475c-9f01-8b0c88b63dfb'),
  ('e8e202a9-efff-4a43-b47c-17591607bde9', 'aa963deb-79c7-475c-9f01-8b0c88b63dfb'),
  ('e8e202a9-efff-4a43-b47c-17591607bde9', 'bcc7aad5-540f-49d1-ba8d-b30ef991da07'),
  ('a7233dea-92e6-4aa5-9049-a6d3e5cf3fcb', 'bcc7aad5-540f-49d1-ba8d-b30ef991da07'),
  ('6a1b8dee-0887-4853-a6d7-9b7fc168daf2', 'bcc7aad5-540f-49d1-ba8d-b30ef991da07'),
  ('6a1b8dee-0887-4853-a6d7-9b7fc168daf2', '836890fc-46da-4a02-9edb-8db1a74d822a'),
  ('e7d7f387-d8c5-48b0-91bb-773b365ac8c6', '836890fc-46da-4a02-9edb-8db1a74d822a'),
  ('4bfbf06e-3e57-4645-bbf5-a3a7912756d8', '836890fc-46da-4a02-9edb-8db1a74d822a'),
  ('4bfbf06e-3e57-4645-bbf5-a3a7912756d8', 'a292dc80-b126-468f-9db8-43c3280723ca'),
  ('55f1e260-59c5-42b6-a04c-dc38152d4548', 'a292dc80-b126-468f-9db8-43c3280723ca'),
  ('ac4578ce-adfe-4d19-8296-c5e80e6c3a76', 'a292dc80-b126-468f-9db8-43c3280723ca'),
  ('ac4578ce-adfe-4d19-8296-c5e80e6c3a76', '3f04b4a8-daaf-4637-a9ed-40c8f1b956ec'),
  ('27954b4d-4fe9-4655-a6bf-e5728eb5f314', '3f04b4a8-daaf-4637-a9ed-40c8f1b956ec'),
  ('e8e202a9-efff-4a43-b47c-17591607bde9', '3f04b4a8-daaf-4637-a9ed-40c8f1b956ec'),
  ('e8e202a9-efff-4a43-b47c-17591607bde9', '49a520c1-ee5a-4375-a035-09b66ba2e1d6'),
  ('a7233dea-92e6-4aa5-9049-a6d3e5cf3fcb', '49a520c1-ee5a-4375-a035-09b66ba2e1d6'),
  ('6a1b8dee-0887-4853-a6d7-9b7fc168daf2', '49a520c1-ee5a-4375-a035-09b66ba2e1d6'),
  ('6a1b8dee-0887-4853-a6d7-9b7fc168daf2', '8907ff1b-49b9-4d33-a05a-3de788b5f336'),
  ('e7d7f387-d8c5-48b0-91bb-773b365ac8c6', '8907ff1b-49b9-4d33-a05a-3de788b5f336'),
  ('4bfbf06e-3e57-4645-bbf5-a3a7912756d8', '8907ff1b-49b9-4d33-a05a-3de788b5f336');

INSERT INTO public.modules (id, course_id, title, summary, body, position) VALUES
  ('e424327e-655d-42eb-b641-8cbd4ff61d49', 'e8e202a9-efff-4a43-b47c-17591607bde9', 'Relational Modeling Basics', 'Entities, relationships, and keys.', 'Introduces entity-relationship diagrams and how they map onto relational tables.', 0),
  ('43afafcf-81da-4779-8ada-5cfa959c9453', 'e8e202a9-efff-4a43-b47c-17591607bde9', 'Normalization', '1NF through BCNF.', 'Walks through normal forms with worked examples, showing how to remove redundancy safely.', 1),
  ('74d7965e-6be8-4bdf-a31b-ef32158d8226', 'e8e202a9-efff-4a43-b47c-17591607bde9', 'SQL Fundamentals', 'SELECT, JOIN, and aggregation.', 'Covers core SQL syntax and query patterns used across the rest of the course.', 2),
  ('ea0dda7b-c2a6-4afb-a6db-8be40368d9c8', 'e8e202a9-efff-4a43-b47c-17591607bde9', 'Query Optimization', 'Indexes and execution plans.', 'Looks at how the query planner chooses execution strategies and how to read an EXPLAIN plan.', 3),
  ('7c2334bc-3b67-4fb2-aca5-db013e27698c', 'a7233dea-92e6-4aa5-9049-a6d3e5cf3fcb', 'Requirements Elicitation', 'Interviews, surveys, and workshops.', 'Techniques for gathering accurate requirements from stakeholders with competing priorities.', 0),
  ('03de0d9a-6c11-4ddb-b734-bafea306627b', 'a7233dea-92e6-4aa5-9049-a6d3e5cf3fcb', 'Process Modeling with BPMN', 'Swimlanes and gateways.', 'Notation for modeling business processes clearly enough for both analysts and engineers.', 1),
  ('0c1337d7-8019-4ade-8fad-c8c3d5d92fdb', 'a7233dea-92e6-4aa5-9049-a6d3e5cf3fcb', 'Systems Design Trade-offs', 'Buy vs build, coupling, cohesion.', 'Framework for evaluating enterprise system design decisions against cost and risk.', 2),
  ('912bdf95-1944-440c-9767-a207cefeb254', 'a7233dea-92e6-4aa5-9049-a6d3e5cf3fcb', 'Change Management', 'Rollout and adoption.', 'Why technically correct systems still fail without a deliberate adoption plan.', 3),
  ('e0a43040-b9f6-4a55-adef-271af44b159a', '14e0082d-e795-4ca1-8c3c-aec25735618e', 'Governance Frameworks', 'COBIT and ITIL overview.', 'Compares two widely used IT governance frameworks and when each fits.', 0),
  ('e4f5bd69-8899-472f-a1b5-ec3b02f5d3cc', '14e0082d-e795-4ca1-8c3c-aec25735618e', 'Risk Assessment', 'Likelihood, impact, and matrices.', 'Building a risk register and prioritizing mitigations with a standard risk matrix.', 1),
  ('901ad6de-8e48-485d-90a4-89e8760dace5', '14e0082d-e795-4ca1-8c3c-aec25735618e', 'Compliance Basics', 'Audits and controls.', 'What auditors actually check for, and how controls map to real risks.', 2),
  ('eec3f4e2-661e-4d8d-ba6b-0c9b4a504efe', '14e0082d-e795-4ca1-8c3c-aec25735618e', 'Incident Escalation', 'Roles and runbooks.', 'Designing an escalation path so incidents reach the right people fast.', 3),
  ('66d90ff5-0041-4a1b-a406-02a2ac882c52', '6a1b8dee-0887-4853-a6d7-9b7fc168daf2', 'Arrays and Linked Lists', 'Trade-offs in access and insertion.', 'Compares contiguous and pointer-based storage with concrete complexity numbers.', 0),
  ('373be278-5ec9-4d35-8a99-c19352701bed', '6a1b8dee-0887-4853-a6d7-9b7fc168daf2', 'Stacks, Queues, and Trees', 'LIFO, FIFO, and hierarchical data.', 'Core structures used everywhere from parsers to file systems.', 1),
  ('0020fc63-5bfe-428e-b9a9-ed9fad2a369f', '6a1b8dee-0887-4853-a6d7-9b7fc168daf2', 'Big-O Notation', 'Measuring growth, not speed.', 'How to reason about an algorithm''s scaling behavior independent of hardware.', 2),
  ('d3a98a6e-8937-46d9-b99d-694f264cc259', '6a1b8dee-0887-4853-a6d7-9b7fc168daf2', 'Sorting Algorithms', 'Comparison-based and beyond.', 'Merge sort, quicksort, and why ''fastest'' depends on your data.', 3),
  ('f7dd2bea-08a1-42f7-970c-dd4a063b6220', 'e7d7f387-d8c5-48b0-91bb-773b365ac8c6', 'Processes and Threads', 'Isolation vs shared memory.', 'The building blocks the OS gives you for running concurrent work.', 0),
  ('7a55f5df-3576-4aac-9c9e-f31a2eba7a31', 'e7d7f387-d8c5-48b0-91bb-773b365ac8c6', 'CPU Scheduling', 'Round robin, priority, and fairness.', 'How the kernel decides what runs next and why it matters for responsiveness.', 1),
  ('0f8f240b-15df-4f66-aa01-9611b9039cf5', 'e7d7f387-d8c5-48b0-91bb-773b365ac8c6', 'Memory Management', 'Paging and virtual memory.', 'How an OS gives every process the illusion of its own address space.', 2),
  ('0a536b2b-11d9-4004-8805-c76efb797a91', 'e7d7f387-d8c5-48b0-91bb-773b365ac8c6', 'Concurrency Hazards', 'Race conditions and deadlock.', 'Common bugs that only show up under real concurrent load, and how to avoid them.', 3),
  ('44ad3be9-6980-4622-9173-0009c47be74c', '68aab0f2-478b-4fd2-a55f-3b9a7dfc1606', 'Supervised Learning', 'Regression and classification.', 'The most common ML setup: learning a mapping from labeled examples.', 0),
  ('068fe94c-394a-45ff-85e3-6c1ef430c752', '68aab0f2-478b-4fd2-a55f-3b9a7dfc1606', 'Unsupervised Learning', 'Clustering and dimensionality reduction.', 'Finding structure in data with no labels to guide you.', 1),
  ('419374dd-3f9b-4f06-ad93-be0a8b969050', '68aab0f2-478b-4fd2-a55f-3b9a7dfc1606', 'Model Evaluation', 'Train/test splits, overfitting.', 'Why a model that looks great in training can still fail in production.', 2),
  ('ea9457b8-1459-4ff7-b024-b016486ec964', '68aab0f2-478b-4fd2-a55f-3b9a7dfc1606', 'Gradient Descent', 'Loss surfaces and learning rate.', 'The optimization workhorse behind most modern ML training.', 3),
  ('55757b59-8e09-41c0-9cc4-6a23d8df2867', '4bfbf06e-3e57-4645-bbf5-a3a7912756d8', 'The OSI Model', 'Seven layers, one mental model.', 'A shared vocabulary for talking about anything from cabling to HTTP.', 0),
  ('78dafd7d-b8dd-4a23-9578-c58ce78f3457', '4bfbf06e-3e57-4645-bbf5-a3a7912756d8', 'IP Addressing & Subnetting', 'CIDR notation in practice.', 'Carving address space into subnets without wasting it.', 1),
  ('8e983d52-725b-4535-89e3-8102680bf217', '4bfbf06e-3e57-4645-bbf5-a3a7912756d8', 'Routing Fundamentals', 'Static vs dynamic routing.', 'How packets find their way across networks you don''t control.', 2),
  ('27beecd7-dba4-439a-ac5a-ba0f58e78ddc', '4bfbf06e-3e57-4645-bbf5-a3a7912756d8', 'Network Troubleshooting', 'A systematic approach.', 'A repeatable method for isolating network problems instead of guessing.', 3),
  ('e2273950-5de3-446c-8cf0-db12f698feb8', '55f1e260-59c5-42b6-a04c-dc38152d4548', 'Cloud Service Models', 'IaaS, PaaS, SaaS.', 'What you''re actually responsible for at each layer of the cloud stack.', 0),
  ('599c67c3-730d-48f1-b541-aaaa1a7ac0d3', '55f1e260-59c5-42b6-a04c-dc38152d4548', 'CI/CD Pipelines', 'Build, test, deploy.', 'Automating the path from commit to production safely.', 1),
  ('8d8f1c61-b447-43e3-82de-0e511d3a002c', '55f1e260-59c5-42b6-a04c-dc38152d4548', 'Container Orchestration', 'Kubernetes basics.', 'Scheduling, scaling, and healing containerized workloads.', 2),
  ('1925bab0-4266-4320-bdd8-b4a2620f8d5a', '55f1e260-59c5-42b6-a04c-dc38152d4548', 'Infrastructure as Code', 'Declarative infrastructure.', 'Treating servers and networks like versioned, reviewable code.', 3),
  ('54f47e4d-7b6f-4443-b8da-76573a542749', '12a3d400-795b-4687-b623-dd4826aa632d', 'Threat Modeling', 'STRIDE and attack trees.', 'Thinking like an attacker before you write a line of defensive code.', 0),
  ('eca7d45e-2cc8-4981-97fc-65d001245c5c', '12a3d400-795b-4687-b623-dd4826aa632d', 'Common Attack Vectors', 'Phishing, injection, and more.', 'The handful of attack patterns responsible for most real breaches.', 1),
  ('3b45aea5-f9f3-4860-aed3-77c00ad15afb', '12a3d400-795b-4687-b623-dd4826aa632d', 'Network Defense', 'Firewalls and segmentation.', 'Limiting blast radius so one compromised host doesn''t mean total compromise.', 2),
  ('cef13ec7-a0c3-4d66-9d4b-3b7dfb31601c', '12a3d400-795b-4687-b623-dd4826aa632d', 'Zero Trust Architecture', 'Never trust, always verify.', 'Why perimeter-only security stopped being enough.', 3),
  ('878bb011-01df-4881-a9d0-c286520f09a7', 'ac4578ce-adfe-4d19-8296-c5e80e6c3a76', 'Core Design Pillars', 'What makes a game feel coherent.', 'Defining pillars early so every design decision has something to check against.', 0),
  ('9466e690-4693-4a0f-a546-c9e82da6e173', 'ac4578ce-adfe-4d19-8296-c5e80e6c3a76', 'Player Experience', 'Flow, challenge, and feedback.', 'Balancing difficulty so players stay in the zone between bored and frustrated.', 1),
  ('1e6d9923-a2ee-42b6-bdf3-7ccd9f2c9f23', 'ac4578ce-adfe-4d19-8296-c5e80e6c3a76', 'Rapid Prototyping', 'Paper to playable in a day.', 'Testing a mechanic''s fun factor before investing in production art.', 2),
  ('23d78c62-a258-4b2f-a102-5cddb6624f0f', 'ac4578ce-adfe-4d19-8296-c5e80e6c3a76', 'Playtesting Basics', 'Watching, not explaining.', 'Why you should resist the urge to tell playtesters how to play.', 3),
  ('09234393-56ef-4d3a-8708-50fad876f70f', '27954b4d-4fe9-4655-a6bf-e5728eb5f314', 'The Game Loop', 'Fixed vs variable timestep.', 'Why timestep choice affects physics stability and determinism.', 0),
  ('673c1690-880e-4a42-9a25-4f2f379e8f82', '27954b4d-4fe9-4655-a6bf-e5728eb5f314', 'Entity Component Systems', 'Composition over inheritance.', 'A data-oriented pattern that scales better than deep class hierarchies.', 1),
  ('0173bb3f-9f99-4372-b6b3-5b4b4d2135dc', '27954b4d-4fe9-4655-a6bf-e5728eb5f314', 'Physics Engines 101', 'Collision and resolution.', 'The basics of how engines detect and resolve overlapping bodies.', 2),
  ('30319cc2-2a4f-49d0-b70d-7d8c47ff8333', '27954b4d-4fe9-4655-a6bf-e5728eb5f314', 'Rendering Pipeline Overview', 'From scene graph to pixels.', 'A high-level tour of how a frame actually gets drawn.', 3),
  ('c33ee8d0-3ecd-43d1-a15c-680835b621f1', 'b5a61e58-e55c-4b7d-ad1b-24e867373de9', 'Client-Server Netcode', 'Authority and prediction.', 'Who decides what''s true when client and server disagree.', 0),
  ('9324f2be-2afd-42fb-8c67-6e538532d2ce', 'b5a61e58-e55c-4b7d-ad1b-24e867373de9', 'Lag Compensation', 'Rewind and replay.', 'Making shots feel fair despite everyone having different latency.', 1),
  ('44d7105f-5439-4988-8dd4-98b2a993493a', 'b5a61e58-e55c-4b7d-ad1b-24e867373de9', 'State Synchronization', 'Snapshots vs delta compression.', 'Trade-offs in keeping many clients consistent without flooding bandwidth.', 2),
  ('730b9b7c-9dfc-45d2-8811-d143c46a57e3', 'b5a61e58-e55c-4b7d-ad1b-24e867373de9', 'Matchmaking Basics', 'Skill rating and queues.', 'Balancing match quality against queue times.', 3);

INSERT INTO public.assignments (id, course_id, title, instructions, points, due_at) VALUES
  ('600542fa-47d1-4558-a663-f21c8c0224af', 'e8e202a9-efff-4a43-b47c-17591607bde9', 'Schema Design Exercise', 'Instructions for "Schema Design Exercise".', 100, '2026-07-21T12:00:00.000Z'),
  ('30081ff8-0262-4a0a-b44e-9ce9bdf04e98', 'e8e202a9-efff-4a43-b47c-17591607bde9', 'Normalize a Legacy Table', 'Instructions for "Normalize a Legacy Table".', 100, '2026-08-18T12:00:00.000Z'),
  ('0748fd2a-c350-4892-9536-064a0b1e9971', 'e8e202a9-efff-4a43-b47c-17591607bde9', 'Query Optimization Report', 'Instructions for "Query Optimization Report".', 100, '2026-09-20T12:00:00.000Z'),
  ('8fa1e2f9-5335-4335-8146-3aa836788e74', 'a7233dea-92e6-4aa5-9049-a6d3e5cf3fcb', 'Requirements Document', 'Instructions for "Requirements Document".', 100, '2026-07-21T12:00:00.000Z'),
  ('f14a9c89-efdb-47c2-bf9e-191ef0b9d51f', 'a7233dea-92e6-4aa5-9049-a6d3e5cf3fcb', 'BPMN Process Map', 'Instructions for "BPMN Process Map".', 100, '2026-08-18T12:00:00.000Z'),
  ('568437c2-ee4d-4c60-b192-9d55680815c2', 'a7233dea-92e6-4aa5-9049-a6d3e5cf3fcb', 'System Design Proposal', 'Instructions for "System Design Proposal".', 100, '2026-09-20T12:00:00.000Z'),
  ('4e34cfb0-9868-42de-8ecc-ecd0334ee8dd', '14e0082d-e795-4ca1-8c3c-aec25735618e', 'Risk Register Draft', 'Instructions for "Risk Register Draft".', 100, '2026-07-21T12:00:00.000Z'),
  ('060e86b3-6dea-4650-b192-f24b04deed76', '14e0082d-e795-4ca1-8c3c-aec25735618e', 'Governance Framework Comparison', 'Instructions for "Governance Framework Comparison".', 100, '2026-08-18T12:00:00.000Z'),
  ('48b1e100-29cc-43a9-b56b-6a08ff3e5236', '14e0082d-e795-4ca1-8c3c-aec25735618e', 'Incident Runbook', 'Instructions for "Incident Runbook".', 100, '2026-09-20T12:00:00.000Z'),
  ('722d7c8b-347e-4912-834b-6773f04546a8', '6a1b8dee-0887-4853-a6d7-9b7fc168daf2', 'Implement a Linked List', 'Instructions for "Implement a Linked List".', 100, '2026-07-21T12:00:00.000Z'),
  ('d0e83401-c387-4e31-b255-98fa14c7f54e', '6a1b8dee-0887-4853-a6d7-9b7fc168daf2', 'Big-O Analysis Set', 'Instructions for "Big-O Analysis Set".', 100, '2026-08-18T12:00:00.000Z'),
  ('01e77d88-a283-43b5-b31f-15acb9e5ef7c', '6a1b8dee-0887-4853-a6d7-9b7fc168daf2', 'Sorting Algorithm Benchmark', 'Instructions for "Sorting Algorithm Benchmark".', 100, '2026-09-20T12:00:00.000Z'),
  ('8c09121a-a5de-4d03-928f-ba89062c4347', 'e7d7f387-d8c5-48b0-91bb-773b365ac8c6', 'Scheduler Simulation', 'Instructions for "Scheduler Simulation".', 100, '2026-07-21T12:00:00.000Z'),
  ('b614dcec-3715-4b9a-b32f-d986c07f83fa', 'e7d7f387-d8c5-48b0-91bb-773b365ac8c6', 'Virtual Memory Report', 'Instructions for "Virtual Memory Report".', 100, '2026-08-18T12:00:00.000Z'),
  ('607ddf9a-cb8e-4f50-abb4-7c9d0ebd68cf', 'e7d7f387-d8c5-48b0-91bb-773b365ac8c6', 'Deadlock Detection Exercise', 'Instructions for "Deadlock Detection Exercise".', 100, '2026-09-20T12:00:00.000Z'),
  ('be2680ab-cc95-4d0c-8f62-49ffac51509d', '68aab0f2-478b-4fd2-a55f-3b9a7dfc1606', 'Classifier Comparison', 'Instructions for "Classifier Comparison".', 100, '2026-07-21T12:00:00.000Z'),
  ('9462e288-1fcf-4f8d-ba2f-79ccde51ec66', '68aab0f2-478b-4fd2-a55f-3b9a7dfc1606', 'Clustering Mini-Project', 'Instructions for "Clustering Mini-Project".', 100, '2026-08-18T12:00:00.000Z'),
  ('01548454-83d4-4471-ad47-a10527969961', '68aab0f2-478b-4fd2-a55f-3b9a7dfc1606', 'Model Evaluation Writeup', 'Instructions for "Model Evaluation Writeup".', 100, '2026-09-20T12:00:00.000Z'),
  ('7693bd57-a156-451d-bd17-e7939f691b96', '4bfbf06e-3e57-4645-bbf5-a3a7912756d8', 'Subnetting Problem Set', 'Instructions for "Subnetting Problem Set".', 100, '2026-07-21T12:00:00.000Z'),
  ('99b67e97-14b3-4db2-9c15-16c0aa744d5a', '4bfbf06e-3e57-4645-bbf5-a3a7912756d8', 'Routing Table Exercise', 'Instructions for "Routing Table Exercise".', 100, '2026-08-18T12:00:00.000Z'),
  ('59f3a68e-1969-4c0d-a176-422332773418', '4bfbf06e-3e57-4645-bbf5-a3a7912756d8', 'Network Troubleshooting Log', 'Instructions for "Network Troubleshooting Log".', 100, '2026-09-20T12:00:00.000Z'),
  ('4f480461-a5cb-4657-b188-dc32690d70ab', '55f1e260-59c5-42b6-a04c-dc38152d4548', 'CI/CD Pipeline Setup', 'Instructions for "CI/CD Pipeline Setup".', 100, '2026-07-21T12:00:00.000Z'),
  ('b38ddf31-17bf-4ab7-8baf-1b106509dba9', '55f1e260-59c5-42b6-a04c-dc38152d4548', 'Kubernetes Deployment', 'Instructions for "Kubernetes Deployment".', 100, '2026-08-18T12:00:00.000Z'),
  ('6e8374ff-96d2-4741-9220-cd679ff912f4', '55f1e260-59c5-42b6-a04c-dc38152d4548', 'Infrastructure as Code Lab', 'Instructions for "Infrastructure as Code Lab".', 100, '2026-09-20T12:00:00.000Z'),
  ('e69a82eb-8b6f-4756-9686-11397b321a6f', '12a3d400-795b-4687-b623-dd4826aa632d', 'Threat Model Writeup', 'Instructions for "Threat Model Writeup".', 100, '2026-07-21T12:00:00.000Z'),
  ('cf7d8aa1-2282-411b-ba06-9df2b060a854', '12a3d400-795b-4687-b623-dd4826aa632d', 'Attack Vector Report', 'Instructions for "Attack Vector Report".', 100, '2026-08-18T12:00:00.000Z'),
  ('2b6cf3a3-73c0-4d81-b94e-b5d909d394ff', '12a3d400-795b-4687-b623-dd4826aa632d', 'Firewall Rule Design', 'Instructions for "Firewall Rule Design".', 100, '2026-09-20T12:00:00.000Z'),
  ('d83e4aa6-e029-4ed0-b8b4-479663505181', 'ac4578ce-adfe-4d19-8296-c5e80e6c3a76', 'Design Pillars Pitch', 'Instructions for "Design Pillars Pitch".', 100, '2026-07-21T12:00:00.000Z'),
  ('9cb26db2-e109-4a8b-90dc-ceeb33dd8c23', 'ac4578ce-adfe-4d19-8296-c5e80e6c3a76', 'Paper Prototype', 'Instructions for "Paper Prototype".', 100, '2026-08-18T12:00:00.000Z'),
  ('38858865-4408-4d26-b46a-e97d96a22560', 'ac4578ce-adfe-4d19-8296-c5e80e6c3a76', 'Playtest Report', 'Instructions for "Playtest Report".', 100, '2026-09-20T12:00:00.000Z'),
  ('2b5b3b9c-a7f3-463b-9fab-731d169fb1d0', '27954b4d-4fe9-4655-a6bf-e5728eb5f314', 'Game Loop Implementation', 'Instructions for "Game Loop Implementation".', 100, '2026-07-21T12:00:00.000Z'),
  ('17808076-45e7-4274-a049-91e337bf0a93', '27954b4d-4fe9-4655-a6bf-e5728eb5f314', 'ECS Mini-Engine', 'Instructions for "ECS Mini-Engine".', 100, '2026-08-18T12:00:00.000Z'),
  ('4934ec63-416c-495f-b62e-254b64c87198', '27954b4d-4fe9-4655-a6bf-e5728eb5f314', 'Physics Demo', 'Instructions for "Physics Demo".', 100, '2026-09-20T12:00:00.000Z'),
  ('816536b1-8f8f-45c4-9396-16adf8f7e619', 'b5a61e58-e55c-4b7d-ad1b-24e867373de9', 'Netcode Prototype', 'Instructions for "Netcode Prototype".', 100, '2026-07-21T12:00:00.000Z'),
  ('7b349f49-a5d5-4dc5-b3c1-5e0cc1bdb846', 'b5a61e58-e55c-4b7d-ad1b-24e867373de9', 'Lag Compensation Demo', 'Instructions for "Lag Compensation Demo".', 100, '2026-08-18T12:00:00.000Z'),
  ('473d928b-cc92-41a0-bf99-d205c86272dd', 'b5a61e58-e55c-4b7d-ad1b-24e867373de9', 'Matchmaking Design Doc', 'Instructions for "Matchmaking Design Doc".', 100, '2026-09-20T12:00:00.000Z');

INSERT INTO public.announcements (id, course_id, author_id, title, body, created_at) VALUES
  ('81175f0e-5d4c-4586-995f-6aedf3605a38', 'e8e202a9-efff-4a43-b47c-17591607bde9', '4eb89314-94c7-4b47-a0a7-c31200d389d3', 'Midterm review session scheduled', 'Midterm review session scheduled. Check the course page for details.', '2026-08-08T12:00:00.000Z'),
  ('b777742e-ffa2-4300-bf22-d4d600bbdf82', 'e8e202a9-efff-4a43-b47c-17591607bde9', '4eb89314-94c7-4b47-a0a7-c31200d389d3', 'Sample datasets posted', 'Sample datasets posted. Check the course page for details.', '2026-08-04T12:00:00.000Z'),
  ('4339888b-6fea-4b3a-a6d7-fbaf7355a216', 'a7233dea-92e6-4aa5-9049-a6d3e5cf3fcb', '4eb89314-94c7-4b47-a0a7-c31200d389d3', 'Guest speaker next week', 'Guest speaker next week. Check the course page for details.', '2026-08-08T12:00:00.000Z'),
  ('fbbbb161-1d00-4056-bf61-83dc725b6a63', 'a7233dea-92e6-4aa5-9049-a6d3e5cf3fcb', '4eb89314-94c7-4b47-a0a7-c31200d389d3', 'Project teams finalized', 'Project teams finalized. Check the course page for details.', '2026-08-04T12:00:00.000Z'),
  ('1087b762-e5f2-4a6a-86aa-98f3534644dd', '14e0082d-e795-4ca1-8c3c-aec25735618e', '4eb89314-94c7-4b47-a0a7-c31200d389d3', 'Reading list updated', 'Reading list updated. Check the course page for details.', '2026-08-08T12:00:00.000Z'),
  ('14a3ba9a-4f38-47a8-9e28-d49e3e72f002', '14e0082d-e795-4ca1-8c3c-aec25735618e', '4eb89314-94c7-4b47-a0a7-c31200d389d3', 'Office hours moved', 'Office hours moved. Check the course page for details.', '2026-08-04T12:00:00.000Z'),
  ('66e24b9d-bced-4d41-a1e9-8b3990058437', '6a1b8dee-0887-4853-a6d7-9b7fc168daf2', '80a15abd-6638-4dce-a9a0-31dca83d12bd', 'Assignment 1 grading rubric posted', 'Assignment 1 grading rubric posted. Check the course page for details.', '2026-08-08T12:00:00.000Z'),
  ('20ca57c5-269a-434c-b2e1-8e13eca001f5', '6a1b8dee-0887-4853-a6d7-9b7fc168daf2', '80a15abd-6638-4dce-a9a0-31dca83d12bd', 'Extra practice problems added', 'Extra practice problems added. Check the course page for details.', '2026-08-04T12:00:00.000Z'),
  ('f428dbd1-b08c-4523-beb6-f5dd928eb838', 'e7d7f387-d8c5-48b0-91bb-773b365ac8c6', '80a15abd-6638-4dce-a9a0-31dca83d12bd', 'Lab access restored', 'Lab access restored. Check the course page for details.', '2026-08-08T12:00:00.000Z'),
  ('567152ce-750d-49a7-9c0c-f3ecd8892a19', 'e7d7f387-d8c5-48b0-91bb-773b365ac8c6', '80a15abd-6638-4dce-a9a0-31dca83d12bd', 'Midterm date confirmed', 'Midterm date confirmed. Check the course page for details.', '2026-08-04T12:00:00.000Z'),
  ('4851c4ef-2994-4753-a900-6db9c966402f', '68aab0f2-478b-4fd2-a55f-3b9a7dfc1606', '80a15abd-6638-4dce-a9a0-31dca83d12bd', 'Dataset for project released', 'Dataset for project released. Check the course page for details.', '2026-08-08T12:00:00.000Z'),
  ('17dee923-ac15-4ce6-ade5-685d3924e48e', '68aab0f2-478b-4fd2-a55f-3b9a7dfc1606', '80a15abd-6638-4dce-a9a0-31dca83d12bd', 'Office hours added', 'Office hours added. Check the course page for details.', '2026-08-04T12:00:00.000Z'),
  ('444d6cb9-79e3-469f-b4ba-949d94d7500f', '4bfbf06e-3e57-4645-bbf5-a3a7912756d8', 'c9b5fd0a-a11c-41fc-80d8-19cf55a18401', 'Lab environment maintenance window', 'Lab environment maintenance window. Check the course page for details.', '2026-08-08T12:00:00.000Z'),
  ('34c1f075-0f2d-4b9d-a5aa-07f7bfa981b4', '4bfbf06e-3e57-4645-bbf5-a3a7912756d8', 'c9b5fd0a-a11c-41fc-80d8-19cf55a18401', 'New subnetting practice sheet', 'New subnetting practice sheet. Check the course page for details.', '2026-08-04T12:00:00.000Z'),
  ('957e91f3-a430-4e51-b0e3-ac8e110d2cac', '55f1e260-59c5-42b6-a04c-dc38152d4548', 'c9b5fd0a-a11c-41fc-80d8-19cf55a18401', 'Cloud credits issued', 'Cloud credits issued. Check the course page for details.', '2026-08-08T12:00:00.000Z'),
  ('17112f2b-dca2-4ed0-8014-3d567ac6655a', '55f1e260-59c5-42b6-a04c-dc38152d4548', 'c9b5fd0a-a11c-41fc-80d8-19cf55a18401', 'Pipeline template updated', 'Pipeline template updated. Check the course page for details.', '2026-08-04T12:00:00.000Z'),
  ('c0fba70d-4a8b-43a2-9145-e21f5d6710e4', '12a3d400-795b-4687-b623-dd4826aa632d', 'c9b5fd0a-a11c-41fc-80d8-19cf55a18401', 'CTF event this Friday', 'CTF event this Friday. Check the course page for details.', '2026-08-08T12:00:00.000Z'),
  ('df81b821-7ac4-4b96-b539-f23f0e98e61d', '12a3d400-795b-4687-b623-dd4826aa632d', 'c9b5fd0a-a11c-41fc-80d8-19cf55a18401', 'Reading on recent breach case study', 'Reading on recent breach case study. Check the course page for details.', '2026-08-04T12:00:00.000Z'),
  ('a9ba16b5-1306-437c-86eb-da1530e956f9', 'ac4578ce-adfe-4d19-8296-c5e80e6c3a76', '82be3b87-45b6-44f9-ae01-c91a9831c2f7', 'Playtest signup sheet open', 'Playtest signup sheet open. Check the course page for details.', '2026-08-08T12:00:00.000Z'),
  ('8e67cbbb-7752-4fa3-9b9a-c90d4afd1781', 'ac4578ce-adfe-4d19-8296-c5e80e6c3a76', '82be3b87-45b6-44f9-ae01-c91a9831c2f7', 'Prototype showcase scheduled', 'Prototype showcase scheduled. Check the course page for details.', '2026-08-04T12:00:00.000Z'),
  ('0899a57a-fe03-4856-81a4-afbdda11743d', '27954b4d-4fe9-4655-a6bf-e5728eb5f314', '82be3b87-45b6-44f9-ae01-c91a9831c2f7', 'Engine starter repo updated', 'Engine starter repo updated. Check the course page for details.', '2026-08-08T12:00:00.000Z'),
  ('650897e4-d382-426a-977e-416623058d4c', '27954b4d-4fe9-4655-a6bf-e5728eb5f314', '82be3b87-45b6-44f9-ae01-c91a9831c2f7', 'Office hours added for ECS help', 'Office hours added for ECS help. Check the course page for details.', '2026-08-04T12:00:00.000Z'),
  ('32b6e026-c7dc-41bb-abb7-abfa39dc0f84', 'b5a61e58-e55c-4b7d-ad1b-24e867373de9', '82be3b87-45b6-44f9-ae01-c91a9831c2f7', 'Netcode demo day announced', 'Netcode demo day announced. Check the course page for details.', '2026-08-08T12:00:00.000Z'),
  ('ff4c36bb-553b-4439-9c13-64d69fd89bac', 'b5a61e58-e55c-4b7d-ad1b-24e867373de9', '82be3b87-45b6-44f9-ae01-c91a9831c2f7', 'Matchmaking dataset shared', 'Matchmaking dataset shared. Check the course page for details.', '2026-08-04T12:00:00.000Z');

INSERT INTO public.notes (id, owner_id, course_id, title, content, tags, is_shared, created_at) VALUES
  ('61bd3ce5-5678-4099-97cd-960b48516e8c', '4eb89314-94c7-4b47-a0a7-c31200d389d3', 'e8e202a9-efff-4a43-b47c-17591607bde9', 'IS Vault Index', 'Index of every note in the IS vault.

- Relational Database Design
- Normalization: 1NF to BCNF
- SQL Query Optimization
- Enterprise Systems Analysis Basics
- Data Flow Diagrams
- IT Governance Frameworks (COBIT, ITIL)
- Risk Assessment Matrices
- Business Process Modeling (BPMN)
- Systems Development Life Cycle (SDLC)', ARRAY['is','index']::text[], true, '2026-07-12T12:00:00.000Z'),
  ('cb181350-e1c7-4005-be57-e9304a526bd3', '4eb89314-94c7-4b47-a0a7-c31200d389d3', 'e8e202a9-efff-4a43-b47c-17591607bde9', 'Relational Database Design', 'Entities, relationships, and how they become tables.

Core principles of relational modeling: entities, attributes, keys, and relationships. Every other IS data note builds on this.', ARRAY['is']::text[], true, '2026-07-22T12:00:00.000Z'),
  ('f451ea9b-553f-4742-9daf-1496dcde9ab0', '4eb89314-94c7-4b47-a0a7-c31200d389d3', 'e8e202a9-efff-4a43-b47c-17591607bde9', 'Normalization: 1NF to BCNF', 'Removing redundancy one normal form at a time.

A worked progression through normal forms, with the anomalies each one fixes.', ARRAY['is']::text[], true, '2026-07-22T12:00:00.000Z'),
  ('86385edb-f06c-4bfe-a120-19adc6830338', '4eb89314-94c7-4b47-a0a7-c31200d389d3', 'e8e202a9-efff-4a43-b47c-17591607bde9', 'SQL Query Optimization', 'Reading execution plans and indexing well.

Notes on how the planner picks a strategy and what makes indexes actually get used.', ARRAY['is']::text[], true, '2026-08-01T12:00:00.000Z'),
  ('4dcc9c01-7178-4383-8ec1-680f16db476e', '4eb89314-94c7-4b47-a0a7-c31200d389d3', 'e8e202a9-efff-4a43-b47c-17591607bde9', 'Enterprise Systems Analysis Basics', 'Requirements gathering fundamentals.

Techniques for eliciting requirements from stakeholders who don''t always agree.', ARRAY['is']::text[], true, '2026-07-27T12:00:00.000Z'),
  ('3b9dd5cb-9fa3-4865-a778-fc99b9e094c7', '4eb89314-94c7-4b47-a0a7-c31200d389d3', 'e8e202a9-efff-4a43-b47c-17591607bde9', 'Data Flow Diagrams', 'Visualizing how data moves through a system.

DFD notation levels, from context diagrams down to detailed process breakdowns.', ARRAY['is']::text[], true, '2026-08-02T12:00:00.000Z'),
  ('36c8d2c6-cc95-4bf3-8a53-aae5a30e5e93', '4eb89314-94c7-4b47-a0a7-c31200d389d3', 'e8e202a9-efff-4a43-b47c-17591607bde9', 'IT Governance Frameworks (COBIT, ITIL)', 'Two common frameworks compared.

COBIT focuses on governance objectives; ITIL focuses on service management. Notes on when each fits.', ARRAY['is']::text[], true, '2026-08-01T12:00:00.000Z'),
  ('117503ec-2d0f-4828-bd38-1e5639e5a21f', '4eb89314-94c7-4b47-a0a7-c31200d389d3', 'e8e202a9-efff-4a43-b47c-17591607bde9', 'Risk Assessment Matrices', 'Likelihood times impact.

How to build and prioritize a risk register using a standard likelihood/impact matrix.', ARRAY['is']::text[], true, '2026-08-04T12:00:00.000Z'),
  ('d2e519a0-424c-4d96-b89d-b3515258f154', '4eb89314-94c7-4b47-a0a7-c31200d389d3', 'e8e202a9-efff-4a43-b47c-17591607bde9', 'Business Process Modeling (BPMN)', 'Swimlanes, gateways, and events.

Reference for BPMN notation used across process modeling exercises.', ARRAY['is']::text[], true, '2026-07-24T12:00:00.000Z'),
  ('e47d2dfe-6acc-49bb-bdcd-513b8dbe83f0', '4eb89314-94c7-4b47-a0a7-c31200d389d3', 'e8e202a9-efff-4a43-b47c-17591607bde9', 'Systems Development Life Cycle (SDLC)', 'From requirements to retirement.

The classic SDLC phases and how agile approaches reshape them.', ARRAY['is']::text[], true, '2026-07-28T12:00:00.000Z'),
  ('cb7dcd5c-efae-4c60-b780-896c11d1dec0', '80a15abd-6638-4dce-a9a0-31dca83d12bd', '6a1b8dee-0887-4853-a6d7-9b7fc168daf2', 'CS Vault Index', 'Index of every note in the CS vault.

- Big-O Notation Cheatsheet
- Common Data Structures: Arrays vs Linked Lists
- Binary Search Trees
- Process Scheduling Algorithms
- Memory Management & Virtual Memory
- Supervised vs Unsupervised Learning
- Gradient Descent Explained
- Recursion Patterns
- Concurrency & Race Conditions', ARRAY['cs','index']::text[], true, '2026-07-12T12:00:00.000Z'),
  ('4dc5cd86-9744-4bea-9876-032ac62177c8', '80a15abd-6638-4dce-a9a0-31dca83d12bd', '6a1b8dee-0887-4853-a6d7-9b7fc168daf2', 'Big-O Notation Cheatsheet', 'Common complexity classes at a glance.

Quick reference for O(1) through O(n!) with representative algorithms for each.', ARRAY['cs']::text[], true, '2026-07-24T12:00:00.000Z'),
  ('6ea4685a-4b3e-476d-94be-15e55ff06c52', '80a15abd-6638-4dce-a9a0-31dca83d12bd', '6a1b8dee-0887-4853-a6d7-9b7fc168daf2', 'Common Data Structures: Arrays vs Linked Lists', 'Contiguous vs pointer-based storage.

Trade-offs in access time, insertion cost, and memory locality.', ARRAY['cs']::text[], true, '2026-07-28T12:00:00.000Z'),
  ('decd3915-71a0-470e-a532-39afb5001774', '80a15abd-6638-4dce-a9a0-31dca83d12bd', '6a1b8dee-0887-4853-a6d7-9b7fc168daf2', 'Binary Search Trees', 'Ordered structure, log-n operations.

BST invariants, rotations, and why unbalanced trees degrade to O(n).', ARRAY['cs']::text[], true, '2026-07-24T12:00:00.000Z'),
  ('1db551a5-98bf-4030-a4c1-19dce7081008', '80a15abd-6638-4dce-a9a0-31dca83d12bd', '6a1b8dee-0887-4853-a6d7-9b7fc168daf2', 'Process Scheduling Algorithms', 'Round robin, priority, and multilevel queues.

Comparing scheduling algorithms on fairness, throughput, and latency.', ARRAY['cs']::text[], true, '2026-08-04T12:00:00.000Z'),
  ('096d3d03-677e-4ad8-9f55-ca3cf2f7ee77', '80a15abd-6638-4dce-a9a0-31dca83d12bd', '6a1b8dee-0887-4853-a6d7-9b7fc168daf2', 'Memory Management & Virtual Memory', 'Paging, segmentation, and page faults.

How an OS gives each process its own address space using page tables.', ARRAY['cs']::text[], true, '2026-07-22T12:00:00.000Z'),
  ('472505d3-279d-43b1-8a14-a2c1a5832ec2', '80a15abd-6638-4dce-a9a0-31dca83d12bd', '6a1b8dee-0887-4853-a6d7-9b7fc168daf2', 'Supervised vs Unsupervised Learning', 'Labeled data vs finding structure.

The core split in ML problem framing, with examples of each.', ARRAY['cs']::text[], true, '2026-07-28T12:00:00.000Z'),
  ('36c81ea2-fde4-4a2b-bc93-94548285f53d', '80a15abd-6638-4dce-a9a0-31dca83d12bd', '6a1b8dee-0887-4853-a6d7-9b7fc168daf2', 'Gradient Descent Explained', 'Following the slope downhill.

Learning rate, local minima, and why gradient descent still works at scale.', ARRAY['cs']::text[], true, '2026-07-24T12:00:00.000Z'),
  ('aa75002c-8304-481b-b062-54accd972bcd', '80a15abd-6638-4dce-a9a0-31dca83d12bd', '6a1b8dee-0887-4853-a6d7-9b7fc168daf2', 'Recursion Patterns', 'Base cases and the call stack.

Common recursion shapes: divide-and-conquer, backtracking, and memoized recursion.', ARRAY['cs']::text[], true, '2026-07-28T12:00:00.000Z'),
  ('13c345e7-3465-4099-9211-e6f314fb7411', '80a15abd-6638-4dce-a9a0-31dca83d12bd', '6a1b8dee-0887-4853-a6d7-9b7fc168daf2', 'Concurrency & Race Conditions', 'When ordering isn''t guaranteed.

Classic race condition examples and the locking strategies that fix them.', ARRAY['cs']::text[], true, '2026-08-04T12:00:00.000Z'),
  ('eb91b916-fb1b-45ba-9770-9b845d1ecb40', 'c9b5fd0a-a11c-41fc-80d8-19cf55a18401', '4bfbf06e-3e57-4645-bbf5-a3a7912756d8', 'IT Vault Index', 'Index of every note in the IT vault.

- OSI Model Reference
- Subnetting Cheatsheet
- CI/CD Pipeline Basics
- Container Orchestration with Kubernetes
- Common Cybersecurity Attack Vectors
- Firewall Rules & Network Segmentation
- Cloud Cost Optimization Tips
- Incident Response Checklist
- Zero Trust Architecture', ARRAY['it','index']::text[], true, '2026-07-12T12:00:00.000Z'),
  ('2c34f53d-47a4-4efa-bbcd-9e3db22c4e18', 'c9b5fd0a-a11c-41fc-80d8-19cf55a18401', '4bfbf06e-3e57-4645-bbf5-a3a7912756d8', 'OSI Model Reference', 'Seven layers, one shared vocabulary.

Quick reference for what happens at each OSI layer, with real protocol examples.', ARRAY['it']::text[], true, '2026-07-28T12:00:00.000Z'),
  ('4740b6c2-ec2e-46c8-a638-7a96140d2005', 'c9b5fd0a-a11c-41fc-80d8-19cf55a18401', '4bfbf06e-3e57-4645-bbf5-a3a7912756d8', 'Subnetting Cheatsheet', 'CIDR math without the headache.

Fast subnetting reference: prefix lengths, host counts, and common pitfalls.', ARRAY['it']::text[], true, '2026-07-26T12:00:00.000Z'),
  ('2905f320-d499-4ad7-a65f-987fba836993', 'c9b5fd0a-a11c-41fc-80d8-19cf55a18401', '4bfbf06e-3e57-4645-bbf5-a3a7912756d8', 'CI/CD Pipeline Basics', 'From commit to deploy, automatically.

Stages of a typical pipeline and what each stage should and shouldn''t do.', ARRAY['it']::text[], true, '2026-07-22T12:00:00.000Z'),
  ('ba9b50d3-e9a4-4ded-ae66-1e3fd25502d7', 'c9b5fd0a-a11c-41fc-80d8-19cf55a18401', '4bfbf06e-3e57-4645-bbf5-a3a7912756d8', 'Container Orchestration with Kubernetes', 'Pods, services, and scaling.

Core Kubernetes concepts needed before touching a real cluster.', ARRAY['it']::text[], true, '2026-07-29T12:00:00.000Z'),
  ('7376ab54-45a4-48f2-bd9a-c8ce9bb98208', 'c9b5fd0a-a11c-41fc-80d8-19cf55a18401', '4bfbf06e-3e57-4645-bbf5-a3a7912756d8', 'Common Cybersecurity Attack Vectors', 'Phishing, injection, and more.

The small set of attack patterns behind most real-world breaches.', ARRAY['it']::text[], true, '2026-07-29T12:00:00.000Z'),
  ('d69e668d-f164-4c05-8645-0d9f34f17c4c', 'c9b5fd0a-a11c-41fc-80d8-19cf55a18401', '4bfbf06e-3e57-4645-bbf5-a3a7912756d8', 'Firewall Rules & Network Segmentation', 'Limiting blast radius.

Why segmentation matters even when perimeter defenses are strong.', ARRAY['it']::text[], true, '2026-07-31T12:00:00.000Z'),
  ('9068b68b-7f40-434b-b252-d2717d82bb70', 'c9b5fd0a-a11c-41fc-80d8-19cf55a18401', '4bfbf06e-3e57-4645-bbf5-a3a7912756d8', 'Cloud Cost Optimization Tips', 'Right-sizing and reserved capacity.

Practical levers for cutting cloud spend without hurting reliability.', ARRAY['it']::text[], true, '2026-07-25T12:00:00.000Z'),
  ('183cdeff-c3c9-4396-92db-94f527023c8e', 'c9b5fd0a-a11c-41fc-80d8-19cf55a18401', '4bfbf06e-3e57-4645-bbf5-a3a7912756d8', 'Incident Response Checklist', 'Contain, eradicate, recover.

A repeatable checklist for the first hour of a security incident.', ARRAY['it']::text[], true, '2026-07-24T12:00:00.000Z'),
  ('77194e0a-b1e6-46f2-af1a-88cac9ef5f02', 'c9b5fd0a-a11c-41fc-80d8-19cf55a18401', '4bfbf06e-3e57-4645-bbf5-a3a7912756d8', 'Zero Trust Architecture', 'Never trust, always verify.

Why identity-based access is replacing perimeter-only security models.', ARRAY['it']::text[], true, '2026-07-30T12:00:00.000Z'),
  ('6b7a3a2f-e878-48be-97d0-6c1dd1cf87cd', '82be3b87-45b6-44f9-ae01-c91a9831c2f7', 'ac4578ce-adfe-4d19-8296-c5e80e6c3a76', 'Game Dev Vault Index', 'Index of every note in the GD vault.

- Core Game Design Pillars
- Game Loops & Fixed Timestep
- Entity Component Systems (ECS)
- Physics Engines 101
- Client-Server Netcode for Multiplayer
- Lag Compensation Techniques
- Level Design Principles
- Juice & Game Feel
- Shader Basics (Vertex vs Fragment)', ARRAY['gd','index']::text[], true, '2026-07-12T12:00:00.000Z'),
  ('6895b44b-6dd3-4b21-ad1f-5ebc4def35c9', '82be3b87-45b6-44f9-ae01-c91a9831c2f7', 'ac4578ce-adfe-4d19-8296-c5e80e6c3a76', 'Core Game Design Pillars', 'The few things every decision should serve.

Defining pillars early so design decisions have a clear tie-breaker.', ARRAY['gd']::text[], true, '2026-07-30T12:00:00.000Z'),
  ('ea6123dc-48be-4cc8-a91d-ef21f48b9a6e', '82be3b87-45b6-44f9-ae01-c91a9831c2f7', 'ac4578ce-adfe-4d19-8296-c5e80e6c3a76', 'Game Loops & Fixed Timestep', 'Deterministic simulation matters.

Why fixed timestep beats variable timestep for physics-heavy games.', ARRAY['gd']::text[], true, '2026-07-31T12:00:00.000Z'),
  ('30ccd81a-02a1-4e96-861d-cdcb89ce966b', '82be3b87-45b6-44f9-ae01-c91a9831c2f7', 'ac4578ce-adfe-4d19-8296-c5e80e6c3a76', 'Entity Component Systems (ECS)', 'Composition over deep inheritance.

A data-oriented pattern that scales better than class hierarchies for game objects.', ARRAY['gd']::text[], true, '2026-08-02T12:00:00.000Z'),
  ('6b489abf-ad5c-4205-baa4-18a4bfd9aa0c', '82be3b87-45b6-44f9-ae01-c91a9831c2f7', 'ac4578ce-adfe-4d19-8296-c5e80e6c3a76', 'Physics Engines 101', 'Broad phase, narrow phase, resolution.

The basic pipeline most physics engines follow to detect and resolve collisions.', ARRAY['gd']::text[], true, '2026-08-04T12:00:00.000Z'),
  ('b5c51089-bb1f-4081-886a-0f23e7262e0b', '82be3b87-45b6-44f9-ae01-c91a9831c2f7', 'ac4578ce-adfe-4d19-8296-c5e80e6c3a76', 'Client-Server Netcode for Multiplayer', 'Who has authority over game state.

Authoritative server patterns and why clients can''t be fully trusted.', ARRAY['gd']::text[], true, '2026-08-04T12:00:00.000Z'),
  ('de9c2584-0ddd-44a6-a987-c31e95f69318', '82be3b87-45b6-44f9-ae01-c91a9831c2f7', 'ac4578ce-adfe-4d19-8296-c5e80e6c3a76', 'Lag Compensation Techniques', 'Making shots feel fair.

Server-side rewind and other techniques that hide latency from players.', ARRAY['gd']::text[], true, '2026-07-24T12:00:00.000Z'),
  ('ef01d651-8ce6-4fa3-9630-28d265cdbf54', '82be3b87-45b6-44f9-ae01-c91a9831c2f7', 'ac4578ce-adfe-4d19-8296-c5e80e6c3a76', 'Level Design Principles', 'Pacing, sightlines, and flow.

How level layout shapes player behavior without a single line of dialogue.', ARRAY['gd']::text[], true, '2026-08-03T12:00:00.000Z'),
  ('2bfe2863-2aab-44cf-8e65-e50b88cda010', '82be3b87-45b6-44f9-ae01-c91a9831c2f7', 'ac4578ce-adfe-4d19-8296-c5e80e6c3a76', 'Juice & Game Feel', 'Small feedback, big impact.

Screen shake, hit-stop, and other cheap techniques that make actions feel powerful.', ARRAY['gd']::text[], true, '2026-08-02T12:00:00.000Z'),
  ('6e6e9610-fe47-4e10-a52f-37c61aabd94d', '82be3b87-45b6-44f9-ae01-c91a9831c2f7', 'ac4578ce-adfe-4d19-8296-c5e80e6c3a76', 'Shader Basics (Vertex vs Fragment)', 'Two stages, two very different jobs.

What each shader stage is responsible for in the rendering pipeline.', ARRAY['gd']::text[], true, '2026-08-04T12:00:00.000Z');

INSERT INTO public.note_links (id, source_id, target_id) VALUES
  ('e00ebe44-54f6-494c-bac6-9a5b58aa70ec', '61bd3ce5-5678-4099-97cd-960b48516e8c', 'cb181350-e1c7-4005-be57-e9304a526bd3'),
  ('ceabe19e-8719-4c4a-a66a-c32e9461ac0a', '61bd3ce5-5678-4099-97cd-960b48516e8c', 'f451ea9b-553f-4742-9daf-1496dcde9ab0'),
  ('7e97d2e7-9878-4033-9fe0-b67a952a689f', '61bd3ce5-5678-4099-97cd-960b48516e8c', '86385edb-f06c-4bfe-a120-19adc6830338'),
  ('a2f33d38-4c13-4e1f-8dfc-14c3e96ad536', '61bd3ce5-5678-4099-97cd-960b48516e8c', '4dcc9c01-7178-4383-8ec1-680f16db476e'),
  ('9728f847-b085-4b64-b719-9366f39cbeda', '61bd3ce5-5678-4099-97cd-960b48516e8c', '3b9dd5cb-9fa3-4865-a778-fc99b9e094c7'),
  ('83564942-685c-43f1-a678-fe60469227ea', '61bd3ce5-5678-4099-97cd-960b48516e8c', '36c8d2c6-cc95-4bf3-8a53-aae5a30e5e93'),
  ('c5e59a1a-adb2-4a70-a59d-b8283d801520', '61bd3ce5-5678-4099-97cd-960b48516e8c', '117503ec-2d0f-4828-bd38-1e5639e5a21f'),
  ('9e171d91-0dcc-4a24-9103-a494bd79e0ce', '61bd3ce5-5678-4099-97cd-960b48516e8c', 'd2e519a0-424c-4d96-b89d-b3515258f154'),
  ('f83dfa88-b4fa-4aa3-93ce-29a4a86b5922', '61bd3ce5-5678-4099-97cd-960b48516e8c', 'e47d2dfe-6acc-49bb-bdcd-513b8dbe83f0'),
  ('5396ff6a-fe52-418f-a5a0-85749a11636f', 'cb7dcd5c-efae-4c60-b780-896c11d1dec0', '4dc5cd86-9744-4bea-9876-032ac62177c8'),
  ('90d797d2-b326-4df5-98f0-4f59f9af0e5f', 'cb7dcd5c-efae-4c60-b780-896c11d1dec0', '6ea4685a-4b3e-476d-94be-15e55ff06c52'),
  ('babee16e-ba18-4d41-bc4d-61fcc5c1fac3', 'cb7dcd5c-efae-4c60-b780-896c11d1dec0', 'decd3915-71a0-470e-a532-39afb5001774'),
  ('b01a39b2-e6e0-452a-ae4b-8f0a175f7402', 'cb7dcd5c-efae-4c60-b780-896c11d1dec0', '1db551a5-98bf-4030-a4c1-19dce7081008'),
  ('28f4f893-5a13-4260-94c8-42a7e277da74', 'cb7dcd5c-efae-4c60-b780-896c11d1dec0', '096d3d03-677e-4ad8-9f55-ca3cf2f7ee77'),
  ('c9d9eaa7-e611-4b62-934f-c84e09307a1f', 'cb7dcd5c-efae-4c60-b780-896c11d1dec0', '472505d3-279d-43b1-8a14-a2c1a5832ec2'),
  ('74d1dd09-e31d-47e7-8bc9-5f139622c1e2', 'cb7dcd5c-efae-4c60-b780-896c11d1dec0', '36c81ea2-fde4-4a2b-bc93-94548285f53d'),
  ('9f7c72af-d3d2-4ce4-83c5-e8f7f6b88adb', 'cb7dcd5c-efae-4c60-b780-896c11d1dec0', 'aa75002c-8304-481b-b062-54accd972bcd'),
  ('66ad3a0a-2542-45f5-9d1a-a9adaad34bf2', 'cb7dcd5c-efae-4c60-b780-896c11d1dec0', '13c345e7-3465-4099-9211-e6f314fb7411'),
  ('a7a4f642-18a7-40f8-a169-eb7bd8579d98', 'eb91b916-fb1b-45ba-9770-9b845d1ecb40', '2c34f53d-47a4-4efa-bbcd-9e3db22c4e18'),
  ('9e26d3da-90c8-44bd-a374-adfe921d2fef', 'eb91b916-fb1b-45ba-9770-9b845d1ecb40', '4740b6c2-ec2e-46c8-a638-7a96140d2005'),
  ('67f4aeaf-4943-451d-89eb-99bc7cd85741', 'eb91b916-fb1b-45ba-9770-9b845d1ecb40', '2905f320-d499-4ad7-a65f-987fba836993'),
  ('4d253feb-2221-4626-b588-c560d6dcb5e3', 'eb91b916-fb1b-45ba-9770-9b845d1ecb40', 'ba9b50d3-e9a4-4ded-ae66-1e3fd25502d7'),
  ('1f6a94d1-620b-4a85-a6e6-a9d1a76181f1', 'eb91b916-fb1b-45ba-9770-9b845d1ecb40', '7376ab54-45a4-48f2-bd9a-c8ce9bb98208'),
  ('4f9528ee-0410-4ff4-ae1b-5f09bbac6797', 'eb91b916-fb1b-45ba-9770-9b845d1ecb40', 'd69e668d-f164-4c05-8645-0d9f34f17c4c'),
  ('602d3635-07a7-472a-98fe-546303503667', 'eb91b916-fb1b-45ba-9770-9b845d1ecb40', '9068b68b-7f40-434b-b252-d2717d82bb70'),
  ('727c4912-ac88-4692-8873-917dff75d2eb', 'eb91b916-fb1b-45ba-9770-9b845d1ecb40', '183cdeff-c3c9-4396-92db-94f527023c8e'),
  ('d47b81f3-9910-49d2-96c8-396e1b55bfc4', 'eb91b916-fb1b-45ba-9770-9b845d1ecb40', '77194e0a-b1e6-46f2-af1a-88cac9ef5f02'),
  ('e0463829-212f-4bec-a2ba-43f1e9891e7a', '6b7a3a2f-e878-48be-97d0-6c1dd1cf87cd', '6895b44b-6dd3-4b21-ad1f-5ebc4def35c9'),
  ('c33136ab-6b29-47a6-a587-05ed4bc75e02', '6b7a3a2f-e878-48be-97d0-6c1dd1cf87cd', 'ea6123dc-48be-4cc8-a91d-ef21f48b9a6e'),
  ('1f72adaa-fe53-424f-8b1b-35c02d37309a', '6b7a3a2f-e878-48be-97d0-6c1dd1cf87cd', '30ccd81a-02a1-4e96-861d-cdcb89ce966b'),
  ('903d8dbd-305b-4a73-996c-bae583dd0976', '6b7a3a2f-e878-48be-97d0-6c1dd1cf87cd', '6b489abf-ad5c-4205-baa4-18a4bfd9aa0c'),
  ('a869cf03-866a-45bf-be63-c1ea38f1ffbc', '6b7a3a2f-e878-48be-97d0-6c1dd1cf87cd', 'b5c51089-bb1f-4081-886a-0f23e7262e0b'),
  ('bd86c2dc-2f0d-422a-959c-651522245370', '6b7a3a2f-e878-48be-97d0-6c1dd1cf87cd', 'de9c2584-0ddd-44a6-a987-c31e95f69318'),
  ('79bfcbf0-a77b-4c7d-9e71-7cb4fe35f002', '6b7a3a2f-e878-48be-97d0-6c1dd1cf87cd', 'ef01d651-8ce6-4fa3-9630-28d265cdbf54'),
  ('d78cdeff-6a3c-4d6b-ad85-8e1cde99cf89', '6b7a3a2f-e878-48be-97d0-6c1dd1cf87cd', '2bfe2863-2aab-44cf-8e65-e50b88cda010'),
  ('1950bead-aadc-4d96-885f-b8bc35db8e6d', '6b7a3a2f-e878-48be-97d0-6c1dd1cf87cd', '6e6e9610-fe47-4e10-a52f-37c61aabd94d'),
  ('b9a34863-b1d0-43c3-9689-821e96dc09b2', 'cb181350-e1c7-4005-be57-e9304a526bd3', 'f451ea9b-553f-4742-9daf-1496dcde9ab0'),
  ('0d6924f3-8c26-467f-91b9-4609eb5cdd86', 'f451ea9b-553f-4742-9daf-1496dcde9ab0', '86385edb-f06c-4bfe-a120-19adc6830338'),
  ('dcd575a2-d74d-4dec-9a46-f38220de7a8f', '4dcc9c01-7178-4383-8ec1-680f16db476e', '3b9dd5cb-9fa3-4865-a778-fc99b9e094c7'),
  ('7b791b6e-baa9-4bf5-8f21-5f3237a444a9', '3b9dd5cb-9fa3-4865-a778-fc99b9e094c7', 'd2e519a0-424c-4d96-b89d-b3515258f154'),
  ('2b4efaa6-da8b-4d57-823b-d112c41fc0bb', '36c8d2c6-cc95-4bf3-8a53-aae5a30e5e93', '117503ec-2d0f-4828-bd38-1e5639e5a21f'),
  ('eb119479-415f-4c8b-8111-af30c2847bdf', 'e47d2dfe-6acc-49bb-bdcd-513b8dbe83f0', 'd2e519a0-424c-4d96-b89d-b3515258f154'),
  ('226c7e4d-4627-472c-98e9-fe19973a2adb', '6ea4685a-4b3e-476d-94be-15e55ff06c52', 'decd3915-71a0-470e-a532-39afb5001774'),
  ('ced01bf6-524f-4f85-b332-a6b58421ddc5', 'decd3915-71a0-470e-a532-39afb5001774', 'aa75002c-8304-481b-b062-54accd972bcd'),
  ('db0bc2bc-944f-40de-924d-6d5944682759', '4dc5cd86-9744-4bea-9876-032ac62177c8', '6ea4685a-4b3e-476d-94be-15e55ff06c52'),
  ('b00714a9-ea4d-4929-978c-a623da6fbc26', '1db551a5-98bf-4030-a4c1-19dce7081008', '096d3d03-677e-4ad8-9f55-ca3cf2f7ee77'),
  ('ed0ef003-c0c6-4091-b4a3-4d0311709cdf', '096d3d03-677e-4ad8-9f55-ca3cf2f7ee77', '13c345e7-3465-4099-9211-e6f314fb7411'),
  ('9727bfe8-4635-4a89-99b0-e411504ea498', '472505d3-279d-43b1-8a14-a2c1a5832ec2', '36c81ea2-fde4-4a2b-bc93-94548285f53d'),
  ('a824133a-0263-40d6-8a66-7ca8ca02db2c', '2c34f53d-47a4-4efa-bbcd-9e3db22c4e18', '4740b6c2-ec2e-46c8-a638-7a96140d2005'),
  ('8724ff53-41ed-4cae-96e2-411cd59e49bd', '2905f320-d499-4ad7-a65f-987fba836993', 'ba9b50d3-e9a4-4ded-ae66-1e3fd25502d7'),
  ('9c076742-9b93-4c44-969d-cd01473fb3db', '7376ab54-45a4-48f2-bd9a-c8ce9bb98208', 'd69e668d-f164-4c05-8645-0d9f34f17c4c'),
  ('8baad363-da1f-4d54-a668-f4fbd189e0e4', 'd69e668d-f164-4c05-8645-0d9f34f17c4c', '77194e0a-b1e6-46f2-af1a-88cac9ef5f02'),
  ('c50c5ed5-dd23-430e-b6f6-29ac9ec304b3', '183cdeff-c3c9-4396-92db-94f527023c8e', '7376ab54-45a4-48f2-bd9a-c8ce9bb98208'),
  ('b9f74ddf-5a68-482c-aec2-7cab5bdc8e0d', '6895b44b-6dd3-4b21-ad1f-5ebc4def35c9', 'ef01d651-8ce6-4fa3-9630-28d265cdbf54'),
  ('f799cfe4-ce90-4878-9377-0f3f648f5d60', 'ea6123dc-48be-4cc8-a91d-ef21f48b9a6e', '6b489abf-ad5c-4205-baa4-18a4bfd9aa0c'),
  ('55027036-dcb7-442b-b245-23eafb612e72', '30ccd81a-02a1-4e96-861d-cdcb89ce966b', '6b489abf-ad5c-4205-baa4-18a4bfd9aa0c'),
  ('98def830-0d08-4e57-856f-acc0e81d99c4', 'b5c51089-bb1f-4081-886a-0f23e7262e0b', 'de9c2584-0ddd-44a6-a987-c31e95f69318'),
  ('49eaf4d8-f15d-4403-9756-dab70885e55a', 'ef01d651-8ce6-4fa3-9630-28d265cdbf54', '2bfe2863-2aab-44cf-8e65-e50b88cda010'),
  ('757a5f7f-bb20-494e-a4d1-5e306613a991', 'e47d2dfe-6acc-49bb-bdcd-513b8dbe83f0', '2905f320-d499-4ad7-a65f-987fba836993'),
  ('d14a7e65-c251-4a38-8387-34518ff4f6b1', 'ba9b50d3-e9a4-4ded-ae66-1e3fd25502d7', '13c345e7-3465-4099-9211-e6f314fb7411'),
  ('c02938de-30a0-42ae-a715-d41b807bf39a', 'b5c51089-bb1f-4081-886a-0f23e7262e0b', '2c34f53d-47a4-4efa-bbcd-9e3db22c4e18'),
  ('83cc9e41-27c0-4692-a54b-ecbb03e10c08', '30ccd81a-02a1-4e96-861d-cdcb89ce966b', '6ea4685a-4b3e-476d-94be-15e55ff06c52'),
  ('7fc049c2-dfe6-4494-b3c1-a2b5a55d7b9b', '77194e0a-b1e6-46f2-af1a-88cac9ef5f02', '117503ec-2d0f-4828-bd38-1e5639e5a21f');

INSERT INTO public.submissions (id, assignment_id, user_id, body, status, submitted_at, graded_at, grade, graded_by, feedback) VALUES
  ('de888fb2-855a-4a44-98e9-8c4b0a30f244', '600542fa-47d1-4558-a663-f21c8c0224af', 'b2f0e16b-428c-4a9d-b821-b90135ba0c20', 'Submitted work for IS201.', 'graded', '2026-07-20T12:00:00.000Z', '2026-07-24T12:00:00.000Z', 78, '4eb89314-94c7-4b47-a0a7-c31200d389d3', 'Solid work overall — see inline comments.'),
  ('bff4265a-dea1-4d81-aa99-23ef13a89c94', '722d7c8b-347e-4912-834b-6773f04546a8', 'adf4f589-e657-4aea-b5c7-f2ad433ce31c', 'Submitted work for CS101.', 'submitted', '2026-07-20T12:00:00.000Z', NULL, NULL, NULL, NULL),
  ('6171c2d7-3fce-4919-ad79-ac7ab61b96f9', '7693bd57-a156-451d-bd17-e7939f691b96', '11847ffa-b28f-4e5a-9025-ae79a5f6c4bd', 'Submitted work for IT220.', 'graded', '2026-07-20T12:00:00.000Z', '2026-07-24T12:00:00.000Z', 80, 'c9b5fd0a-a11c-41fc-80d8-19cf55a18401', 'Solid work overall — see inline comments.'),
  ('c0a1bf60-320b-478b-893f-ac4c50a62189', 'd83e4aa6-e029-4ed0-b8b4-479663505181', 'aa963deb-79c7-475c-9f01-8b0c88b63dfb', 'Submitted work for GD150.', 'submitted', '2026-07-20T12:00:00.000Z', NULL, NULL, NULL, NULL),
  ('9abde907-8016-4a5e-987d-233d3ee1dca5', '600542fa-47d1-4558-a663-f21c8c0224af', 'bcc7aad5-540f-49d1-ba8d-b30ef991da07', 'Submitted work for IS201.', 'graded', '2026-07-20T12:00:00.000Z', '2026-07-24T12:00:00.000Z', 82, '4eb89314-94c7-4b47-a0a7-c31200d389d3', 'Solid work overall — see inline comments.'),
  ('1fb85722-cfbd-4d8f-aa44-851d53a8c29f', '722d7c8b-347e-4912-834b-6773f04546a8', '836890fc-46da-4a02-9edb-8db1a74d822a', 'Submitted work for CS101.', 'submitted', '2026-07-20T12:00:00.000Z', NULL, NULL, NULL, NULL),
  ('63d795be-859b-4360-81be-6632899e2425', '7693bd57-a156-451d-bd17-e7939f691b96', 'a292dc80-b126-468f-9db8-43c3280723ca', 'Submitted work for IT220.', 'graded', '2026-07-20T12:00:00.000Z', '2026-07-24T12:00:00.000Z', 84, 'c9b5fd0a-a11c-41fc-80d8-19cf55a18401', 'Solid work overall — see inline comments.'),
  ('2f1f571a-5b4d-402c-81a6-ff32c5910a76', 'd83e4aa6-e029-4ed0-b8b4-479663505181', '3f04b4a8-daaf-4637-a9ed-40c8f1b956ec', 'Submitted work for GD150.', 'submitted', '2026-07-20T12:00:00.000Z', NULL, NULL, NULL, NULL),
  ('647a2ea3-b58a-460b-bdca-aa33e9a8dd51', '600542fa-47d1-4558-a663-f21c8c0224af', '49a520c1-ee5a-4375-a035-09b66ba2e1d6', 'Submitted work for IS201.', 'graded', '2026-07-20T12:00:00.000Z', '2026-07-24T12:00:00.000Z', 86, '4eb89314-94c7-4b47-a0a7-c31200d389d3', 'Solid work overall — see inline comments.'),
  ('7bc36106-847e-49bc-b1cb-4358dcfeae18', '722d7c8b-347e-4912-834b-6773f04546a8', '8907ff1b-49b9-4d33-a05a-3de788b5f336', 'Submitted work for CS101.', 'submitted', '2026-07-20T12:00:00.000Z', NULL, NULL, NULL, NULL);

