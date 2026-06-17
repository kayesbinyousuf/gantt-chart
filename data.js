/* ============================================================
   SEED DATA — Default project plans
   This is only used the FIRST time the site loads (or after Reset).
   After that, everything is read from localStorage so user edits persist.
   ============================================================ */

const SEED_PROJECTS = [
  {
    id: "chanachur-line",
    name: "Chanachur Line",
    color: "#2E5F8A",
    description: "New mixed-namkeen extrusion & seasoning line — capacity build-out and commissioning.",
    tasks: [
      { id: "ch-01", name: "Market demand & SKU finalization", owner: "Rafiq (Product)", start: "2026-04-06", end: "2026-04-17", progress: 100, status: "completed", priority: "High" },
      { id: "ch-02", name: "Line layout & space planning", owner: "Tania (Engineering)", start: "2026-04-13", end: "2026-04-27", progress: 100, status: "completed", priority: "High" },
      { id: "ch-03", name: "Extruder & seasoning drum procurement", owner: "Procurement", start: "2026-04-20", end: "2026-05-22", progress: 80, status: "on-track", priority: "Critical" },
      { id: "ch-04", name: "Civil work — foundation & flooring", owner: "Site Team", start: "2026-05-04", end: "2026-05-25", progress: 60, status: "on-track", priority: "High" },
      { id: "ch-05", name: "Electrical & utility connections", owner: "Tania (Engineering)", start: "2026-05-18", end: "2026-06-08", progress: 35, status: "at-risk", priority: "High" },
      { id: "ch-06", name: "Equipment installation", owner: "Vendor Team", start: "2026-06-01", end: "2026-06-19", progress: 10, status: "on-track", priority: "Critical" },
      { id: "ch-07", name: "Seasoning recipe trial runs", owner: "Rafiq (Product)", start: "2026-06-15", end: "2026-06-29", progress: 0, status: "not-started", priority: "Medium" },
      { id: "ch-08", name: "Packaging line integration", owner: "Imran (Packaging)", start: "2026-06-22", end: "2026-07-06", progress: 0, status: "not-started", priority: "Medium" },
      { id: "ch-09", name: "Operator training & SOP rollout", owner: "HR & Training", start: "2026-06-29", end: "2026-07-13", progress: 0, status: "not-started", priority: "Medium" },
      { id: "ch-10", name: "QA & food safety audit", owner: "Quality Team", start: "2026-07-06", end: "2026-07-17", progress: 0, status: "not-started", priority: "High" },
      { id: "ch-11", name: "Pilot batch production", owner: "Production", start: "2026-07-13", end: "2026-07-24", progress: 0, status: "not-started", priority: "Critical" },
      { id: "ch-12", name: "Full commercial launch", owner: "Project Lead", start: "2026-07-27", end: "2026-08-07", progress: 0, status: "not-started", priority: "Critical" }
    ]
  },
  {
    id: "lachcha-line-reorg",
    name: "Lachcha Line Reorganize",
    color: "#D98E2B",
    description: "Reorganizing the lachcha semai line layout to cut changeover time and improve flow.",
    tasks: [
      { id: "lc-01", name: "Current state process mapping", owner: "Process Eng.", start: "2026-03-30", end: "2026-04-10", progress: 100, status: "completed", priority: "High" },
      { id: "lc-02", name: "Bottleneck & downtime analysis", owner: "Process Eng.", start: "2026-04-06", end: "2026-04-17", progress: 100, status: "completed", priority: "High" },
      { id: "lc-03", name: "New floor layout design", owner: "Tania (Engineering)", start: "2026-04-20", end: "2026-05-01", progress: 100, status: "completed", priority: "High" },
      { id: "lc-04", name: "Machine relocation plan & approval", owner: "Plant Manager", start: "2026-04-27", end: "2026-05-08", progress: 90, status: "on-track", priority: "Medium" },
      { id: "lc-05", name: "Frying section reposition", owner: "Maintenance", start: "2026-05-11", end: "2026-05-22", progress: 55, status: "on-track", priority: "High" },
      { id: "lc-06", name: "Drying rack reconfiguration", owner: "Maintenance", start: "2026-05-18", end: "2026-05-29", progress: 40, status: "at-risk", priority: "Medium" },
      { id: "lc-07", name: "Conveyor realignment", owner: "Maintenance", start: "2026-05-25", end: "2026-06-05", progress: 20, status: "on-track", priority: "Medium" },
      { id: "lc-08", name: "Packing station relocation", owner: "Imran (Packaging)", start: "2026-06-01", end: "2026-06-12", progress: 0, status: "not-started", priority: "Low" },
      { id: "lc-09", name: "New SOP & line balancing test", owner: "Process Eng.", start: "2026-06-08", end: "2026-06-19", progress: 0, status: "not-started", priority: "Medium" },
      { id: "lc-10", name: "Operator re-training on new flow", owner: "HR & Training", start: "2026-06-15", end: "2026-06-22", progress: 0, status: "not-started", priority: "Medium" },
      { id: "lc-11", name: "30-day throughput validation", owner: "Plant Manager", start: "2026-06-22", end: "2026-07-20", progress: 0, status: "not-started", priority: "High" }
    ]
  },
  {
    id: "misty-boroi-reorg",
    name: "Misty Boroi Reorganize",
    color: "#5C8A6B",
    description: "Reorganizing the Misty Boroi (sweet plum candy) unit — hygiene zoning, storage and flow redesign.",
    tasks: [
      { id: "mb-01", name: "Hygiene & zoning gap assessment", owner: "Quality Team", start: "2026-04-13", end: "2026-04-24", progress: 100, status: "completed", priority: "High" },
      { id: "mb-02", name: "Raw material storage redesign", owner: "Warehouse", start: "2026-04-20", end: "2026-05-01", progress: 100, status: "completed", priority: "Medium" },
      { id: "mb-03", name: "Syrup coating station revamp", owner: "Maintenance", start: "2026-04-27", end: "2026-05-15", progress: 75, status: "on-track", priority: "High" },
      { id: "mb-04", name: "Cooling tunnel upgrade", owner: "Tania (Engineering)", start: "2026-05-11", end: "2026-05-29", progress: 50, status: "on-track", priority: "High" },
      { id: "mb-05", name: "Cross-contamination control points", owner: "Quality Team", start: "2026-05-18", end: "2026-05-29", progress: 45, status: "at-risk", priority: "Critical" },
      { id: "mb-06", name: "Wrapping machine repositioning", owner: "Imran (Packaging)", start: "2026-05-25", end: "2026-06-05", progress: 20, status: "on-track", priority: "Medium" },
      { id: "mb-07", name: "Pest control & sanitation protocol", owner: "Quality Team", start: "2026-06-01", end: "2026-06-08", progress: 0, status: "not-started", priority: "High" },
      { id: "mb-08", name: "Staff hygiene training", owner: "HR & Training", start: "2026-06-08", end: "2026-06-15", progress: 0, status: "not-started", priority: "Medium" },
      { id: "mb-09", name: "Internal audit & sign-off", owner: "Quality Team", start: "2026-06-15", end: "2026-06-22", progress: 0, status: "not-started", priority: "High" },
      { id: "mb-10", name: "Resume full-scale production", owner: "Plant Manager", start: "2026-06-22", end: "2026-06-29", progress: 0, status: "not-started", priority: "Critical" }
    ]
  },
  {
    id: "extruded-snacks-ext",
    name: "Extruded Snacks Extension",
    color: "#C75450",
    description: "Capacity extension for the extruded snacks category — second extruder line and added warehouse bay.",
    tasks: [
      { id: "es-01", name: "Capacity & ROI feasibility study", owner: "Finance", start: "2026-03-23", end: "2026-04-06", progress: 100, status: "completed", priority: "High" },
      { id: "es-02", name: "Board approval & budget release", owner: "Project Lead", start: "2026-04-06", end: "2026-04-13", progress: 100, status: "completed", priority: "Critical" },
      { id: "es-03", name: "Second extruder — vendor selection", owner: "Procurement", start: "2026-04-13", end: "2026-05-04", progress: 100, status: "completed", priority: "High" },
      { id: "es-04", name: "Warehouse bay extension — civil work", owner: "Site Team", start: "2026-04-27", end: "2026-05-29", progress: 65, status: "on-track", priority: "High" },
      { id: "es-05", name: "Extruder import & customs clearance", owner: "Procurement", start: "2026-05-11", end: "2026-06-12", progress: 40, status: "at-risk", priority: "Critical" },
      { id: "es-06", name: "Power load upgrade (transformer)", owner: "Tania (Engineering)", start: "2026-05-18", end: "2026-06-08", progress: 30, status: "on-track", priority: "High" },
      { id: "es-07", name: "Installation & mechanical alignment", owner: "Vendor Team", start: "2026-06-15", end: "2026-07-03", progress: 0, status: "not-started", priority: "Critical" },
      { id: "es-08", name: "Automation & PLC integration", owner: "Tania (Engineering)", start: "2026-06-29", end: "2026-07-17", progress: 0, status: "not-started", priority: "High" },
      { id: "es-09", name: "Trial runs & calibration", owner: "Production", start: "2026-07-13", end: "2026-07-27", progress: 0, status: "not-started", priority: "Medium" },
      { id: "es-10", name: "Output & yield validation", owner: "Process Eng.", start: "2026-07-24", end: "2026-08-03", progress: 0, status: "not-started", priority: "Medium" },
      { id: "es-11", name: "Operator hiring & training", owner: "HR & Training", start: "2026-07-06", end: "2026-07-31", progress: 0, status: "not-started", priority: "Medium" },
      { id: "es-12", name: "Go-live — second line commercial run", owner: "Plant Manager", start: "2026-08-03", end: "2026-08-14", progress: 0, status: "not-started", priority: "Critical" }
    ]
  },
  {
    id: "raj4-factory-planning",
    name: "Raj4 Factory Planning",
    color: "#6B4FA0",
    description: "Master planning for the new Raj4 factory site — land, permits, design and groundbreaking readiness.",
    tasks: [
      { id: "r4-01", name: "Site selection & land due diligence", owner: "Project Lead", start: "2026-02-02", end: "2026-03-06", progress: 100, status: "completed", priority: "Critical" },
      { id: "r4-02", name: "Environmental clearance application", owner: "Legal & Compliance", start: "2026-03-02", end: "2026-04-17", progress: 100, status: "completed", priority: "Critical" },
      { id: "r4-03", name: "Master site layout & architecture", owner: "Tania (Engineering)", start: "2026-03-23", end: "2026-04-24", progress: 90, status: "on-track", priority: "High" },
      { id: "r4-04", name: "Local govt. & utility permits", owner: "Legal & Compliance", start: "2026-04-13", end: "2026-05-22", progress: 60, status: "on-track", priority: "Critical" },
      { id: "r4-05", name: "Structural & MEP design finalization", owner: "External Architect", start: "2026-04-27", end: "2026-06-05", progress: 45, status: "on-track", priority: "High" },
      { id: "r4-06", name: "Contractor tender & selection", owner: "Procurement", start: "2026-05-11", end: "2026-06-19", progress: 25, status: "at-risk", priority: "High" },
      { id: "r4-07", name: "Site grading & access road", owner: "Site Team", start: "2026-06-01", end: "2026-06-26", progress: 5, status: "on-track", priority: "Medium" },
      { id: "r4-08", name: "Water & power infrastructure plan", owner: "Tania (Engineering)", start: "2026-06-08", end: "2026-07-03", progress: 0, status: "not-started", priority: "High" },
      { id: "r4-09", name: "Capex budget lock & financing", owner: "Finance", start: "2026-06-15", end: "2026-07-10", progress: 0, status: "not-started", priority: "Critical" },
      { id: "r4-10", name: "Groundbreaking ceremony readiness", owner: "Project Lead", start: "2026-07-13", end: "2026-07-24", progress: 0, status: "not-started", priority: "Medium" },
      { id: "r4-11", name: "Phase-1 construction kickoff", owner: "Site Team", start: "2026-07-27", end: "2026-08-21", progress: 0, status: "not-started", priority: "Critical" }
    ]
  }
];

const STATUS_OPTIONS = [
  { value: "not-started", label: "Not Started" },
  { value: "on-track", label: "On Track" },
  { value: "at-risk", label: "At Risk" },
  { value: "delayed", label: "Delayed" },
  { value: "completed", label: "Completed" }
];

const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"];
